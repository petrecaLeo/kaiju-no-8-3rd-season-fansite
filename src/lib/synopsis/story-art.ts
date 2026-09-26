import storyArt from '@/assets/images/Story/background.webp';
import { responsiveImage } from '@/lib/images/responsive-image';

// Keep in sync with StoryStage.css. The canvas covers the viewport (the wider of 100vw and the
// height × the art's 1.598 ratio) and the camera zooms up to about 1.2×.
const STORY_ART_SIZES = '(max-aspect-ratio: 3452/2160) 180vh, 115vw';

export const STORY_ART = responsiveImage(storyArt, [960, 1440, 1920, 2560], STORY_ART_SIZES);
