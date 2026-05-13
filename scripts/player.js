document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('audio');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const miniPlayPauseBtn = document.getElementById('miniPlayPauseBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const trackInfo = document.getElementById('track-info');
    const miniTrack = document.getElementById('mini-track');
    const miniLocutor = document.getElementById('mini-locutor');

    // Play / Pause Logic (Shared)
    const togglePlay = () => {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    };

    if (playPauseBtn && audio) {
        playPauseBtn.addEventListener('click', togglePlay);
    }
    if (miniPlayPauseBtn && audio) {
        miniPlayPauseBtn.addEventListener('click', togglePlay);
    }

    audio.addEventListener('play', () => {
        const pauseHTML = '<i class="fas fa-pause"></i> Pausar';
        const miniPauseHTML = '<i class="fas fa-pause"></i>';
        if(playPauseBtn) playPauseBtn.innerHTML = pauseHTML;
        if(miniPlayPauseBtn) miniPlayPauseBtn.innerHTML = miniPauseHTML;
    });

    audio.addEventListener('pause', () => {
        const playHTML = '<i class="fas fa-play"></i> Reproducir';
        const miniPlayHTML = '<i class="fas fa-play"></i>';
        if(playPauseBtn) playPauseBtn.innerHTML = playHTML;
        if(miniPlayPauseBtn) miniPlayPauseBtn.innerHTML = miniPlayHTML;
    });

    // Volume Slider Logic
    if (volumeSlider && audio) {
        volumeSlider.addEventListener('input', (e) => {
            audio.volume = e.target.value;
        });
        volumeSlider.value = audio.volume;
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
        if (isInput) return;

        switch (e.code) {
            case 'KeyK':
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowUp':
                e.preventDefault();
                audio.volume = Math.min(1, audio.volume + 0.1);
                if(volumeSlider) volumeSlider.value = audio.volume;
                break;
            case 'ArrowDown':
                e.preventDefault();
                audio.volume = Math.max(0, audio.volume - 0.1);
                if(volumeSlider) volumeSlider.value = audio.volume;
                break;
        }
    });

    // Track Info Update
    const updateTrackInfo = async () => {
        try {
            const response = await fetch('https://radios.latinalive.net/api/nowplaying/latina');
            const data = await response.json();

            if (data && data.now_playing && data.now_playing.song) {
                const song = data.now_playing.song;
                const text = song.text || 'Latina Live - En Vivo';
                if(trackInfo) trackInfo.textContent = text;
                if(miniTrack) miniTrack.textContent = text;
            } else {
                const fallback = 'Latina Live - En Vivo';
                if(trackInfo) trackInfo.textContent = fallback;
                if(miniTrack) miniTrack.textContent = fallback;
            }
        } catch (error) {
            console.error('Error fetching track info:', error);
            const fallback = 'Latina Live - En Vivo';
            if(trackInfo) trackInfo.textContent = fallback;
            if(miniTrack) miniTrack.textContent = fallback;
        }
    };

    // Update immediately and then every 15 seconds
    updateTrackInfo();
    setInterval(updateTrackInfo, 15000);

    // Sync locutor with mini bar
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const locutorName = mutation.target.innerText;
                if(miniLocutor) miniLocutor.innerText = locutorName;
            }
        });
    });

    const mainLocutor = document.getElementById('nombre-locutor');
    if(mainLocutor && miniLocutor) {
        observer.observe(mainLocutor, { childList: true });
    }
});
