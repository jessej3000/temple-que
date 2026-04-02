// Display page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const backgroundDiv = document.getElementById('background');
  const countNumberDiv = document.getElementById('countNumber');
  const countDownDiv = document.getElementById('countDown');
  const timerTextDiv = document.getElementById('timerText');
  const videoOverlay = document.getElementById('videoOverlay');

  console.log('Display page loaded, backgroundDiv:', backgroundDiv, 'style:', backgroundDiv.style);

  let lastCount = null;
  let lastBackgroundData = null;
  let audioEnabled = false;

  // Enable audio after any user interaction
  document.addEventListener('click', () => {
    audioEnabled = true;
  });
  document.addEventListener('keydown', () => {
    audioEnabled = true;
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

      // Play sound if count changed and audio is enabled
      if (lastCount !== null && lastCount !== displayData.count && audioEnabled) {
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
        backgroundDiv.innerHTML = `<video id="bgVideo" src="${backgroundUrl}" loop style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;" onload="console.log('Video loaded successfully')" onerror="console.error('Video failed to load:', '${backgroundUrl}')"></video>`;
        console.log('Video HTML set:', backgroundDiv.innerHTML);
        
        // Try to play the video automatically
        const video = document.getElementById('bgVideo');
        if (video) {
          video.play().then(() => {
            console.log('Video started playing automatically with audio');
            videoOverlay.style.display = 'none';
          }).catch(e => {
            console.log('Video autoplay with audio blocked, trying muted:', e.message);
            // Try playing muted if autoplay with audio failed
            video.muted = true;
            video.play().then(() => {
              console.log('Video started playing automatically (muted)');
              videoOverlay.style.display = 'none';
            }).catch(e2 => {
              console.log('Video autoplay failed even when muted:', e2.message);
              // As a last resort, show overlay for manual play
              videoOverlay.style.display = 'flex';
              videoOverlay.onclick = () => {
                video.muted = false; // Try with audio on click
                video.play().then(() => {
                  videoOverlay.style.display = 'none';
                  console.log('Video started playing after click');
                  audioEnabled = true;
                }).catch(e3 => {
                  // If still fails, play muted
                  video.muted = true;
                  video.play().then(() => {
                    videoOverlay.style.display = 'none';
                    console.log('Video started playing muted after click');
                    audioEnabled = true;
                  }).catch(e4 => console.error('Video play failed completely:', e4));
                });
              };
            });
          });
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