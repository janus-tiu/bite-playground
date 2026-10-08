/* Isolated soft-launch motion. No selectors or state reach other prototypes. */
(() => {
  const root = document.getElementById('soft-launch-banner-animations');
  if (!root) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const TAU = Math.PI * 2;
  const orbitRatio = 1.3;
  // Equal arc-length samples keep travel speed constant on the elliptical orbit.
  const arc = [0];
  let length = 0;
  for (let i = 1; i <= 2048; i++) {
    const a = (i - .5) * TAU / 2048;
    length += Math.hypot(Math.sin(a), Math.cos(a) / orbitRatio);
    arc.push(length);
  }
  for (let i = 0; i < arc.length; i++) arc[i] /= length;
  function angleAt(fraction) {
    fraction = (fraction % 1 + 1) % 1;
    let low = 0, high = arc.length - 1;
    while (high - low > 1) {
      const middle = (low + high) >> 1;
      if (arc[middle] <= fraction) low = middle; else high = middle;
    }
    return (low + (fraction - arc[low]) / (arc[high] - arc[low])) * TAU / 2048;
  }
  function fractionAt(angle) {
    const index = ((angle % TAU + TAU) % TAU) / TAU * 2048;
    const low = Math.floor(index), blend = index - low;
    return arc[low] + (arc[low + 1] - arc[low]) * blend;
  }
  function orbitFrames(shape) {
    const x = Number(shape.dataset.x), y = Number(shape.dataset.y);
    const width = Number(shape.dataset.width), height = Number(shape.dataset.height);
    const cx = 351, cy = 70;
    const dx = x + width / 2 - cx, dy = y + height / 2 - cy;
    const radius = Math.hypot(dx, dy * orbitRatio);
    const phase = fractionAt(Math.atan2(dy * orbitRatio, dx));
    const frames = Array.from({ length: 161 }, (_, i) => {
      const angle = angleAt(phase + i / 160);
      const tx = cx + radius * Math.cos(angle) - (x + width / 2);
      const ty = cy + radius / orbitRatio * Math.sin(angle) - (y + height / 2);
      return { transform: `translate(${tx.toFixed(4)}px, ${ty.toFixed(4)}px)`, offset: i / 160 };
    });
    frames[0].transform = 'translate(0px, 0px)';
    frames[160].transform = frames[0].transform;
    return frames;
  }
  const players = [...root.querySelectorAll('[data-motion-player]')].map(card => {
    const variant = card.dataset.motionPlayer;
    const motionLabel = { stack: 'assemble and bounce', orbit: 'slow orbit', greeting: 'blue greeting header' }[variant];
    const pauseButton = card.querySelector('[data-pause]');
    const replayButton = card.querySelector('[data-replay]');
    let animations = [], userPaused = false, visible = true;
    function sync() {
      const paused = userPaused || document.hidden || !visible;
      animations.forEach(animation => {
        const end = animation.effect.getComputedTiming().endTime;
        // A completed entrance must stay settled when a loop is paused or resumed.
        if (Number.isFinite(end) && animation.currentTime >= end) return;
        paused ? animation.pause() : animation.play();
      });
      pauseButton.textContent = userPaused ? 'Resume' : 'Pause';
      pauseButton.setAttribute('aria-pressed', String(userPaused));
      pauseButton.setAttribute('aria-label', `${userPaused ? 'Resume' : 'Pause'} ${motionLabel}`);
      card.dataset.playState = reduced.matches ? 'static' : paused ? 'paused' : 'playing';
    }
    function replay() {
      animations.forEach(animation => animation.cancel());
      animations = []; userPaused = false;
      pauseButton.disabled = replayButton.disabled = reduced.matches;
      if (reduced.matches) { sync(); return; }
      if (variant === 'stack' || variant === 'greeting') {
        animations.push(...window.BiteStackMotion.create(card));
      } else {
        card.querySelectorAll('[data-shape]').forEach(shape => {
          animations.push(shape.animate(orbitFrames(shape), { duration: 20000, iterations: Infinity, easing: 'linear' }));
        });
      }
      // Align every animation on one timeline, including delayed stack follow-through.
      const now = document.timeline.currentTime;
      animations.forEach(animation => { animation.startTime = now; });
      sync();
    }
    pauseButton.addEventListener('click', () => { userPaused = !userPaused; sync(); });
    replayButton.addEventListener('click', replay);
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: .05 });
    observer.observe(card);
    replay();
    return { replay, sync };
  });
  function preferencesChanged() {
    root.querySelector('.sl-motion-note').hidden = !reduced.matches;
    players.forEach(player => player.replay());
  }
  reduced.addEventListener('change', preferencesChanged);
  root.querySelector('.sl-motion-note').hidden = !reduced.matches;
  document.addEventListener('visibilitychange', () => players.forEach(player => player.sync()));
  const observer = new ResizeObserver(entries => entries.forEach(({ target, contentRect }) => {
    target.querySelector('.bt-phone').style.setProperty('--sl-scale', Math.min(1, contentRect.width / 393));
  }));
  root.querySelectorAll('.sl-device-view').forEach(view => observer.observe(view));
})();
