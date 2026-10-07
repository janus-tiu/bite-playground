(() => {
  const frames = [...document.querySelectorAll('.gc-preview')];
  const ready = new Set();
  const replay = document.querySelector('.gc-replay');
  window.addEventListener('message', event => {
    if (event.origin !== location.origin) return;
    const frame = frames.find(item => item.contentWindow === event.source);
    if (!frame) return;
    if (event.data?.type === 'bite-gravity-preview-size' && Number.isFinite(event.data.height)) {
      frame.style.height = `${Math.max(500, Math.min(1600, event.data.height))}px`;
    }
    if (event.data?.type === 'bite-gravity-preview-ready') {
      ready.add(frame); replay.disabled = ready.size !== frames.length;
    }
  });
  replay.addEventListener('click', () => {
    // Use one shared start time so the differences can be watched side by side.
    const startAt = Date.now() + 120;
    frames.forEach(frame => frame.contentWindow.postMessage({ type: 'bite-gravity-replay', startAt }, location.origin));
  });
  // Assign sources only after the message listener is ready.
  frames.forEach(frame => { frame.src = frame.dataset.src; });
})();
