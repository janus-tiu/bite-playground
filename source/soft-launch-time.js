(() => {
  const root = document.getElementById('soft-launch-banner-animations') || document.getElementById('bite-gravity-study');
  if (!root) return;
  const resetZone = 'America/Los_Angeles';
  const displayZone = 'America/Toronto';
  // The Gravity prototype retains its existing shared status-bar clock.
  const clocks = root.id === 'soft-launch-banner-animations' ? root.querySelectorAll('.bt-device-time') : [];
  const partsFormat = new Intl.DateTimeFormat('en-CA', { timeZone: resetZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  const partsAt = date => Object.fromEntries(partsFormat.formatToParts(date).filter(p => p.type !== 'literal').map(p => [p.type, Number(p.value)]));
  function nextReset(now) {
    const p = partsAt(now);
    const target = Date.UTC(p.year, p.month - 1, p.day + 1);
    let instant = target;
    for (let i = 0; i < 3; i++) {
      const q = partsAt(new Date(instant));
      instant += target - Date.UTC(q.year, q.month - 1, q.day, q.hour, q.minute, q.second);
    }
    return new Date(instant);
  }
  let timer;
  function update() {
    clearTimeout(timer);
    const now = new Date();
    const clockFormat = new Intl.DateTimeFormat('en-US', { timeZone: displayZone, hour: 'numeric', minute: '2-digit' });
    clocks.forEach(clock => {
      clock.textContent = clockFormat.formatToParts(now).filter(p => p.type !== 'dayPeriod').map(p => p.value).join('').trim();
      clock.dateTime = now.toISOString();
      clock.setAttribute('aria-label', 'Toronto time, ' + clockFormat.format(now));
    });
    const reset = nextReset(now);
    const resetLabel = new Intl.DateTimeFormat('en-US', { timeZone: displayZone, hour: 'numeric', minute: '2-digit', timeZoneName: 'shortGeneric' }).format(reset);
    root.querySelectorAll('[data-reset-time]').forEach(time => { time.textContent = resetLabel; time.dateTime = reset.toISOString(); });
    timer = setTimeout(update, 60000 - Date.now() % 60000);
  }
  document.addEventListener('visibilitychange', () => document.hidden ? clearTimeout(timer) : update());
  window.addEventListener('focus', update);
  update();
})();
