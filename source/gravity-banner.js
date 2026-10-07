/* The same SVG nodes fall into place and then float; there is no canvas handoff. */
(() => {
  const root = document.getElementById('bite-gravity-study');
  const banner = root.querySelector('.sl-banner--stack');
  const graphics = banner.querySelector('.sl-stack-graphics');
  const incoming = root.querySelector('.bt-incoming');
  const pause = root.querySelector('#bt-banner-pause');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const shapes = ['magenta', 'green', 'orange', 'yellow'].map(name => banner.querySelector(`[data-shape="stack-${name}"]`));
  let entrances = [], floats = [], userPaused = false;
  function sync() {
    const paused = userPaused || document.hidden;
    floats.forEach(animation => paused ? animation.pause() : animation.play());
    pause.disabled = floats.length === 0 || reduced.matches;
    pause.textContent = userPaused ? 'Resume banner' : 'Pause banner';
    pause.setAttribute('aria-pressed', String(userPaused));
  }
  function settle() {
    [...entrances, ...floats].forEach(animation => animation.cancel());
    entrances = []; floats = []; userPaused = false;
    delete root.dataset.bannerIntro;
    sync();
  }
  function prepare() {
    settle(); if (reduced.matches) return;
    root.dataset.bannerIntro = 'true';
    entrances = shapes.map((shape, index) => {
      const targetTop = banner.offsetTop + graphics.offsetTop + shape.offsetTop - incoming.scrollTop;
      const startY = -targetTop - shape.offsetHeight - 20;
      const startX = [-24, 12, 30, -12][index], tilt = [-16, 12, -18, 15][index];
      const animation = shape.animate([
        { transform: `translate(${startX}px, ${startY}px) rotate(${tilt}deg) scale(1.12)`, offset: 0, easing: 'cubic-bezier(.42,0,.84,.52)' },
        { transform: `translate(0px, 3px) rotate(${-tilt * .1}deg) scale(1)`, offset: .66, easing: 'cubic-bezier(.2,.7,.2,1)' },
        { transform: 'translate(0px, -1.5px) rotate(.4deg) scale(1)', offset: .84, easing: 'ease-out' },
        { transform: 'translate(0px, 0px) rotate(0deg) scale(1)', offset: 1 }
      ], { duration: 820, delay: index * 110, fill: 'both' });
      animation.pause(); animation.currentTime = 0;
      return animation;
    });
  }
  function float() {
    settle(); if (reduced.matches) return;
    floats = shapes.map((shape, index) => shape.animate([
      { transform: 'translateY(0px) rotate(0deg)', offset: 0, easing: 'ease-in-out' },
      { transform: `translateY(-${[3, 4, 5, 6][index]}px) rotate(${[1, -1.2, 1.2, -1.5][index]}deg)`, offset: .5, easing: 'ease-in-out' },
      { transform: 'translateY(0px) rotate(0deg)', offset: 1 }
    ], { delay: index * 100, duration: 5200, iterations: Infinity }));
    const now = document.timeline.currentTime;
    floats.forEach(animation => { animation.startTime = now; }); sync();
  }
  root.addEventListener('bite:banner', ({ detail }) => {
    if (detail.mode === 'settle') settle();
    if (detail.mode === 'prepare') prepare();
    if (detail.mode === 'frame') entrances.forEach(animation => { animation.currentTime = detail.time; });
    if (detail.mode === 'float') float();
  });
  pause.addEventListener('click', () => { userPaused = !userPaused; sync(); });
  reduced.addEventListener('change', settle);
  document.addEventListener('visibilitychange', sync);
  settle();
})();
