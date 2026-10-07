/* Shared assembly and floating motion for the two selected banner previews. */
window.BiteStackMotion = {
  create(root) {
    const animations = [];
    ['magenta', 'green', 'orange', 'yellow'].forEach((name, index) => {
      const shape = root.querySelector(`[data-shape="stack-${name}"]`);
      const start = index === 0 ? 28 : -30;
      const tilt = [-4, 8, -7, 5][index];
      animations.push(shape.animate([
        { opacity: 0, transform: `translateY(${start}px) rotate(${tilt}deg)`, offset: 0 },
        { opacity: 1, transform: `translateY(${start * .55}px) rotate(${tilt * .6}deg)`, offset: .2 },
        { opacity: 1, transform: `translateY(3px) rotate(${-tilt * .16}deg)`, offset: .65 },
        { opacity: 1, transform: 'translateY(-1.5px) rotate(.5deg)', offset: .82 },
        { opacity: 1, transform: 'translateY(0px) rotate(0deg)', offset: 1 }
      ], { duration: 780, delay: index * 140, fill: 'both', easing: 'cubic-bezier(.2,.7,.2,1)' }));
      const lift = [3, 4, 5, 6][index], tip = [1, -1.2, 1.2, -1.5][index];
      // Begin at rest after all four entrances finish, then drift continuously.
      animations.push(shape.animate([
        { transform: 'translateY(0px) rotate(0deg)', offset: 0, easing: 'ease-in-out' },
        { transform: `translateY(-${lift}px) rotate(${tip}deg)`, offset: .5, easing: 'ease-in-out' },
        { transform: 'translateY(0px) rotate(0deg)', offset: 1 }
      ], { delay: 1200 + index * 100, duration: 5200, iterations: Infinity }));
    });
    const now = document.timeline.currentTime;
    animations.forEach(animation => { animation.startTime = now; });
    return animations;
  }
};
