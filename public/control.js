// Control page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('controlForm');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const skipBtn = document.getElementById('skipBtn');
  const hideCountdownBtn = document.getElementById('hideCountdownBtn');
  const intervalTimeInput = document.getElementById('intervalTime');
  const timeUnitSelect = document.getElementById('timeUnit');
  const maxCountInput = document.getElementById('maxCount');
  const nextCountInput = document.getElementById('nextCount');
  const timerInput = document.getElementById('timer');
  const fontStyleSelect = document.getElementById('fontStyle');
  const textLocationSelect = document.getElementById('textLocation');
  const backgroundFileInput = document.getElementById('backgroundFile');
  const soundFileInput = document.getElementById('soundFile');

  let intervalId = null;
  let currentCount = 1;
  let timerValue = parseInt(timerInput.value);
  let countdownHidden = localStorage.getItem('countdownHidden') === 'true';

  function calculateInterval() {
    const intervalTime = parseInt(intervalTimeInput.value);
    const timeUnit = timeUnitSelect.value;
    return timeUnit === 'minutes' ? intervalTime * 60 : intervalTime;
  }

  // Load saved settings
  loadSettings();

  // Update settings in localStorage
  function saveSettings() {
    const settings = {
      intervalTime: intervalTimeInput.value,
      timeUnit: timeUnitSelect.value,
      maxCount: maxCountInput.value,
      nextCount: nextCountInput.value,
      timer: timerInput.value,
      fontStyle: fontStyleSelect.value,
      textLocation: textLocationSelect.value,
      backgroundUrl: localStorage.getItem('backgroundUrl'),
      backgroundType: localStorage.getItem('backgroundType'),
      soundUrl: localStorage.getItem('soundUrl')
    };
    localStorage.setItem('timerSettings', JSON.stringify(settings));
  }

  // Load settings from localStorage
  function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('timerSettings'));
    if (settings) {
      intervalTimeInput.value = settings.intervalTime || 10;
      timeUnitSelect.value = settings.timeUnit || 'seconds';
      maxCountInput.value = settings.maxCount || 5;
      nextCountInput.value = settings.nextCount || 1;
      timerInput.value = settings.timer || 10;
      fontStyleSelect.value = settings.fontStyle || 'Arial';
      textLocationSelect.value = settings.textLocation || 'top-left';
      if (settings.backgroundUrl) {
        localStorage.setItem('backgroundUrl', settings.backgroundUrl);
      }
      if (settings.backgroundType) {
        localStorage.setItem('backgroundType', settings.backgroundType);
      }
      if (settings.soundUrl) {
        localStorage.setItem('soundUrl', settings.soundUrl);
      }
    }
    timerValue = parseInt(timerInput.value);
    currentCount = parseInt(nextCountInput.value);
  }

  // Validate next count
  nextCountInput.addEventListener('input', function() {
    const maxCount = parseInt(maxCountInput.value);
    const nextCount = parseInt(this.value);
    if (nextCount > maxCount) {
      this.value = maxCount;
    }
    if (nextCount < 1) {
      this.value = 1;
    }
    currentCount = nextCount;
    saveSettings();
  });

  // Update timer value when edited
  timerInput.addEventListener('input', function() {
    timerValue = parseInt(this.value);
    saveSettings();
  });

  // Handle file inputs
  backgroundFileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      console.log('Background file selected:', file.name, 'type:', file.type, 'size:', file.size);
      if (file.size > 1024 * 1024 * 1024) { // 1GB limit
        alert('File is too large. Please select a file smaller than 1GB.');
        return;
      }

      const formData = new FormData();
      formData.append('background', file);

      fetch('/upload-background', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('Background uploaded:', data.url);
          localStorage.setItem('backgroundUrl', data.url);
          localStorage.setItem('backgroundType', data.type);
          saveSettings();
        } else {
          alert('Failed to upload background file: ' + data.error);
        }
      })
      .catch(error => {
        console.error('Upload error:', error);
        alert('Failed to upload background file');
      });
    }
  });

  soundFileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('sound', file);

      fetch('/upload-sound', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('Sound uploaded:', data.url);
          localStorage.setItem('soundUrl', data.url);
          saveSettings();
        } else {
          alert('Failed to upload sound file: ' + data.error);
        }
      })
      .catch(error => {
        console.error('Upload error:', error);
        alert('Failed to upload sound file');
      });
    }
  });

  // Update settings on change
  form.addEventListener('input', saveSettings);

  // Timer logic
  function startTimer() {
    if (intervalId) return;
    timerValue = calculateInterval();
    timerInput.value = timerValue;

    intervalId = setInterval(() => {
      timerValue--;
      if (timerValue <= 0) {
        timerValue = calculateInterval();
        currentCount++;
        const maxCount = parseInt(maxCountInput.value);
        if (currentCount > maxCount) {
          currentCount = 1;
        }
      }
      timerInput.value = timerValue;
      updateDisplay();
    }, 1000);
  }

  function stopTimer() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function skipTimer() {
    // Increment to next count
    currentCount++;
    const maxCount = parseInt(maxCountInput.value);
    if (currentCount > maxCount) {
      currentCount = 1;
    }
    // Reset timer to interval
    timerValue = calculateInterval();
    timerInput.value = timerValue;
    nextCountInput.value = currentCount;
    updateDisplay();
  }

  function toggleCountdown() {
    countdownHidden = !countdownHidden;
    localStorage.setItem('countdownHidden', countdownHidden.toString());
    updateCountdownButton();
    updateDisplay();
  }

  function updateCountdownButton() {
    hideCountdownBtn.textContent = countdownHidden ? 'Show Count Down' : 'Hide Count Down';
  }

  function updateDisplay() {
    const displayData = {
      timer: timerValue,
      count: currentCount,
      fontStyle: fontStyleSelect.value,
      textLocation: textLocationSelect.value.replace('-', '-')
    };
    localStorage.setItem('displayData', JSON.stringify(displayData));
  }

  startBtn.addEventListener('click', startTimer);
  stopBtn.addEventListener('click', stopTimer);
  skipBtn.addEventListener('click', skipTimer);
  hideCountdownBtn.addEventListener('click', toggleCountdown);

  // Initialize button text
  updateCountdownButton();

  // Initial update
  updateDisplay();
});