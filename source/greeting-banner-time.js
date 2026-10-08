/* The third option reads the same reset instant as the existing banners. */
(() => {
  const root = document.getElementById('soft-launch-banner-animations');
  const greeting = root?.querySelector('[data-bite-greeting]');
  const countdown = root?.querySelector('[data-reset-countdown]');
  const sharedReset = root?.querySelector('[data-reset-time]');
  if (!greeting || !countdown || !sharedReset) return;

  function update() {
    const now = new Date();
    const hour = now.getHours();
    greeting.textContent = hour >= 5 && hour < 12 ? 'Good morning!'
      : hour >= 12 && hour < 18 ? 'Good afternoon!' : 'Good evening!';
    const reset = new Date(sharedReset.dateTime);
    if (!Number.isFinite(reset.getTime())) return;
    const minutes = Math.max(1, Math.ceil((reset - now) / 60000));
    const count = minutes >= 60 ? Math.ceil(minutes / 60) : minutes;
    const unit = minutes >= 60 ? 'hour' : 'minute';
    countdown.textContent = `${count} ${unit}${count === 1 ? '' : 's'}`;
    countdown.dateTime = reset.toISOString();
    countdown.title = `Daily refresh at ${sharedReset.textContent}`;
  }

  // soft-launch-time.js refreshes this attribute every minute and on focus.
  new MutationObserver(update).observe(sharedReset, {
    attributes: true, attributeFilter: ['datetime']
  });
  window.addEventListener('pageshow', update);
  update();
})();
