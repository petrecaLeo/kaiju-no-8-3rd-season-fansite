const FACADE_SELECTOR = '[data-youtube-facade]';
const PLAY_SELECTOR = 'button[data-youtube-facade-play]';
const POSTER_SELECTOR = '[data-youtube-facade-poster]';
const PLAYER_SELECTOR = 'template[data-youtube-facade-player]';

// The iframe waits inert inside a <template>, so nothing from YouTube loads before the click.
function loadPlayer(
  facade: HTMLElement,
  play: HTMLButtonElement,
  template: HTMLTemplateElement,
): void {
  const player = document.importNode(template.content, true).querySelector('iframe');
  if (!player) return;

  player.addEventListener(
    'load',
    () => {
      facade.querySelector(POSTER_SELECTOR)?.remove();
    },
    { once: true },
  );
  play.replaceWith(player);
  player.focus();
}

for (const facade of document.querySelectorAll<HTMLElement>(FACADE_SELECTOR)) {
  const play = facade.querySelector<HTMLButtonElement>(PLAY_SELECTOR);
  const template = facade.querySelector<HTMLTemplateElement>(PLAYER_SELECTOR);
  if (!play || !template) continue;

  play.addEventListener(
    'click',
    () => {
      loadPlayer(facade, play, template);
    },
    { once: true },
  );
}
