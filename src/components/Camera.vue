<template>
    <div id="camera-container">
      <video
        :style="videoStyles" 
        @touchstart.prevent="onTouchStart" 
        @touchmove.prevent="onTouchMove" 
        @touchend="onTouchEnd" 
        autoplay
        ref="video"
        id="video"
      ></video>
      <div id="slot-container">
        <slot></slot>
      </div>
    </div>
    <canvas ref="canvas" id="canvas"></canvas>
  </template>
  
  <script lang="ts">
  import {
    defineComponent,
    onMounted,
    onUnmounted,
    PropType,
    ref,
    computed,
  } from "vue";
  import { Resolution } from "./resolution";
  
  export default defineComponent({
    name: "Camera",
    emits: [
      "loading",
      "started",
      "stopped",
      "paused",
      "resumed",
      "camera-change",
      "snapshot",
      "error",
    ],
    props: {
      resolution: {
        type: Object as PropType<Resolution>,
        default: () => {
          return { width: 1920, height: 1080 };
        },
      },
      facingMode: {
        type: String,
        default: "environment",
      },
      autoplay: {
        type: Boolean,
        default: true,
      },
      playsinline: {
        type: Boolean,
        default: true,
      },
      constraints: {
        type: Object as PropType<MediaStreamConstraints>,
        required: false,
      },
    },
    setup(props, { emit }) {
      // References to the video and canvas elements
      const video = ref<HTMLVideoElement | null>(null);
      const canvas = ref<HTMLCanvasElement | null>(null);
      const stream = ref<MediaStream | null>(null);
  
      // Zoom level state
      const zoomLevel = ref(1);
      const maxZoom = 3; // Maximum zoom level
  
      // Function to zoom in
      const zoomIn = () => {
        zoomLevel.value = Math.min(maxZoom, zoomLevel.value + 0.1);
      };
  
      // Function to zoom out
      const zoomOut = () => {
        zoomLevel.value = Math.max(1, zoomLevel.value - 0.1);
      };
  
      // Variables for touch-based pinch-to-zoom
      let initialDistance: number | null = null;
      let initialZoomLevel: number | null = null;
  
      // Calculate distance between two touch points
      const getDistance = (touches: TouchList): number => {
        const [touch1, touch2] = Array.from(touches);
        const dx = touch1.clientX - touch2.clientX; // delta of the horizontal distance between 2 touch points
        const dy = touch1.clientY - touch2.clientY; // delta of the vertical distance between 2 touch points
        return Math.hypot(dx, dy); // Calculate the Euclidean distance
      };
  
      // Handle touch start event
      const onTouchStart = (event: TouchEvent) => {
        if (event.touches.length === 2) {
          initialDistance = getDistance(event.touches); // Record initial distance
          initialZoomLevel = zoomLevel.value; // Record initial zoom level
        }
      };
  
      // Handle touch move event
      const onTouchMove = (event: TouchEvent) => {
        if (
          event.touches.length === 2 &&
          initialDistance &&
          initialZoomLevel !== null
        ) {
          const currentDistance = getDistance(event.touches); // Current distance between touches
          const scaleChange = currentDistance / initialDistance; // Calculate scale change
          const newZoomLevel = initialZoomLevel * scaleChange; // New zoom level
          // Clamp zoom level between 1 and maxZoom
          zoomLevel.value = Math.min(maxZoom, Math.max(1, newZoomLevel));
        }
      };

      // Handle touch end event
      const onTouchEnd = (event: TouchEvent) => {
        if (event.touches.length < 2) {
          initialDistance = null;
          initialZoomLevel = null;
        }
      };

      // Define media stream constraints
      const constraints: MediaStreamConstraints = props.constraints || {
        video: {
          width: props.resolution.width,
          height: props.resolution.height,
          facingMode: props.facingMode,
        },
        audio: false,
      };
  
      // Get list of media devices
      const devices = async (
        kinds: MediaDeviceKind[] = ["audioinput", "videoinput"]
      ): Promise<MediaDeviceInfo[]> => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter((device) => kinds.includes(device.kind));
      };
  
      // Get current device ID
      const currentDeviceID = (): string | undefined => {
        if (!stream.value) return;
  
        const tracks = stream.value
          .getVideoTracks()
          .map((track: MediaStreamTrack) => track.getSettings().deviceId);
  
        if (tracks.length > 0) return tracks[0];
      };
  
      // Start the camera
      const start = async (): Promise<void> => {
        emit("loading");
  
        try {
          stream.value = await navigator.mediaDevices.getUserMedia(constraints);
  
          if (!video.value) throw new Error("Video ref is null");
  
          video.value.srcObject = stream.value;
  
          emit("started");
        } catch (err) {
          emit("error", err);
        }
      };
  
      // Take a snapshot
      const snapshot = async (
        resolution: Resolution = props.resolution,
        type = "image/png",
        quality?: number
      ): Promise<Blob | null> => {
        if (!video.value) throw new Error("Video ref is null");
        if (!canvas.value) throw new Error("Canvas ref is null");
  
        const { width, height } = resolution;
  
        canvas.value.width = width;
        canvas.value.height = height;
  
        const context = canvas.value.getContext("2d");
        if (!context) return null;
  
        const videoWidth = video.value.videoWidth;
        const videoHeight = video.value.videoHeight;
  
        // Calculate the source dimensions based on zoom level to capture the zoomed-in area
        const sWidth = videoWidth / zoomLevel.value;
        const sHeight = videoHeight / zoomLevel.value;
        const sx = (videoWidth - sWidth) / 2; // X coordinate of the top-left corner
        const sy = (videoHeight - sHeight) / 2; // Y coordinate of the top-left corner
  
        // Draw the zoomed-in video frame onto the canvas
        context.drawImage(
          video.value,
          sx,
          sy,
          sWidth,
          sHeight,
          0,
          0,
          width,
          height
        );
  
        return new Promise((resolve) => {
          canvas.value?.toBlob(
            (blob: Blob | null) => {
              emit("snapshot", blob);
              resolve(blob);
            },
            type,
            quality
          );
        });
      };
  
      // Change the camera
      const changeCamera = async (deviceID: string): Promise<void> => {
        stop();
        if (constraints.video && typeof constraints.video !== "boolean") {
          constraints.video.deviceId = { exact: deviceID };
        } else {
          constraints.video = { deviceId: { exact: deviceID } };
        }
        await start();
        emit("camera-change", deviceID);
      };
  
      // Resume the video stream
      const resume = (): void => {
        video.value?.play();
        emit("resumed");
      };
  
      // Pause the video stream
      const pause = (): void => {
        video.value?.pause();
        emit("paused");
      };
  
      // Stop the video stream
      const stop = (): void => {
        stream.value?.getTracks().forEach((track) => track.stop());
        emit("stopped");
      };
  
      onMounted(() => {
        if (!navigator.mediaDevices)
          throw new Error("Media devices not available");
  
        if (props.playsinline && video.value) {
          video.value.setAttribute("playsinline", "");
        }
  
        if (props.autoplay) start();
      });
  
      onUnmounted(() => stop());
  
      // Compute styles for the video element to handle zoom and centering
      const videoStyles = computed(() => {
        const scale = zoomLevel.value;
        const translate = ((scale - 1) / 2) * 100;
        return {
          // Translate and scale the video to keep it centered when zoomed
          transform: `translate(-${translate}%, -${translate}%) scale(${scale})`,
        };
      });
  
      return {
        start,
        stop,
        video,
        snapshot,
        canvas,
        devices,
        currentDeviceID,
        pause,
        resume,
        changeCamera,
        stream,
        zoomLevel,
        zoomIn,
        zoomOut,
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        videoStyles,
      };
    },
  });
  </script>
  
  <style scoped>
  #camera-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden; /* Prevent video from overflowing the container when zoomed */
  }
  
  #slot-container {
    position: absolute;
    height: 100%;
    width: 100%;
    left: 0;
    top: 0;
    pointer-events: none; /* Allow interactions with underlying elements */
  }
  
  #video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain; /* Ensure video covers the container */
  transition: transform 0.2s ease; /* Smooth transition when zooming */
  transform-origin: center center; /* Zoom from the center */
}

  
  #canvas {
    display: none;
  }
  </style>
  