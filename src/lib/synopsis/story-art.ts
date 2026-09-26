import storyArt from '@/assets/images/Story/background.webp';
import { responsiveImage } from '@/lib/images/responsive-image';

// Keep in sync with StoryStage.css. The canvas covers the viewport (the wider of 100vw and the
// height × the art's 1.598 ratio) and the camera zooms up to about 1.2×.
const STORY_ART_SIZES = '(max-aspect-ratio: 3452/2160) 180vh, 115vw';

// 2880 serves phones at 1.75× to 2× (180vh asks for ~2600 to 2900 device px), which would
// otherwise jump to the 3452 px original.
export const STORY_ART = responsiveImage(storyArt, [960, 1440, 1920, 2560, 2880], STORY_ART_SIZES);
