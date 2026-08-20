// ============================================
// DJ DECK - Main Script (FIXED AUDIO)
// ============================================

class DJDeck {
    constructor() {
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.audio = null;
        this.timer = null;
        this.currentTime = 0;
        this.setDuration = 3600;
        this.transitionWindow = 30;
        
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
        this.showSuggestion('💡 Upload your own songs or use the demo tracks (click Play)', '#e8f4f8');
    }
    
    loadDemoTracks() {
        // These are DEMO tracks - they won't play unless you have these files
        // Use the UPLOAD button to add your own MP3s
        this.playlist = [
            { 
                id: 1, 
                title: '🎵 Demo Track 1', 
                artist: 'Upload your own songs!', 
                bpm: 124, 
                key: 'A♭ min', 
                duration: 30, // Short for demo
                file: null, // No file - will show error
                energy: 7,
                genre: 'House',
                isDemo: true
            },
            { 
                id: 2, 
                title: '🎵 Demo Track 2', 
                artist: 'Click Upload button', 
                bpm: 126, 
                key: 'C maj', 
                duration: 30,
                file: null,
                energy: 8,
                genre: 'Techno',
                isDemo: true
            }
        ];
        
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
        const bpmDiff = Math.abs(track1.bpm - track2.bpm);
        if (bpmDiff <= 2) score += 40;
        else if (bpmDiff <= 4) score += 20;
        else if (bpmDiff <= 6) score += 10;
        
        const keys = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
        const key1 = track1.key.split(' ')[0];
        const key2 = track2.key.split(' ')[0];
        const keyDiff = Math.abs(keys.indexOf(key1) - keys.indexOf(key2));
        if (keyDiff === 0 || keyDiff === 5 || keyDiff === 7) score += 30;
        else if (keyDiff <= 2 || keyDiff === 10) score += 15;
        
        const energyDiff = Math.abs(track1.energy - track2.energy);
        if (energyDiff <= 1) score += 20;
        else if (energyDiff <= 2) score += 10;
        
        if (track1.genre === track2.genre) score += 10;
        
        return Math.min(100, score);
    }
    
    setupEventListeners() {
        this.elements.playBtn.addEventListener('click', () => this.togglePlay());
        this.elements.prevBtn.addEventListener('click', () => this.previousTrack());
        this.elements.nextBtn.addEventListener('click', () => this.nextTrack());
        
        this.elements.progress.addEventListener('input', (e) => {
            if (this.audio && this.audio.duration) {
                const seekTime = (e.target.value / 100) * this.audio.duration;
                this.audio.currentTime = seekTime;
                this.currentTime = seekTime;
            }
        });
        
        // FILE UPLOAD - THIS IS HOW YOU ADD REAL SONGS
        this.elements.uploadBtn.addEventListener('click', () => {
            this.elements.fileInput.click();
        });
        
        this.elements.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files);
                this.elements.fileInput.value = '';
            }
        });
        
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
        const validFiles = Array.from(files).filter(file => file.type.startsWith('audio/'));
        
        if (validFiles.length === 0) {
            this.showSuggestion('⚠️ Please select audio files (MP3, WAV, etc.)', '#fff3cd');
            return;
        }
        
        // Remove demo tracks if they exist
        this.playlist = this.playlist.filter(track => !track.isDemo);
        
        validFiles.forEach(file => {
            const url = URL.createObjectURL(file);
            console.log(`📁 Loaded: ${file.name}`);
            
            const track = {
                id: Date.now() + Math.random(),
                title: file.name.replace(/\.[^/.]+$/, ''),
                artist: 'Unknown Artist',
                bpm: Math.floor(Math.random() * 20) + 115,
                key: ['C maj', 'D min', 'E maj', 'F min', 'G maj', 'A min', 'B maj'][Math.floor(Math.random() * 7)],
                duration: 180,
                file: url,
                energy: Math.floor(Math.random() * 5) + 5,
                genre: 'Electronic',
                isUploaded: true,
                fileName: file.name
            };
            
            // Get actual duration
            const audioTest = new Audio();
            audioTest.src = url;
            audioTest.addEventListener('loadedmetadata', () => {
                track.duration = Math.floor(audioTest.duration);
                this.renderPlaylist();
                this.updateUI();
                console.log(`✅ ${track.title} - ${track.duration} seconds`);
            });
            
            audioTest.addEventListener('error', () => {
                console.warn(`⚠️ Could not load: ${file.name}`);
                track.duration = 30;
            });
            
            this.playlist.push(track);
        });
        
        this.calculateAllTransitions();
        this.renderPlaylist();
        this.updateUI();
        this.suggestNextTrack();
        this.showSuggestion(`✅ Loaded ${validFiles.length} track(s)! Click Play to start`, '#d4edda');
        
        // Auto-play first track if nothing is playing
        if (!this.isPlaying && this.playlist.length > 0) {
            this.selectTrack(0);
        }
    }
    
    renderPlaylist() {
        if (this.playlist.length === 0) {
            this.elements.playlist.innerHTML = `
                <p class="empty-message">🎵 No tracks yet.<br>Click <strong>Upload</strong> to add your MP3s!</p>
            `;
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
                ${track.isDemo ? '<span class="badge-demo">🎵</span>' : ''}
            </div>
        `).join('');
        this.elements.playlist.innerHTML = html;
    }
    
    selectTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;
        
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
            this.showSuggestion('⚠️ No tracks! Click "Upload" to add some songs.', '#fff3cd');
            return;
        }
        
        const track = this.getCurrentTrack();
        if (!track) return;
        
        // Check if track has a valid file
        if (!track.file) {
            this.showSuggestion('⚠️ This track has no audio file. Upload your own songs!', '#fff3cd');
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
        if (!track || !track.file) {
            this.showSuggestion('⚠️ No audio file for this track. Upload your own songs!', '#fff3cd');
            return;
        }
        
        try {
            // Create audio element
            this.audio = new Audio();
            this.audio.src = track.file;
            this.audio.currentTime = this.currentTime;
            
            // Play with error handling
            const playPromise = this.audio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        this.isPlaying = true;
                        this.elements.playBtn.textContent = '⏸';
                        this.elements.playBtn.classList.add('playing');
                        this.updateProgress();
                        this.visualize();
                        this.suggestNextTrack();
                        console.log(`▶️ Playing: ${track.title}`);
                    })
                    .catch(error => {
                        console.error('Playback error:', error);
                        this.showSuggestion(`⚠️ Cannot play: ${error.message}. Try uploading a different file.`, '#f8d7da');
                        this.isPlaying = false;
                        this.elements.playBtn.textContent = '▶';
                        this.elements.playBtn.classList.remove('playing');
                    });
            }
            
            // Auto-advance when track ends
            this.audio.addEventListener('ended', () => {
                console.log('⏹️ Track ended');
                this.nextTrack();
            });
            
            // Handle errors
            this.audio.addEventListener('error', (e) => {
                console.error('Audio error:', e);
                this.showSuggestion('⚠️ Audio error. Try re-uploading the file.', '#f8d7da');
                this.pauseTrack();
            });
            
        } catch (error) {
            console.error('Error creating audio:', error);
            this.showSuggestion('⚠️ Error playing track. Check console for details.', '#f8d7da');
        }
    }
    
    pauseTrack() {
        if (this.audio) {
            try {
                this.audio.pause();
                this.currentTime = this.audio.currentTime || 0;
            } catch (e) {
                console.warn('Pause error:', e);
            }
        }
        this.isPlaying = false;
        this.elements.playBtn.textContent = '▶';
        this.elements.playBtn.classList.remove('playing');
        clearInterval(this.timer);
        console.log('⏸️ Paused');
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
        } else if (this.playlist.length > 0) {
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
        return this.playlist[this.currentTrackIndex] || null;
    }
    
    updateUI() {
        const track = this.getCurrentTrack();
        if (track) {
            this.elements.currentTrack.innerHTML = `
                <strong>${track.title}</strong> 
                ${track.artist !== 'Unknown Artist' ? `<span style="color: #888;">by ${track.artist}</span>` : ''}
                <span style="font-size: 0.8em; color: #888; margin-left: 10px;">
                    ${track.bpm} BPM | ${track.key}
                </span>
                ${track.file ? '' : '<span style="color: #fd79a8; margin-left: 10px;">⚠️ No audio</span>'}
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
            if (this.audio && this.isPlaying && this.audio.duration) {
                const track = this.getCurrentTrack();
                if (!track) return;
                
                const progress = (this.audio.currentTime / this.audio.duration) * 100;
                this.elements.progress.value = progress;
                this.elements.timeCurrent.textContent = this.formatTime(this.audio.currentTime);
                
                const remaining = this.audio.duration - this.audio.currentTime;
                if (remaining <= this.transitionWindow && remaining > 0) {
                    this.showTransitionAlert();
                }
            }
        }, 100);
    }
    
    showTransitionAlert() {
        const nextTrack = this.playlist[this.currentTrackIndex + 1];
        if (nextTrack && nextTrack.file) {
            const current = this.getCurrentTrack();
            const score = this.calculateTransitionScore(current, nextTrack);
            this.showSuggestion(
                `⚡ TRANSITION: Mix into "<strong>${nextTrack.title}</strong>" 
                (${current.bpm} → ${nextTrack.bpm} BPM) 
                <br><small>Compatibility: ${score}% • Mix now!</small>`,
                '#fff3cd'
            );
        }
    }
    
    suggestNextTrack() {
        const current = this.getCurrentTrack();
        if (!current || this.playlist.length < 2) {
            this.showSuggestion('💡 Upload more tracks for smart suggestions!', '#e8f4f8');
            return;
        }
        
        let bestMatch = null;
        let bestScore = 0;
        
        this.playlist.forEach((track, index) => {
            if (index === this.currentTrackIndex) return;
            if (!track.file) return;
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
        const realTracks = this.playlist.filter(t => t.file && !t.isDemo);
        
        if (realTracks.length < 3) {
            this.showSuggestion('⚠️ Need at least 3 uploaded tracks to build a set!', '#fff3cd');
            return;
        }
        
        const setList = [];
        let totalTime = 0;
        let remaining = this.setDuration;
        let available = [...realTracks];
        
        let current = available.sort((a, b) => b.energy - a.energy)[0];
        setList.push(current);
        totalTime += current.duration;
        remaining -= current.duration;
        available = available.filter(t => t.id !== current.id);
        
        let attempts = 0;
        while (remaining > 0 && available.length > 0 && attempts < 50) {
            attempts++;
            
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
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'rgba(108, 92, 231, 0.05)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Idle dots
                for (let i = 0; i < 30; i++) {
                    const x = (i / 30) * canvas.width;
                    const height = 5 + Math.sin(Date.now() / 1000 + i) * 3;
                    ctx.fillStyle = `rgba(108, 92, 231, 0.1)`;
                    ctx.fillRect(x, canvas.height / 2 - height / 2, 3, height);
                }
                requestAnimationFrame(this.visualize);
                return;
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const bars = 48;
            const barWidth = canvas.width / bars;
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, '#6c5ce7');
            gradient.addColorStop(0.5, '#a29bfe');
            gradient.addColorStop(1, '#6c5ce7');
            
            // Get audio data if available via Web Audio API
            let dataArray = [];
            if (this.audio && this.audio.src) {
                try {
                    // Simple visualization using random data for visual effect
                    // Real implementation would use AnalyserNode
                } catch (e) {}
            }
            
            // Animated bars
            for (let i = 0; i < bars; i++) {
                const height = (Math.sin(Date.now() / 200 + i * 0.3) * 0.5 + 0.6) * canvas.height * 0.7 + 10;
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
        
        this.visualize();
    }
    
    formatTime(seconds) {
        if (!seconds || isNaN(seconds) || seconds === Infinity) return '0:00';
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
console.log('📤 Click "Upload" to add your MP3 files');
console.log('💡 Press SPACE to play/pause, ← → to change tracks');
