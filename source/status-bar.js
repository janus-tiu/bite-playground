(() => {
  const clock = document.querySelector('#bite-gravity-study .bt-device-time');
  const timeZone = clock.closest('.bt-phone').dataset.clockTimeZone;
  let timer;
  function updateClock() {
    clearTimeout(timer);
    const now = new Date();
    // Pin this prototype to Janus's local timezone, including daylight saving changes.
    // Preview browsers can run in UTC even when the viewer is in Toronto.
    const format = new Intl.DateTimeFormat(undefined, { timeZone, hour: 'numeric', minute: '2-digit' });
    clock.textContent = format.formatToParts(now)
      .filter(part => part.type !== 'dayPeriod')
      .map(part => part.value).join('').trim();
    clock.dateTime = now.toISOString();
    clock.setAttribute('aria-label', 'Local time, ' + format.format(now));
    timer = setTimeout(updateClock, 60000 - Date.now() % 60000);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(timer);
    else updateClock();
  });
  window.addEventListener('focus', updateClock);
  updateClock();
})();
