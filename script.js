
// ============================================================
// PROJECT 5 — VIRTUAL DJ DECK
// PHASE 1 — BASIC TWO-DECK DJ PLAYER
// ============================================================

// -----------------------------
// MUSIC LIBRARY
// -----------------------------
// Put your audio files inside the "music" folder.
// Then add their filenames here.
//
// Example:
// "music/song1.mp3"
// "music/song2.mp3"

const songs = [
    {
        title: "Track 01",
        artist: "Unknown Artist",
        file: "music/song01.mp3"
    },
    {
        title: "Track 02",
        artist: "Unknown Artist",
        file: "music/song02.mp3"
    },
    {
        title: "Track 03",
        artist: "Unknown Artist",
        file: "music/song03.mp3"
    },
    {
        title: "Track 04",
        artist: "Unknown Artist",
        file: "music/song04.mp3"
    },
    {
        title: "Track 05",
        artist: "Unknown Artist",
        file: "music/song05.mp3"
    }
];


// ============================================================
// DJ DECK CLASS
// ============================================================

class DJDeck {

    constructor(deckNumber) {

        this.deckNumber = deckNumber;
        this.audio = new Audio();

        this.currentSongIndex = -1;
        this.isPlaying = false;

        this.volume = 1;
        this.audio.volume = this.volume;

        this.initialize();
    }


    // --------------------------------------------------------
    // FIND HTML ELEMENTS
    // --------------------------------------------------------

    initialize() {

        this.playButton =
            document.querySelector(`#play${this.deckNumber}`);

        this.pauseButton =
            document.querySelector(`#pause${this.deckNumber}`);

        this.stopButton =
            document.querySelector(`#stop${this.deckNumber}`);

        this.nextButton =
            document.querySelector(`#next${this.deckNumber}`);

        this.previousButton =
            document.querySelector(`#previous${this.deckNumber}`);

        this.volumeSlider =
            document.querySelector(`#volume${this.deckNumber}`);

        this.progressBar =
            document.querySelector(`#progress${this.deckNumber}`);

        this.titleElement =
            document.querySelector(`#title${this.deckNumber}`);

        this.artistElement =
            document.querySelector(`#artist${this.deckNumber}`);

        this.timeElement =
            document.querySelector(`#time${this.deckNumber}`);

        this.durationElement =
            document.querySelector(`#duration${this.deckNumber}`);


        this.connectControls();
        this.connectAudioEvents();
    }


    // --------------------------------------------------------
    // CONNECT BUTTONS
    // --------------------------------------------------------

    connectControls() {

        if (this.playButton) {

            this.playButton.addEventListener("click", () => {
                this.play();
            });

        }


        if (this.pauseButton) {

            this.pauseButton.addEventListener("click", () => {
                this.pause();
            });

        }


        if (this.stopButton) {

            this.stopButton.addEventListener("click", () => {
                this.stop();
            });

        }


        if (this.nextButton) {

            this.nextButton.addEventListener("click", () => {
                this.next();
            });

        }


        if (this.previousButton) {

            this.previousButton.addEventListener("click", () => {
                this.previous();
            });

        }


        if (this.volumeSlider) {

            this.volumeSlider.addEventListener("input", (event) => {

                const value = Number(event.target.value);

                this.setVolume(value);

            });

        }


        if (this.progressBar) {

            this.progressBar.addEventListener("input", (event) => {

                this.seek(Number(event.target.value));

            });

        }

    }


    // --------------------------------------------------------
    // AUDIO EVENTS
    // --------------------------------------------------------

    connectAudioEvents() {

        this.audio.addEventListener("loadedmetadata", () => {

            if (this.durationElement) {

                this.durationElement.textContent =
                    this.formatTime(this.audio.duration);

            }

            if (this.progressBar) {

                this.progressBar.max = this.audio.duration;

            }

        });


        this.audio.addEventListener("timeupdate", () => {

            this.updateProgress();
            this.updateTime();

        });


        this.audio.addEventListener("play", () => {

            this.isPlaying = true;

            this.updatePlayState();

        });


        this.audio.addEventListener("pause", () => {

            this.isPlaying = false;

            this.updatePlayState();

        });


        this.audio.addEventListener("ended", () => {

            this.isPlaying = false;

            this.updatePlayState();

            this.next();

        });

    }


    // ========================================================
    // LOAD SONG
    // ========================================================

    loadSong(index) {

        if (songs.length === 0) {

            console.warn("No songs available.");

            return;

        }


        if (index < 0) {
            index = songs.length - 1;
        }


        if (index >= songs.length) {
            index = 0;
        }


        this.currentSongIndex = index;


        const song = songs[index];


        this.audio.src = song.file;

        this.audio.load();


        if (this.titleElement) {

            this.titleElement.textContent =
                song.title;

        }


        if (this.artistElement) {

            this.artistElement.textContent =
                song.artist;

        }


        if (this.progressBar) {

            this.progressBar.value = 0;

        }


        if (this.timeElement) {

            this.timeElement.textContent = "0:00";

        }


        if (this.durationElement) {

            this.durationElement.textContent = "0:00";

        }


        this.updatePlaylistSelection();


        console.log(
            `Deck ${this.deckNumber}: Loaded ${song.title}`
        );

    }


    // ========================================================
    // PLAY
    // ========================================================

    play() {

        if (!this.audio.src) {

            this.loadSong(0);

        }


        const promise = this.audio.play();


        if (promise !== undefined) {

            promise.catch(error => {

                console.warn(
                    "Playback could not start:",
                    error
                );

            });

        }

    }


    // ========================================================
    // PAUSE
    // ========================================================

    pause() {

        this.audio.pause();

    }


    // ========================================================
    // STOP
    // ========================================================

    stop() {

        this.audio.pause();

        this.audio.currentTime = 0;

        this.updateProgress();
        this.updateTime();

    }


    // ========================================================
    // NEXT TRACK
    // ========================================================

    next() {

        if (songs.length === 0) {
            return;
        }


        let nextIndex =
            this.currentSongIndex + 1;


        if (nextIndex >= songs.length) {

            nextIndex = 0;

        }


        this.loadSong(nextIndex);

        this.play();

    }


    // ========================================================
    // PREVIOUS TRACK
    // ========================================================

    previous() {

        if (songs.length === 0) {
            return;
        }


        let previousIndex =
            this.currentSongIndex - 1;


        if (previousIndex < 0) {

            previousIndex = songs.length - 1;

        }


        this.loadSong(previousIndex);

        this.play();

    }


    // ========================================================
    // VOLUME
    // ========================================================

    setVolume(value) {

        value = Math.max(
            0,
            Math.min(1, value)
        );


        this.volume = value;

        this.audio.volume = value;


        console.log(
            `Deck ${this.deckNumber} volume:`,
            value
        );

    }


    // ========================================================
    // SEEK
    // ========================================================

    seek(time) {

        if (!isNaN(this.audio.duration)) {

            this.audio.currentTime = time;

        }

    }


    // ========================================================
    // UPDATE PROGRESS BAR
    // ========================================================

    updateProgress() {

        if (!this.progressBar) {
            return;
        }


        if (!isNaN(this.audio.duration)) {

            this.progressBar.max =
                this.audio.duration;

            this.progressBar.value =
                this.audio.currentTime;

        }

    }


    // ========================================================
    // UPDATE TIME
    // ========================================================

    updateTime() {

        if (!this.timeElement) {
            return;
        }


        this.timeElement.textContent =
            this.formatTime(this.audio.currentTime);

    }


    // ========================================================
    // PLAY BUTTON STATE
    // ========================================================

    updatePlayState() {

        if (!this.playButton) {
            return;
        }


        if (this.isPlaying) {

            this.playButton.classList.add("playing");

        } else {

            this.playButton.classList.remove("playing");

        }

    }


    // ========================================================
    // PLAYLIST SELECTION
    // ========================================================

    updatePlaylistSelection() {

        document
            .querySelectorAll(".playlist-song")
            .forEach(item => {

                item.classList.remove("active");

            });


        const selected =
            document.querySelector(
                `.playlist-song[data-index="${this.currentSongIndex}"]`
            );


        if (selected) {

            selected.classList.add("active");

        }

    }


    // ========================================================
    // TIME FORMATTER
    // ========================================================

    formatTime(seconds) {

        if (
            !seconds ||
            isNaN(seconds) ||
            seconds < 0
        ) {

            return "0:00";

        }


        const minutes =
            Math.floor(seconds / 60);


        const remainingSeconds =
            Math.floor(seconds % 60);


        return `${minutes}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;

    }

}


// ============================================================
// CREATE TWO DJ DECKS
// ============================================================

const deckA = new DJDeck("A");
const deckB = new DJDeck("B");


// ============================================================
// PLAYLIST
// ============================================================

const playlist =
    document.querySelector("#playlist");


// ------------------------------------------------------------
// CREATE PLAYLIST
// ------------------------------------------------------------

function createPlaylist() {

    if (!playlist) {

        console.warn(
            "Playlist element #playlist was not found."
        );

        return;

    }


    playlist.innerHTML = "";


    songs.forEach((song, index) => {

        const item =
            document.createElement("div");


        item.className =
            "playlist-song";


        item.dataset.index =
            index;


        item.innerHTML = `

            <div class="playlist-number">
                ${String(index + 1).padStart(2, "0")}
            </div>

            <div class="playlist-information">

                <div class="playlist-title">
                    ${song.title}
                </div>

                <div class="playlist-artist">
                    ${song.artist}
                </div>

            </div>

            <button
                class="playlist-load-a"
                data-index="${index}"
                title="Load to Deck A">
                A
            </button>

            <button
                class="playlist-load-b"
                data-index="${index}"
                title="Load to Deck B">
                B
            </button>

        `;


        playlist.appendChild(item);

    });


    connectPlaylistButtons();

}


// ============================================================
// PLAYLIST BUTTONS
// ============================================================

function connectPlaylistButtons() {

    const deckAButtons =
        document.querySelectorAll(
            ".playlist-load-a"
        );


    deckAButtons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                const index =
                    Number(
                        button.dataset.index
                    );

                deckA.loadSong(index);

            }
        );

    });


    const deckBButtons =
        document.querySelectorAll(
            ".playlist-load-b"
        );


    deckBButtons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                const index =
                    Number(
                        button.dataset.index
                    );

                deckB.loadSong(index);

            }
        );

    });


    document
        .querySelectorAll(".playlist-song")
        .forEach(item => {

            item.addEventListener(
                "dblclick",
                () => {

                    const index =
                        Number(item.dataset.index);

                    deckA.loadSong(index);

                    deckA.play();

                }
            );

        });

}


// ============================================================
// MASTER CROSSfADER
// ============================================================

const crossfader =
    document.querySelector("#crossfader");


if (crossfader) {

    crossfader.addEventListener(
        "input",
        event => {

            const value =
                Number(event.target.value);

            updateCrossfader(value);

        }
    );

}


// ------------------------------------------------------------
// CROSSfADER LOGIC
// ------------------------------------------------------------

function updateCrossfader(value) {

    // Expected range: -1 to +1
    //
    // -1 = Deck A
    //  0 = Both
    // +1 = Deck B


    let volumeA = 1;
    let volumeB = 1;


    if (value < 0) {

        volumeA = 1;

        volumeB = 1 + value;

    } else {

        volumeA = 1 - value;

        volumeB = 1;

    }


    deckA.audio.volume =
        deckA.volume * volumeA;


    deckB.audio.volume =
        deckB.volume * volumeB;

}


// ============================================================
// MASTER VOLUME
// ============================================================

const masterVolume =
    document.querySelector("#masterVolume");


if (masterVolume) {

    masterVolume.addEventListener(
        "input",
        event => {

            const value =
                Number(event.target.value);

            deckA.audio.volume =
                deckA.volume * getCrossfadeA();


            deckB.audio.volume =
                deckB.volume * getCrossfadeB();

        }
    );

}


// ============================================================
// CROSSfADER HELPERS
// ============================================================

let currentCrossfader = 0;


function getCrossfadeA() {

    if (currentCrossfader < 0) {

        return 1;

    }

    return 1 - currentCrossfader;

}


function getCrossfadeB() {

    if (currentCrossfader > 0) {

        return 1;

    }

    return 1 + currentCrossfader;

}


// ============================================================
// KEYBOARD CONTROLS
// ============================================================

document.addEventListener(
    "keydown",
    event => {

        // SPACE = play/pause Deck A

        if (
            event.code === "Space" &&
            !isTyping()
        ) {

            event.preventDefault();


            if (deckA.isPlaying) {

                deckA.pause();

            } else {

                deckA.play();

            }

        }


        // LEFT ARROW = previous

        if (
            event.code === "ArrowLeft" &&
            !isTyping()
        ) {

            deckA.previous();

        }


        // RIGHT ARROW = next

        if (
            event.code === "ArrowRight" &&
            !isTyping()
        ) {

            deckA.next();

        }

    }
);


// ============================================================
// CHECK IF USER IS TYPING
// ============================================================

function isTyping() {

    const element =
        document.activeElement;


    if (!element) {
        return false;
    }


    return (
        element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA" ||
        element.isContentEditable
    );

}


// ============================================================
// INITIALIZE
// ============================================================

function initializeDJ() {

    createPlaylist();


    // Load the first two tracks

    if (songs.length > 0) {

        deckA.loadSong(0);

    }


    if (songs.length > 1) {

        deckB.loadSong(1);

    }


    console.log(
        "🎧 Project 5 Virtual DJ initialized."
    );

}


document.addEventListener(
    "DOMContentLoaded",
    initializeDJ
);
