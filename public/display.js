// Display page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const backgroundDiv = document.getElementById('background');
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

  function updateDisplay() {
    const displayData = JSON.parse(localStorage.getItem('displayData'));
    if (displayData) {
      timerTextDiv.textContent = `${displayData.count} - ${displayData.timer}`;
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
        backgroundDiv.innerHTML = `<video id="bgVideo" src="${backgroundUrl}" loop muted style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;" onload="console.log('Video loaded successfully')" onerror="console.error('Video failed to load:', '${backgroundUrl}')"></video>`;
        console.log('Video HTML set:', backgroundDiv.innerHTML);
        
        // Try to play the video
        const video = document.getElementById('bgVideo');
        if (video) {
          video.play().then(() => {
            console.log('Video started playing automatically');
            videoOverlay.style.display = 'none';
          }).catch(e => {
            console.log('Video autoplay blocked:', e.message);
            videoOverlay.style.display = 'flex';
            videoOverlay.onclick = () => {
              video.play().then(() => {
                videoOverlay.style.display = 'none';
                console.log('Video started playing after click');
                audioEnabled = true; // Enable audio after user interaction
              }).catch(e => console.error('Video play failed:', e));
            };
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