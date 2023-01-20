import { GenericSlide } from "yet-another-react-lightbox/types";
import { LivePhoto } from "./LivePhoto";

/** Video slide attributes */
export interface SlideLivePhoto extends GenericSlide {
    /** video slide type marker */
    type: "live";
    /** video placeholder image */
    poster?: string;
    /** video width in pixels */
    width?: number;
    /** video height in pixels */
    height?: number;
    /** if `true`, the video automatically begins to play */
    autoPlay?: boolean;
    /** if `true`, the browser will offer controls to allow the user to control video playback */
    controls?: boolean;
    /** indicates what controls to show */
    controlsList?: string;
    /** indicates whether to use CORS to fetch the related video */
    crossOrigin?: string;
    /** video preload setting */
    preload?: string;
    /** if `true`, the browser will automatically seek back to the start upon reaching the end of the video */
    loop?: boolean;
    /** the default setting of the audio contained in the video */
    muted?: boolean;
    /** if `true`, the video is to be played "inline", that is within the element's playback area */
    playsInline?: boolean;
    /** prevents the browser from suggesting a Picture-in-Picture context menu */
    disablePictureInPicture?: boolean;
    /** disables the capability of remote playback */
    disableRemotePlayback?: boolean;
    /** an array of video files */
    sources: {
        /** video source URL */
        src: string;
        /** video source type (e.g., `video/mp4`) */
        type: string;
    }[];
}

declare module "yet-another-react-lightbox/types" {
    // noinspection JSUnusedGlobalSymbols
    interface SlideTypes {
        /** video slide type */
        SlideLivePhoto: SlideLivePhoto;
    }

    interface LightboxProps {
        /** video plugin settings */
        video?: Pick<
            SlideLivePhoto,
            | "autoPlay"
            | "controls"
            | "controlsList"
            | "crossOrigin"
            | "preload"
            | "loop"
            | "muted"
            | "playsInline"
            | "disablePictureInPicture"
            | "disableRemotePlayback"
        >;
    }
}

export default LivePhoto;
