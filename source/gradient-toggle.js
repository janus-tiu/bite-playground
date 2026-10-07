/* One device-local preview preference, shared by both prototype pages. */
(() => {
  const root = document.getElementById('bite-playground');
  if (!root) return;
  const key = 'bite-playground-blue-gradient';
  const toggles = [...root.querySelectorAll('[data-gradient-toggle]')];
  const states = [...root.querySelectorAll('[data-gradient-state]')];
  const frames = [...root.querySelectorAll('.gc-preview')];
  let enabled = true;
  function savedPreference() {
    try { return localStorage.getItem(key) !== 'off'; } catch { return true; }
  }
  function send(frame) {
    frame.contentWindow?.postMessage({ type: 'bite-preview-gradient', enabled }, location.origin);
  }
  function apply(next, persist = false) {
    enabled = next;
    root.dataset.biteGradient = enabled ? 'on' : 'off';
    toggles.forEach(toggle => { toggle.checked = enabled; });
    states.forEach(state => { state.textContent = enabled ? 'On' : 'Off'; });
    if (persist) {
      try { localStorage.setItem(key, enabled ? 'on' : 'off'); } catch { /* Still works without storage. */ }
    }
    frames.forEach(send);
  }
  toggles.forEach(toggle => toggle.addEventListener('change', () => apply(toggle.checked, true)));
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.data?.type !== 'bite-gravity-preview-ready') return;
    const frame = frames.find(item => item.contentWindow === event.source);
    if (frame) send(frame);
  });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) apply(savedPreference());
  });
  apply(savedPreference());
})();
