<template>
    <div id="app-camera-container">
        <camera
            ref="camera"
            @loading="logEvent('loading')"
            @started="logEvent('started')"
            @error="(error) => logEvent('error: ' + error)"
        >
            <!-- Moved Zoom Buttons Inside the Camera Slot -->
            <div id="zoom-controls">
                <span>Zoom Level: {{ formattedZoomLevel }}x</span>
            </div>
        </camera>
    </div>

    <img :src="currentSnapshot" />

    <div>
        <button @click="start">Start</button>
        <button @click="stop">Stop</button>
        <button @click="pause">Pause</button>
        <button @click="resume">Resume</button>
        <button @click="snapshot">Snapshot</button>
        <button @click="zoomIn">Zoom In</button>
        <button @click="zoomOut">Zoom Out</button>
    </div>

    <select @change="changeCamera">
        <option
            v-for="device in cameras"
            :key="device.deviceId"
            :value="device.deviceId"
        >
            {{ device.label || device.deviceId }}
        </option>
    </select>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from "vue";
import Camera from "@/components/Camera.vue";

export default defineComponent({
    name: "App",
    components: {
        Camera,
    },
    setup() {
        const camera = ref<InstanceType<typeof Camera> | null>(null);

        const cameras = ref<MediaDeviceInfo[]>([]);

        const zoomLevel = ref<number>(1);

        const updateZoomLevel = () => {
            if (camera.value?.zoomLevel !== undefined) {
                zoomLevel.value = parseFloat(camera.value.zoomLevel.toFixed(1));
            }
        };

        onMounted(async () => {
            if (!camera.value) return;
            try {
                cameras.value = await camera.value.devices(["videoinput"]);
            } catch (e) {
                console.error(e);
            }
        });

        const start = () => {
            camera.value?.start();
            updateZoomLevel();
        };
        const stop = () => camera.value?.stop();
        const pause = () => camera.value?.pause();
        const resume = () => camera.value?.resume();
        const snapshot = async () => {
            const blob = await camera.value?.snapshot({
                width: 1280,
                height: 720,
            });
            if (blob) {
                currentSnapshot.value = URL.createObjectURL(blob);
            }
        };

        const zoomIn = () => {
            camera.value?.zoomIn();
            updateZoomLevel();
        };

        const zoomOut = () => {
            camera.value?.zoomOut();
            updateZoomLevel();
        };

        const logEvent = (name: string) => console.log(name);

        const currentSnapshot = ref<string | undefined>();

        const changeCamera = (event: Event) => {
            const target = event.target as HTMLSelectElement;
            camera.value?.changeCamera(target.value);
        };

        const formattedZoomLevel = computed(() => zoomLevel.value.toFixed(1));

        return {
            camera,
            start,
            stop,
            pause,
            resume,
            logEvent,
            snapshot,
            currentSnapshot,
            cameras,
            changeCamera,
            zoomIn,
            zoomOut,
            formattedZoomLevel,
        };
    },
});
</script>

<style scoped>
#app-camera-container {
  position: relative;
  width: 800px;
  height: 500px;
  overflow: hidden; /* Prevent video from overflowing the container when zoomed */
}


#zoom-controls {
    position: absolute;
    bottom: 10px;
    left: 10px;
    z-index: 1;
}

#zoom-controls button {
    margin-right: 5px;
}

#zoom-controls span {
    color: white;
    font-weight: bold;
}

img {
    max-width: 100%;
    display: block;
    margin: 10px auto;
}
</style>
