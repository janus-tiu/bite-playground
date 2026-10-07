/* Calendar date follows the viewer's device; the existing Pacific game reset is separate. */
(() => {
  const root = document.getElementById('bite-playground');
  if (!root) return;
  let timer;
  function update() {
    clearTimeout(timer);
    const now = new Date();
    const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(now);
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now);
    const isoDate = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
    root.querySelectorAll('[data-bite-date]').forEach(time => {
      time.querySelector('[data-bite-calendar-date]').textContent = date;
      time.querySelector('[data-bite-weekday]').textContent = weekday;
      time.dateTime = isoDate;
      time.setAttribute('aria-label', `${weekday}, ${date}`);
    });
    timer = setTimeout(update, 60000 - Date.now() % 60000);
  }
  document.addEventListener('visibilitychange', () => document.hidden ? clearTimeout(timer) : update());
  window.addEventListener('focus', update);
  window.addEventListener('pageshow', update);
  update();
})();
