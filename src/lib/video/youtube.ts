import { YOUTUBE_ORIGINS } from '@/config/youtube';
import type { Locale } from '@/i18n/config';

export interface YouTubePoster {
  webp: string;
  jpeg: string;
  width: number;
  height: number;
}

export interface YouTubeVideo {
  embedUrl: string;
  watchUrl: string;
  poster: YouTubePoster;
}

// maxresdefault is the only 16:9 thumbnail big enough for a wide frame (hq/sd are 4:3 with bars).
// Not every video has it: after changing the ID, check that both URLs answer 200.
const POSTER = { name: 'maxresdefault', width: 1280, height: 720 } as const;

export function getYouTubeVideo(id: string, locale: Locale): YouTubeVideo {
  const embed = new URL(`/embed/${id}`, YOUTUBE_ORIGINS.embed);
  embed.search = new URLSearchParams({
    autoplay: '1',
    playsinline: '1',
    rel: '0',
    hl: locale,
  }).toString();

  const watch = new URL('/watch', YOUTUBE_ORIGINS.watch);
  watch.searchParams.set('v', id);

  return {
    embedUrl: embed.href,
    watchUrl: watch.href,
    poster: {
      webp: `${YOUTUBE_ORIGINS.thumbnail}/vi_webp/${id}/${POSTER.name}.webp`,
      jpeg: `${YOUTUBE_ORIGINS.thumbnail}/vi/${id}/${POSTER.name}.jpg`,
      width: POSTER.width,
      height: POSTER.height,
    },
  };
}
