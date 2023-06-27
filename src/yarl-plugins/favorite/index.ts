import { Slide } from "yet-another-react-lightbox";

import { Favorite } from "./Favorite";

declare module "yet-another-react-lightbox" {
    /** Adds the favorite property to every slide type */
    interface GenericSlide {
        favorite: string[]
    }

    interface LightboxProps {
        /** Slideshow plugin settings */
        favorite?: {
            /** Event fired when the state is changed */
            onChange?: (index: number, isFavorite: boolean, slide: Slide) => void;
        };
    }
}

export default Favorite;
