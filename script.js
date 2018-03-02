const isInteger = x => x % 1 === 0;

// Get element refs on load
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const eControls = document.getElementById('controls');
  const eFrame = document.getElementById('frame');
  const eUrlControl = document.getElementById('url-control');
  const eIntervalControl = document.getElementById('interval-control');
  const eRefreshButton = document.getElementById('refresh-now-control');

  // Controls state
  let controlsHidden = false;
  const MIN_REFRESH = 1000;
  let refreshInterval = MIN_REFRESH;
  let refreshEnabled = true;
  let refreshTimeout = null;

  const refresh = () => {
    setRefreshEnabled(false);
    const location = eFrame.src;
    eFrame.src = null;
    eFrame.src = location;
  };

  const setRefreshTimeout = () => {
    refreshTimeout = setTimeout(() => {
      refresh();
    }, refreshInterval);
  };

  const toggleControls = () => {
    controlsHidden = !controlsHidden;

    if (controlsHidden) {
      eControls.className = 'controls hidden';
      eUrlControl.blur();
      eIntervalControl.blur();

      // Start the refresh timer.
      setRefreshTimeout();
    } else {
      // Halt the refresh timer.
      clearTimeout(refreshTimeout);
      refreshTimeout = null;

      eControls.className = 'controls';
      eUrlControl.select();
    }
  };

  const setRefreshEnabled = (enabled = true) =>
    eRefreshButton.disabled = !(refreshEnabled = enabled);

  // Bind key events
  const KEY_ESCAPE = 27;

  document.addEventListener('keyup', e => {
    const key = e.keyCode || e.which;

    if (key === KEY_ESCAPE) {
      toggleControls();
    }
  });

  eFrame.contentDocument.addEventListener('keyup', e => {
    console.log('Inner event', e);
    const key = e.keyCode || e.which;

    if (key === KEY_ESCAPE) {
      toggleControls();
    }
  });

  eFrame.addEventListener('load', e => {
    console.log('frame loaded');
    setRefreshEnabled(true);

    // Only continue if the controls are hidden.
    if (controlsHidden) {
      setRefreshTimeout();
    }
  });

  // Control interaction
  eUrlControl.addEventListener('change', e => {
    setRefreshEnabled(false)
    eFrame.src = eUrlControl.value;
  });

  eIntervalControl.addEventListener('change', e => {
    let val = +eIntervalControl.value;

    // Round the value if it isn't already.
    if (!isInteger(val)) {
      val = eIntervalControl.value = Math.round(val);
    } else if (val < MIN_REFRESH) {
      val = eIntervalControl.value = MIN_REFRESH;
    }

    refreshInterval = val;
  });

  eRefreshButton.addEventListener('click', () => refresh());

  // Finally, check the URL for initial parameters.
  const hash = window.location.hash.substring(1);

  if (!hash) return;

  const splitIndex = hash.indexOf('&');

  if (splitIndex === -1) {
    console.log('Hash ignored. Expected <interval>&<url>');
  }

  const interval = +hash.substring(0, splitIndex);
  const url = hash.substring(splitIndex + 1);

  console.log('Parsed hash.', 'Interval:', interval, 'URL:', url);

  if (url && interval) {
    eFrame.src = eUrlControl.value = url;
    refreshInterval = eIntervalControl.value = interval;
    toggleControls();
  }
});
