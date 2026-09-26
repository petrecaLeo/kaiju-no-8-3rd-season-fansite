// Focusing the body moves the sequential focus starting point to the top, so the first Tab
// after the loader lands on the skip link no matter what was clicked while the page was inert.
// The tabindex is dropped at once and the focus fix-up returns focus to the document before
// anything paints. A URL fragment already set its own starting point and is left alone.
export function moveFocusToPageStart(): void {
  if (location.hash !== '') return;

  const { body } = document;
  body.tabIndex = -1;
  body.focus({ preventScroll: true });
  body.removeAttribute('tabindex');
}
