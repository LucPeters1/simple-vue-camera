import { PropType } from "vue";
import { Resolution } from "./resolution";
declare const _default: import("vue").DefineComponent<{
    resolution: {
        type: PropType<Resolution>;
        default: () => {
            width: number;
            height: number;
        };
    };
    facingMode: {
        type: StringConstructor;
        default: string;
    };
    autoplay: {
        type: BooleanConstructor;
        default: boolean;
    };
    playsinline: {
        type: BooleanConstructor;
        default: boolean;
    };
    constraints: {
        type: PropType<MediaStreamConstraints>;
        required: false;
    };
}, {
    start: () => Promise<void>;
    stop: () => void;
    video: import("vue").Ref<HTMLVideoElement | null>;
    snapshot: (resolution?: Resolution, type?: string, quality?: number | undefined) => Promise<Blob | null>;
    canvas: import("vue").Ref<HTMLCanvasElement | null>;
    devices: (kinds?: MediaDeviceKind[]) => Promise<MediaDeviceInfo[]>;
    currentDeviceID: () => string | undefined;
    pause: () => void;
    resume: () => void;
    changeCamera: (deviceID: string) => Promise<void>;
    stream: import("vue").Ref<{
        readonly active: boolean;
        readonly id: string;
        onaddtrack: ((this: MediaStream, ev: MediaStreamTrackEvent) => any) | null;
        onremovetrack: ((this: MediaStream, ev: MediaStreamTrackEvent) => any) | null;
        addTrack: (track: MediaStreamTrack) => void;
        clone: () => MediaStream;
        getAudioTracks: () => MediaStreamTrack[];
        getTrackById: (trackId: string) => MediaStreamTrack | null;
        getTracks: () => MediaStreamTrack[];
        getVideoTracks: () => MediaStreamTrack[];
        removeTrack: (track: MediaStreamTrack) => void;
        addEventListener: {
            <K extends "addtrack" | "removetrack">(type: K, listener: (this: MediaStream, ev: MediaStreamEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
            (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
        };
        removeEventListener: {
            <K_1 extends "addtrack" | "removetrack">(type: K_1, listener: (this: MediaStream, ev: MediaStreamEventMap[K_1]) => any, options?: boolean | EventListenerOptions | undefined): void;
            (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions | undefined): void;
        };
        dispatchEvent: (event: Event) => boolean;
    } | null>;
    zoomLevel: import("vue").Ref<number>;
    zoomIn: () => void;
    zoomOut: () => void;
    onTouchStart: (event: TouchEvent) => void;
    onTouchMove: (event: TouchEvent) => void;
    onTouchEnd: (event: TouchEvent) => void;
    videoStyles: import("vue").ComputedRef<{
        transform: string;
    }>;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("loading" | "started" | "stopped" | "paused" | "resumed" | "camera-change" | "snapshot" | "error")[], "loading" | "started" | "stopped" | "paused" | "resumed" | "camera-change" | "snapshot" | "error", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    resolution: {
        type: PropType<Resolution>;
        default: () => {
            width: number;
            height: number;
        };
    };
    facingMode: {
        type: StringConstructor;
        default: string;
    };
    autoplay: {
        type: BooleanConstructor;
        default: boolean;
    };
    playsinline: {
        type: BooleanConstructor;
        default: boolean;
    };
    constraints: {
        type: PropType<MediaStreamConstraints>;
        required: false;
    };
}>> & {
    onLoading?: ((...args: any[]) => any) | undefined;
    onStarted?: ((...args: any[]) => any) | undefined;
    onStopped?: ((...args: any[]) => any) | undefined;
    onPaused?: ((...args: any[]) => any) | undefined;
    onResumed?: ((...args: any[]) => any) | undefined;
    "onCamera-change"?: ((...args: any[]) => any) | undefined;
    onSnapshot?: ((...args: any[]) => any) | undefined;
    onError?: ((...args: any[]) => any) | undefined;
}, {
    resolution: Resolution;
    facingMode: string;
    autoplay: boolean;
    playsinline: boolean;
}>;
export default _default;
