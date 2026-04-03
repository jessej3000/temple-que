// Display page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Check if fullscreen parameter is present in URL
  const urlParams = new URLSearchParams(window.location.search);
  const monitoringMode = urlParams.get('monitoring') === 'true' || window.location.pathname === '/monitoring';
  const fullscreenMode = urlParams.get('fullscreen') === 'true';
  if (fullscreenMode) {
    // Request fullscreen after a short delay to ensure page is fully loaded
    setTimeout(() => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
          console.log('Fullscreen request failed:', err);
        });
      } else if (document.documentElement.webkitRequestFullscreen) { // Safari
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) { // IE11
        document.documentElement.msRequestFullscreen();
      }
    }, 100);
  }

  const backgroundDiv = document.getElementById('background');
  const countNumberDiv = document.getElementById('countNumber');
  const countDownDiv = document.getElementById('countDown');
  const timerTextDiv = document.getElementById('timerText');
  const videoOverlay = document.getElementById('videoOverlay');

  console.log('Display page loaded, backgroundDiv:', backgroundDiv, 'style:', backgroundDiv.style);

  let lastCount = null;
  let lastBackgroundData = null;
  let audioEnabled = false;
  let currentVideoElement = null;

  // Enable audio after any user interaction
  document.addEventListener('click', () => {
    if (!monitoringMode) {
      audioEnabled = true;
      if (currentVideoElement && currentVideoElement.muted) {
        currentVideoElement.muted = false;
        console.log('Video unmuted after user click');
      }
    }
  });
  document.addEventListener('keydown', () => {
    if (!monitoringMode) {
      audioEnabled = true;
      if (currentVideoElement && currentVideoElement.muted) {
        currentVideoElement.muted = false;
        console.log('Video unmuted after user keydown');
      }
    }
  });

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function updateDisplay() {
    const displayData = JSON.parse(localStorage.getItem('displayData'));
    if (displayData) {
      // Update count number (top left, bigger)
      countNumberDiv.textContent = displayData.count;
      countNumberDiv.style.fontFamily = displayData.fontStyle;
      
      // Update countdown (top right, smaller) - check if hidden
      const countdownHidden = localStorage.getItem('countdownHidden') === 'true';
      if (countdownHidden) {
        countDownDiv.style.display = 'none';
      } else {
        countDownDiv.style.display = 'block';
        countDownDiv.textContent = formatTime(displayData.timer);
        countDownDiv.style.fontFamily = displayData.fontStyle;
      }
      
      // Keep the old timerText for backward compatibility (hidden)
      timerTextDiv.textContent = `${displayData.count} - ${formatTime(displayData.timer)}`;
      timerTextDiv.style.fontFamily = displayData.fontStyle;
      timerTextDiv.className = displayData.textLocation;

      // Play sound if count changed and audio is enabled (not in monitoring mode)
      if (!monitoringMode && lastCount !== null && lastCount !== displayData.count && audioEnabled) {
        const soundUrl = localStorage.getItem('soundUrl');
        if (soundUrl) {
          const audio = new Audio(soundUrl);
          audio.play().catch(e => console.log('Audio play blocked:', e.message));
        }
      }
      lastCount = displayData.count;
    }

    // Update background
    const backgroundUrl = localStorage.getItem('backgroundUrl');
    const backgroundType = localStorage.getItem('backgroundType');
    
    console.log('Current backgroundUrl:', backgroundUrl, 'backgroundType:', backgroundType);
    
    // Only update if background url has changed
    if (backgroundUrl && backgroundUrl !== lastBackgroundData) {
      lastBackgroundData = backgroundUrl;
      console.log('Background url found, type:', backgroundType, 'url:', backgroundUrl);
      
      if (backgroundType && backgroundType.startsWith('image/')) {
        console.log('Setting image background');
        backgroundDiv.innerHTML = `<img src="${backgroundUrl}" alt="Background" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;" onload="console.log('Image loaded successfully')" onerror="console.error('Image failed to load:', '${backgroundUrl}')">`;
        console.log('Image HTML set:', backgroundDiv.innerHTML);
        videoOverlay.style.display = 'none'; // Hide overlay for images
      } else if (backgroundType && backgroundType.startsWith('video/')) {
        console.log('Setting video background');

        if (monitoringMode) {
          // monitoring mode: no audio, always muted
          backgroundDiv.innerHTML = `<video id="bgVideo" src="${backgroundUrl}" loop muted playsinline autoplay style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;"></video>`;
          console.log('Video HTML set (monitoring muted):', backgroundDiv.innerHTML);
          videoOverlay.style.display = 'none';

          const video = document.getElementById('bgVideo');
          if (video) {
            currentVideoElement = video;
            video.play().catch(e => console.log('Monitoring muted autoplay failed:', e.message));
          }
        } else {
          // normal mode: try to play with audio, fallback to muted
          backgroundDiv.innerHTML = `<video id="bgVideo" src="${backgroundUrl}" loop playsinline autoplay style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;"></video>`;
          console.log('Video HTML set:', backgroundDiv.innerHTML);
          videoOverlay.style.display = 'none';

          const video = document.getElementById('bgVideo');
          if (video) {
            currentVideoElement = video;
            setTimeout(() => {
              const playPromise = video.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log('Video started playing with audio');
                    video.muted = false;
                  })
                  .catch(error => {
                    console.log('Autoplay with audio failed, trying muted:', error.message);
                    video.muted = true;
                    video.play().catch(e => console.log('Muted autoplay also failed:', e.message));
                  });
              }
            }, 100);
          }
        }
      } else {
        console.log('Unknown background type:', backgroundType);
        videoOverlay.style.display = 'none';
      }
    } else if (!backgroundUrl) {
      console.log('No background url in localStorage');
      videoOverlay.style.display = 'none';
    }
  }

  // Update every second
  setInterval(updateDisplay, 1000);

  // Initial update
  updateDisplay();
});