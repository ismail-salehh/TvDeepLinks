/// <reference lib="dom" />

// Moves DOM focus with the remote's D-pad, standing in for the native TV
// focus engine that react-native-web doesn't have.

type Direction = 'left' | 'right' | 'up' | 'down';

const KEYS: Record<number, Direction> = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
};

const FOCUSABLE = '[tabindex]:not([tabindex="-1"]), button, a[href], input';

const center = (rect: DOMRect) => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
});

const focusables = () =>
  Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    el => el.offsetParent !== null,
  );

const nearest = (from: HTMLElement, direction: Direction) => {
  const origin = center(from.getBoundingClientRect());
  let best: HTMLElement | undefined;
  let bestScore = Infinity;
  for (const el of focusables()) {
    if (el === from) continue;
    const { x, y } = center(el.getBoundingClientRect());
    const dx = x - origin.x;
    const dy = y - origin.y;
    const [main, cross] =
      direction === 'left'
        ? [-dx, dy]
        : direction === 'right'
        ? [dx, dy]
        : direction === 'up'
        ? [-dy, dx]
        : [dy, dx];
    if (main <= 0) continue;
    // Favour candidates straight ahead over ones off to the side.
    const score = main + Math.abs(cross) * 2;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }
  return best;
};

export const focusFirst = () => focusables()[0]?.focus();

export const startSpatialNavigation = () => {
  document.addEventListener('keydown', event => {
    const direction = KEYS[event.keyCode];
    if (!direction) return;
    event.preventDefault();
    const current = document.activeElement as HTMLElement | null;
    if (!current || current === document.body) {
      focusFirst();
      return;
    }
    nearest(current, direction)?.focus();
  });
};
