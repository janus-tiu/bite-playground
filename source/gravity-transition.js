/* One continuous falling-to-banner intro. Page navigation remains independent. */
(() => {
  const root = document.getElementById('bite-gravity-study');
  const phone = root.querySelector('.bt-phone');
  const viewport = root.querySelector('.bt-viewport');
  const outgoing = root.querySelector('.bt-outgoing'), incoming = root.querySelector('.bt-incoming');
  const status = root.querySelector('#bt-status'), replay = root.querySelector('#bt-replay');
  const indicator = root.querySelector('.bt-tab-indicator');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 1150, pageDuration = 180;
  const tabOrder = ['Friends', 'Inbox', 'Bite', 'Find Friends', 'Notifications'];
  const marks = [0, 330, 740, 1150], labels = ['Start', 'Falling', 'Settling', 'End'];
  const seenKey = 'bite-gravity-intro-refresh-day-v1';
  let current = 0, raf = 0, running = false, otherTab = 'Friends', direction = 1;
  let pageAnimations = [], lastSeenDay = null;
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const tabDirection = (from, to) => Math.sign(tabOrder.indexOf(to) - tabOrder.indexOf(from)) || 1;
  const bannerMotion = (mode, time = 0) => root.dispatchEvent(new CustomEvent('bite:banner', { detail: { mode, time } }));
  function refreshDay() {
    // A new intro becomes eligible at the same midnight-Pacific game reset.
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  }
  function playedToday() {
    try { lastSeenDay = localStorage.getItem(seenKey) || lastSeenDay; } catch {}
    return lastSeenDay === refreshDay();
  }
  function rememberEntry() {
    lastSeenDay = refreshDay();
    try { localStorage.setItem(seenKey, lastSeenDay); } catch {}
  }
  function positionIndicator(tab) {
    const button = root.querySelector(`[data-tab="${tab}"]`);
    const width = Math.min(50, button.offsetWidth - 12);
    indicator.style.width = `${width}px`;
    indicator.style.transform = `translateX(${button.offsetLeft + (button.offsetWidth - width) / 2}px)`;
    if (!indicator.dataset.ready) requestAnimationFrame(() => { indicator.dataset.ready = 'true'; });
  }
  function nav(tab) {
    root.querySelectorAll('[data-tab]').forEach(button => {
      if (button.dataset.tab === tab) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    phone.dataset.currentTab = tab;
    root.querySelector('#bt-screen-title').textContent = tab === 'Friends' ? 'EA friends' : tab;
    root.querySelector('#ec-sort-friends').hidden = tab !== 'Friends';
    positionIndicator(tab);
  }
  function clearPageMotion() {
    pageAnimations.forEach(animation => animation.cancel()); pageAnimations = [];
    viewport.querySelectorAll('.bt-route-ghost').forEach(element => element.remove());
  }
  function animatePageEntry(target, ghost, side) {
    if (reduced.matches) return;
    pageAnimations.push(target.animate([
      { opacity: 0, transform: `translateX(${side * 12}px)` },
      { opacity: 1, transform: 'translateX(0px)' }
    ], { duration: pageDuration, easing: 'cubic-bezier(.2,.7,.2,1)' }));
    if (!ghost) return;
    ghost.classList.add('bt-route-ghost'); ghost.inert = true; ghost.setAttribute('aria-hidden', 'true');
    ghost.removeAttribute('id'); ghost.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    ghost.style.opacity = '1'; ghost.style.transform = 'none'; viewport.append(ghost);
    const exit = ghost.animate([
      { opacity: 1, transform: 'translateX(0px)' },
      { opacity: 0, transform: `translateX(${-side * 12}px)` }
    ], { duration: pageDuration, easing: 'cubic-bezier(.2,.7,.2,1)' });
    exit.onfinish = () => ghost.remove(); pageAnimations.push(exit);
  }
  function draw(ms) {
    current = Math.max(0, Math.min(duration, ms)); root.dataset.time = Math.round(current);
    const isBite = current > 0 || running;
    const progress = isBite ? smooth(current / pageDuration) : 0;
    // Content arrives with the normal tab swipe, while the actual banner shapes fall.
    incoming.style.opacity = progress; outgoing.style.opacity = 1 - progress;
    incoming.style.transform = `translateX(${(1 - progress) * direction * 12}px)`;
    outgoing.style.transform = `translateX(${-progress * direction * 12}px)`;
    incoming.inert = !isBite; outgoing.inert = isBite;
    incoming.setAttribute('aria-hidden', String(!isBite)); outgoing.setAttribute('aria-hidden', String(isBite));
    nav(isBite ? 'Bite' : otherTab);
    bannerMotion('frame', current);
    const nearest = marks.reduce((best, mark) => Math.abs(mark - current) < Math.abs(best - current) ? mark : best, 0);
    root.querySelectorAll('[data-time]').forEach(button => button.setAttribute('aria-pressed', String(!running && Number(button.dataset.time) === nearest)));
  }
  function stop() {
    cancelAnimationFrame(raf); running = false; clearPageMotion(); bannerMotion('settle');
    replay.textContent = 'Replay transition';
  }
  function finish(message = 'End · 1,150 ms') {
    cancelAnimationFrame(raf); running = false; draw(duration);
    bannerMotion(reduced.matches ? 'settle' : 'float');
    replay.textContent = 'Replay transition'; status.textContent = message;
  }
  function inspect(ms) {
    stop(); direction = tabDirection(otherTab, 'Bite'); incoming.scrollTop = 0;
    if (ms > 0 && ms < duration && !reduced.matches) bannerMotion('prepare');
    draw(reduced.matches && ms > 0 ? duration : ms);
    status.textContent = `${labels[marks.indexOf(ms)] || 'Preview'} · ${ms.toLocaleString()} ms`;
  }
  function play(force = false) {
    const ghost = !reduced.matches && phone.dataset.currentTab !== 'Bite' ? outgoing.cloneNode(true) : null;
    direction = tabDirection(otherTab, 'Bite'); stop(); incoming.scrollTop = 0;
    if (reduced.matches || (!force && playedToday())) {
      rememberEntry(); draw(duration);
      animatePageEntry(incoming, ghost, direction);
      bannerMotion(reduced.matches ? 'settle' : 'float');
      status.textContent = reduced.matches ? 'End · reduced motion' : 'Bite · intro already played today';
      return;
    }
    rememberEntry(); running = true;
    replay.textContent = 'Playing…'; status.textContent = 'Fall → settle into banner';
    bannerMotion('prepare'); draw(0);
    const start = performance.now();
    const tick = now => {
      const time = Math.min(duration, now - start); draw(time);
      if (time < duration) raf = requestAnimationFrame(tick); else finish();
    };
    raf = requestAnimationFrame(tick);
  }
  replay.addEventListener('click', () => play(true));
  root.querySelectorAll('[data-time]').forEach(button => button.addEventListener('click', () => inspect(Number(button.dataset.time))));
  // Consume a tap during the intro: the first tap completes it, the next acts normally.
  phone.addEventListener('click', event => {
    if (!running) return;
    event.preventDefault(); event.stopImmediatePropagation(); finish('End · skipped');
  }, true);
  root.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => {
    const tab = button.dataset.tab;
    if (tab === 'Bite') { if (current === duration && !running) return; play(); return; }
    const from = phone.dataset.currentTab || otherTab;
    if (tab === from && !running) return;
    const side = tabDirection(from, tab);
    const ghost = !reduced.matches ? (from === 'Bite' ? incoming : outgoing).cloneNode(true) : null;
    stop(); otherTab = tab;
    outgoing.querySelectorAll('[data-other]').forEach(element => { element.hidden = element.dataset.other !== tab; });
    draw(0); status.textContent = 'Start · 0 ms'; animatePageEntry(outgoing, ghost, side);
  }));
  reduced.addEventListener('change', () => { if (reduced.matches && running) finish('End · reduced motion'); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && running) finish('End · 1,150 ms'); });
  new ResizeObserver(() => positionIndicator(phone.dataset.currentTab || otherTab)).observe(phone);
  draw(0); root.dataset.ready = 'true';
})();
