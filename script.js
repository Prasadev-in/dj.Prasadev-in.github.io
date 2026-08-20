// ============================================
// DJ DECK - Main Script
// ============================================

class DJDeck {
    constructor() {
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.audio = null;
        this.timer = null;
        this.currentTime = 0;
        this.setDuration = 3600; // 1 hour in seconds
        this.transitionWindow = 30; // seconds before track ends to suggest transition
        
        // DOM Elements
        this.elements = {
            playlist: document.getElementById('playlist'),
            currentTrack: document.getElementById('current-track'),
            playBtn: document.getElementById('play-btn'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            progress: document.getElementById('progress'),
            timeCurrent: document.getElementById('time-current'),
            timeTotal: document.getElementById('time-total'),
            bpmDisplay: document.getElementById('bpm-display'),
            keyDisplay: document.getElementById('key-display'),
            suggestion: document.getElementById('suggestion'),
            setBuilder: document.getElementById('set-builder'),
            visualizer: document.getElementById('visualizer'),
            fileInput: document.getElementById('file-input'),
            uploadBtn: document.getElementById('upload-btn'),
            buildSetBtn: document.getElementById('build-set-btn')
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadDemoTracks();
        this.renderPlaylist();
        this.updateUI();
        this.setupVisualizer();
    }
    
    loadDemoTracks() {
        // Replace these with your actual songs from /songs folder
        // Add your own tracks here with correct BPM values
        this.playlist = [
            { 
                id: 1, 
                title: 'Midnight Groove', 
                artist: 'DJ Shadow', 
                bpm: 124, 
                key: 'A♭ min', 
                duration: 240,
                file: 'songs/track1.mp3',
                energy: 7,
                genre: 'House'
            },
            { 
                id: 2, 
                title: 'Neon Lights', 
                artist: 'Synthwave', 
                bpm: 126, 
                key: 'C maj', 
                duration: 210,
                file: 'songs/track2.mp3',
                energy: 8,
                genre: 'Techno'
            },
            { 
                id: 3, 
                title: 'Deep Blue', 
                artist: 'Ocean Drive', 
                bpm: 123, 
                key: 'E♭ min', 
                duration: 195,
                file: 'songs/track3.mp3',
                energy: 6,
                genre: 'Deep House'
            },
            { 
                id: 4, 
                title: 'Pulse', 
                artist: 'Neon Rhythm', 
                bpm: 128, 
                key: 'F maj', 
                duration: 280,
                file: 'songs/track4.mp3',
                energy: 9,
                genre: 'Drum & Bass'
            },
            { 
                id: 5, 
                title: 'Echoes', 
                artist: 'Dusty Decks', 
                bpm: 125, 
                key: 'G min', 
                duration: 215,
                file: 'songs/track5.mp3',
                energy: 7,
                genre: 'Tech House'
            }
        ];
        
        // Calculate transition scores
        this.calculateAllTransitions();
    }
    
    calculateAllTransitions() {
        this.playlist.forEach((track, index) => {
            if (index < this.playlist.length - 1) {
                track.transitionScore = this.calculateTransitionScore(track, this.playlist[index + 1]);
            }
        });
    }
    
    calculateTransitionScore(track1, track2) {
        let score = 0;
        
        // BPM compatibility (within 4 BPM = good)
        const bpmDiff = Math.abs(track1.bpm - track2.bpm);
        if (bpmDiff <= 2) score += 40;
        else if (bpmDiff <= 4) score += 20;
        else if (bpmDiff <= 6) score += 10;
        
        // Key compatibility (simplified)
        const keys = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
        const key1 = track1.key.split(' ')[0];
        const key2 = track2.key.split(' ')[0];
        const keyDiff = Math.abs(keys.indexOf(key1) - keys.indexOf(key2));
        if (keyDiff === 0 || keyDiff === 5 || keyDiff === 7) score += 30;
        else if (keyDiff <= 2 || keyDiff === 10) score += 15;
        
        // Energy compatibility
        const energyDiff = Math.abs(track1.energy - track2.energy);
        if (energyDiff <= 1) score += 20;
        else if (energyDiff <= 2) score += 10;
        
        // Genre compatibility
        if (track1.genre === track2.genre) score += 10;
        
        return Math.min(100, score);
    }
    
    setupEventListeners() {
        this.elements.playBtn.addEventListener('click', () => this.togglePlay());
        this.elements.prevBtn.addEventListener('click', () => this.previousTrack());
        this.elements.nextBtn.addEventListener('click', () => this.nextTrack());
        
        // Progress bar seeking
        this.elements.progress.addEventListener('input', (e) => {
            if (this.audio) {
                const seekTime = (e.target.value / 100) * this.getCurrentTrack().duration;
                this.audio.currentTime = seekTime;
                this.currentTime = seekTime;
            }
        });
        
        // File upload
        this.elements.uploadBtn.addEventListener('click', () => {
            this.elements.fileInput.click();
        });
        
        this.elements.fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
            this.elements.fileInput.value = ''; // Reset for multiple uploads
        });
        
        // Build set button
        this.elements.buildSetBtn.addEventListener('click', () => {
            this.buildOneHourSet();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            }
            if (e.code === 'ArrowRight') this.nextTrack();
            if (e.code === 'ArrowLeft') this.previousTrack();
        });
    }
    
    handleFileUpload(files) {
        Array.from(files).forEach(file => {
            // Only process audio files
            if (!file.type.startsWith('audio/')) return;
            
            const track = {
                id: Date.now() + Math.random(),
                title: file.name.replace(/\.[^/.]+$/, ''),
                artist: 'Unknown Artist',
                bpm: Math.floor(Math.random() * 20) + 115, // Placeholder - you can edit
                key: ['C maj', 'D min', 'E maj', 'F min', 'G maj', 'A min', 'B maj'][Math.floor(Math.random() * 7)],
                duration: 180, // Placeholder - will update when loaded
                file: URL.createObjectURL(file),
                energy: Math.floor(Math.random() * 5) + 5,
                genre: 'Electronic',
                isUploaded: true
            };
            
            // Try to get actual duration
            const audio = new Audio();
            audio.src = track.file;
            audio.addEventListener('loadedmetadata', () => {
                track.duration = Math.floor(audio.duration);
                this.renderPlaylist();
                this.updateUI();
            });
            
            this.playlist.push(track);
        });
        
        this.calculateAllTransitions();
        this.renderPlaylist();
        this.updateUI();
        this.suggestNextTrack();
    }
    
    renderPlaylist() {
        if (this.playlist.length === 0) {
            this.elements.playlist.innerHTML = `<p class="empty-message">🎵 No tracks yet. Upload some!</p>`;
            return;
        }
        
        const html = this.playlist.map((track, index) => `
            <div class="playlist-item ${index === this.currentTrackIndex ? 'active' : ''}" 
                 onclick="dj.selectTrack(${index})">
                <span class="track-number">${index + 1}</span>
                <span class="track-title">${track.title}</span>
                <span class="track-artist">${track.artist}</span>
                <span class="track-bpm">${track.bpm} BPM</span>
                <span class="track-key">${track.key}</span>
                <span class="track-duration">${this.formatTime(track.duration)}</span>
                ${track.transitionScore ? `<span class="transition-score">⚡${track.transitionScore}%</span>` : ''}
                ${track.isUploaded ? '<span class="badge-uploaded">📤</span>' : ''}
            </div>
        `).join('');
        this.elements.playlist.innerHTML = html;
    }
    
    selectTrack(index) {
        if (this.isPlaying) {
            this.pauseTrack();
        }
        this.currentTrackIndex = index;
        this.currentTime = 0;
        this.renderPlaylist();
        this.updateUI();
        this.suggestNextTrack();
    }
    
    togglePlay() {
        if (this.playlist.length === 0) {
            this.showSuggestion('⚠️ No tracks in playlist! Upload some songs first.', '#fff3cd');
            return;
        }
        
        if (this.isPlaying) {
            this.pauseTrack();
        } else {
            this.playTrack();
        }
    }
    
    playTrack() {
        const track = this.getCurrentTrack();
        if (!track) return;
        
        // Create audio element
        this.audio = new Audio(track.file);
        this.audio.currentTime = this.currentTime;
        this.audio.play();
        this.isPlaying = true;
        this.elements.playBtn.textContent = '⏸';
        this.elements.playBtn.classList.add('playing');
        
        // Update progress
        this.updateProgress();
        this.visualize();
        this.suggestNextTrack();
        
        // Auto-advance when track ends
        this.audio.addEventListener('ended', () => {
            this.nextTrack();
        });
    }
    
    pauseTrack() {
        if (this.audio) {
            this.audio.pause();
            this.currentTime = this.audio.currentTime;
        }
        this.isPlaying = false;
        this.elements.playBtn.textContent = '▶';
        this.elements.playBtn.classList.remove('playing');
        clearInterval(this.timer);
    }
    
    previousTrack() {
        if (this.currentTrackIndex > 0) {
            this.currentTrackIndex--;
            this.currentTime = 0;
            if (this.isPlaying) {
                this.pauseTrack();
                this.playTrack();
            } else {
                this.selectTrack(this.currentTrackIndex);
            }
        }
    }
    
    nextTrack() {
        if (this.currentTrackIndex < this.playlist.length - 1) {
            this.currentTrackIndex++;
            this.currentTime = 0;
            if (this.isPlaying) {
                this.pauseTrack();
                this.playTrack();
            } else {
                this.selectTrack(this.currentTrackIndex);
            }
        } else {
            // Loop back to start
            this.currentTrackIndex = 0;
            this.currentTime = 0;
            if (this.isPlaying) {
                this.pauseTrack();
                this.playTrack();
            } else {
                this.selectTrack(0);
            }
        }
    }
    
    getCurrentTrack() {
        return this.playlist[this.currentTrackIndex];
    }
    
    updateUI() {
        const track = this.getCurrentTrack();
        if (track) {
            this.elements.currentTrack.innerHTML = `
                <strong>${track.title}</strong> 
                <span style="color: #888;">by ${track.artist}</span>
                <span style="font-size: 0.8em; color: #888; margin-left: 10px;">
                    ${track.bpm} BPM | ${track.key}
                </span>
            `;
            this.elements.bpmDisplay.textContent = `${track.bpm} BPM`;
            this.elements.keyDisplay.textContent = track.key;
            this.elements.timeTotal.textContent = this.formatTime(track.duration);
            this.elements.progress.value = 0;
            this.elements.timeCurrent.textContent = '0:00';
        }
    }
    
    updateProgress() {
        clearInterval(this.timer);
        
        this.timer = setInterval(() => {
            if (this.audio && this.isPlaying) {
                const track = this.getCurrentTrack();
                if (!track) return;
                
                const progress = (this.audio.currentTime / track.duration) * 100;
                this.elements.progress.value = progress;
                this.elements.timeCurrent.textContent = this.formatTime(this.audio.currentTime);
                
                // Check if we're in transition window
                const remaining = track.duration - this.audio.currentTime;
                if (remaining <= this.transitionWindow && remaining > 0) {
                    this.showTransitionAlert();
                }
            }
        }, 100);
    }
    
    showTransitionAlert() {
        const nextTrack = this.playlist[this.currentTrackIndex + 1];
        if (nextTrack) {
            const current = this.getCurrentTrack();
            const score = this.calculateTransitionScore(current, nextTrack);
            this.showSuggestion(
                `⚡ TRANSITION SOON: Mix into "<strong>${nextTrack.title}</strong>" 
                (${current.bpm} → ${nextTrack.bpm} BPM) 
                <br><small>Compatibility: ${score}% • Mix at: 8 bars before end</small>`,
                '#fff3cd'
            );
        }
    }
    
    suggestNextTrack() {
        const current = this.getCurrentTrack();
        if (!current || this.playlist.length < 2) {
            this.showSuggestion('💡 Add more tracks for smart suggestions!', '#e8f4f8');
            return;
        }
        
        // Find best matching next track
        let bestMatch = null;
        let bestScore = 0;
        
        this.playlist.forEach((track, index) => {
            if (index === this.currentTrackIndex) return;
            const score = this.calculateTransitionScore(current, track);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = track;
            }
        });
        
        if (bestMatch) {
            this.showSuggestion(
                `🎯 Next up: <strong>${bestMatch.title}</strong> 
                (${bestMatch.artist}) - ${bestMatch.bpm} BPM | ${bestMatch.key}
                <br><small>Compatibility: ${bestScore}% • Mix at: 16 bars before end</small>`,
                '#d4edda'
            );
        }
    }
    
    showSuggestion(message, bgColor = '#f8f9fa') {
        this.elements.suggestion.innerHTML = message;
        this.elements.suggestion.style.background = bgColor;
    }
    
    buildOneHourSet() {
        if (this.playlist.length < 3) {
            this.showSuggestion('⚠️ Need at least 3 tracks to build a set!', '#fff3cd');
            return;
        }
        
        const setList = [];
        let totalTime = 0;
        let remaining = this.setDuration;
        let available = [...this.playlist];
        
        // Start with a high-energy track
        let current = available.sort((a, b) => b.energy - a.energy)[0];
        setList.push(current);
        totalTime += current.duration;
        remaining -= current.duration;
        available = available.filter(t => t.id !== current.id);
        
        // Build the set
        let attempts = 0;
        while (remaining > 0 && available.length > 0 && attempts < 50) {
            attempts++;
            
            // Find best match for current track
            let bestMatch = null;
            let bestScore = 0;
            
            available.forEach(track => {
                const score = this.calculateTransitionScore(current, track);
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = track;
                }
            });
            
            if (!bestMatch) break;
            
            setList.push(bestMatch);
            totalTime += bestMatch.duration;
            remaining -= bestMatch.duration;
            current = bestMatch;
            available = available.filter(t => t.id !== current.id);
        }
        
        // Display the set
        this.elements.setBuilder.style.display = 'block';
        this.elements.setBuilder.innerHTML = `
            <div class="set-header">
                <h3>🎵 1-Hour Set</h3>
                <span class="set-duration">${Math.floor(totalTime / 60)} min ${Math.floor(totalTime % 60)} sec</span>
                <span class="set-tracks">${setList.length} tracks</span>
            </div>
            <ol class="set-list">
                ${setList.map((track, i) => `
                    <li class="set-item">
                        <span class="set-track-number">${i + 1}</span>
                        <span class="set-track-title">${track.title}</span>
                        <span class="set-track-artist">${track.artist}</span>
                        <span class="set-track-details">${track.bpm} BPM | ${track.key}</span>
                        ${i < setList.length - 1 ? 
                            `<span class="set-transition">→ ${setList[i+1].bpm} BPM 
                            (⚡${this.calculateTransitionScore(track, setList[i+1])}% match)</span>` : 
                            ''}
                    </li>
                `).join('')}
            </ol>
            <div class="set-actions">
                <button onclick="dj.exportSet()" class="btn-export">📤 Export Set</button>
                <button onclick="dj.elements.setBuilder.style.display='none'" class="btn-close">✕ Close</button>
            </div>
        `;
        
        // Scroll to set builder
        this.elements.setBuilder.scrollIntoView({ behavior: 'smooth' });
    }
    
    exportSet() {
        const setItems = document.querySelectorAll('.set-item');
        if (setItems.length === 0) {
            this.showSuggestion('⚠️ No set to export! Build one first.', '#fff3cd');
            return;
        }
        
        let text = '=== DJ SET LIST ===\n\n';
        setItems.forEach((item, i) => {
            const title = item.querySelector('.set-track-title')?.textContent || 'Track';
            const artist = item.querySelector('.set-track-artist')?.textContent || 'Unknown';
            const details = item.querySelector('.set-track-details')?.textContent || '';
            text += `${i+1}. ${title} - ${artist} (${details})\n`;
        });
        
        const blob = new Blob([text], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `dj-set-${new Date().toISOString().slice(0,10)}.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
        
        this.showSuggestion('✅ Set exported successfully!', '#d4edda');
    }
    
    setupVisualizer() {
        const canvas = this.elements.visualizer;
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.parentElement.clientWidth || 400;
        canvas.height = 80;
        
        this.visualize = () => {
            if (!this.isPlaying || !this.audio) {
                // Draw idle animation
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'rgba(108, 92, 231, 0.1)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                return;
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Get audio data if available
            let dataArray = [];
            if (this.audio && this.audio.context) {
                // Simple visualization using oscillator data
                const analyser = this.audio.context.createAnalyser();
                // This is simplified - real implementation would use Web Audio API
            }
            
            // Random bars for demo (replace with actual audio data in production)
            const bars = 48;
            const barWidth = canvas.width / bars;
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, '#6c5ce7');
            gradient.addColorStop(0.5, '#a29bfe');
            gradient.addColorStop(1, '#6c5ce7');
            
            for (let i = 0; i < bars; i++) {
                const height = Math.random() * canvas.height * 0.8 + 5;
                const x = i * barWidth;
                const y = canvas.height - height;
                
                ctx.fillStyle = gradient;
                ctx.shadowColor = 'rgba(108, 92, 231, 0.3)';
                ctx.shadowBlur = 10;
                ctx.fillRect(x + 1, y, barWidth - 2, height);
                ctx.shadowBlur = 0;
            }
            
            requestAnimationFrame(this.visualize);
        };
        
        // Start idle animation
        this.visualize();
    }
    
    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }
}

// ============================================
// INITIALIZE
// ============================================
const dj = new DJDeck();
window.dj = dj;

console.log('🎧 DJ Deck ready!');
console.log(`📊 ${dj.playlist.length} tracks loaded`);
console.log('💡 Press SPACE to play/pause, ← → to change tracks');
