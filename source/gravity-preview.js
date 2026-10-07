(() => {
  const root = document.getElementById('bite-gravity-study');
  const phone = root.querySelector('.bt-phone');
  const preview = root.querySelector('.bt-preview');
  const replay = root.querySelector('#bt-replay');
  let lastHeight = 0;
  function resize() {
    const scale = Math.min(1, Math.max(.4, (preview.clientWidth - 24) / 393));
    phone.style.setProperty('--gc-phone-scale', scale);
    const height = Math.ceil(document.getElementById('bite-playground').getBoundingClientRect().height);
    if (height !== lastHeight) {
      lastHeight = height;
      parent.postMessage({ type: 'bite-gravity-preview-size', height }, location.origin);
    }
  }
  window.addEventListener('message', event => {
    if (event.source !== parent || event.origin !== location.origin) return;
    if (event.data?.type === 'bite-gravity-replay') {
      const delay = Math.max(0, Math.min(1000, event.data.startAt - Date.now()));
      setTimeout(() => replay.click(), delay);
    }
  });
  new ResizeObserver(resize).observe(root);
  window.addEventListener('resize', resize);
  // Start on the settled homepage so the two final compositions are easy to compare.
  root.querySelector('[data-time="__END_TIME__"]').click();
  resize();
  parent.postMessage({ type: 'bite-gravity-preview-ready' }, location.origin);
})();
