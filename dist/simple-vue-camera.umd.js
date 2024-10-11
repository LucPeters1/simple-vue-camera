(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('vue')) :
    typeof define === 'function' && define.amd ? define(['vue'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.SimpleVueCamera = factory(global.vue));
})(this, (function (vue) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    var script = vue.defineComponent({
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
                type: Object,
                default: function () {
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
                type: Object,
                required: false,
            },
        },
        setup: function (props, _a) {
            var _this = this;
            var emit = _a.emit;
            // References to the video and canvas elements
            var video = vue.ref(null);
            var canvas = vue.ref(null);
            var stream = vue.ref(null);
            // Zoom level state
            var zoomLevel = vue.ref(1);
            var maxZoom = 3; // Maximum zoom level
            // Function to zoom in
            var zoomIn = function () {
                zoomLevel.value = Math.min(maxZoom, zoomLevel.value + 0.1);
            };
            // Function to zoom out
            var zoomOut = function () {
                zoomLevel.value = Math.max(1, zoomLevel.value - 0.1);
            };
            // Variables for touch-based pinch-to-zoom
            var initialDistance = null;
            var initialZoomLevel = null;
            // Calculate distance between two touch points
            var getDistance = function (touches) {
                var _a = Array.from(touches), touch1 = _a[0], touch2 = _a[1];
                var dx = touch1.clientX - touch2.clientX; // delta of the horizontal distance between 2 touch points
                var dy = touch1.clientY - touch2.clientY; // delta of the vertical distance between 2 touch points
                return Math.hypot(dx, dy); // Calculate the Euclidean distance
            };
            // Handle touch start event
            var onTouchStart = function (event) {
                if (event.touches.length === 2) {
                    initialDistance = getDistance(event.touches); // Record initial distance
                    initialZoomLevel = zoomLevel.value; // Record initial zoom level
                }
            };
            // Handle touch move event
            var onTouchMove = function (event) {
                if (event.touches.length === 2 &&
                    initialDistance &&
                    initialZoomLevel !== null) {
                    var currentDistance = getDistance(event.touches); // Current distance between touches
                    var scaleChange = currentDistance / initialDistance; // Calculate scale change
                    var newZoomLevel = initialZoomLevel * scaleChange; // New zoom level
                    // Clamp zoom level between 1 and maxZoom
                    zoomLevel.value = Math.min(maxZoom, Math.max(1, newZoomLevel));
                }
            };
            // Handle touch end event
            var onTouchEnd = function (event) {
                if (event.touches.length < 2) {
                    initialDistance = null;
                    initialZoomLevel = null;
                }
            };
            // Define media stream constraints
            var constraints = props.constraints || {
                video: {
                    width: props.resolution.width,
                    height: props.resolution.height,
                    facingMode: props.facingMode,
                },
                audio: false,
            };
            // Get list of media devices
            var devices = function (kinds) {
                if (kinds === void 0) { kinds = ["audioinput", "videoinput"]; }
                return __awaiter(_this, void 0, void 0, function () {
                    var devices;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
                            case 1:
                                devices = _a.sent();
                                return [2 /*return*/, devices.filter(function (device) { return kinds.includes(device.kind); })];
                        }
                    });
                });
            };
            // Get current device ID
            var currentDeviceID = function () {
                if (!stream.value)
                    return;
                var tracks = stream.value
                    .getVideoTracks()
                    .map(function (track) { return track.getSettings().deviceId; });
                if (tracks.length > 0)
                    return tracks[0];
            };
            // Start the camera
            var start = function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, err_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            emit("loading");
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            _a = stream;
                            return [4 /*yield*/, navigator.mediaDevices.getUserMedia(constraints)];
                        case 2:
                            _a.value = _b.sent();
                            if (!video.value)
                                throw new Error("Video ref is null");
                            video.value.srcObject = stream.value;
                            emit("started");
                            return [3 /*break*/, 4];
                        case 3:
                            err_1 = _b.sent();
                            emit("error", err_1);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); };
            // Take a snapshot
            var snapshot = function (resolution, type, quality) {
                if (resolution === void 0) { resolution = props.resolution; }
                if (type === void 0) { type = "image/png"; }
                return __awaiter(_this, void 0, void 0, function () {
                    var width, height, context, videoWidth, videoHeight, sWidth, sHeight, sx, sy;
                    return __generator(this, function (_a) {
                        if (!video.value)
                            throw new Error("Video ref is null");
                        if (!canvas.value)
                            throw new Error("Canvas ref is null");
                        width = resolution.width, height = resolution.height;
                        canvas.value.width = width;
                        canvas.value.height = height;
                        context = canvas.value.getContext("2d");
                        if (!context)
                            return [2 /*return*/, null];
                        videoWidth = video.value.videoWidth;
                        videoHeight = video.value.videoHeight;
                        sWidth = videoWidth / zoomLevel.value;
                        sHeight = videoHeight / zoomLevel.value;
                        sx = (videoWidth - sWidth) / 2;
                        sy = (videoHeight - sHeight) / 2;
                        // Draw the zoomed-in video frame onto the canvas
                        context.drawImage(video.value, sx, sy, sWidth, sHeight, 0, 0, width, height);
                        return [2 /*return*/, new Promise(function (resolve) {
                                var _a;
                                (_a = canvas.value) === null || _a === void 0 ? void 0 : _a.toBlob(function (blob) {
                                    emit("snapshot", blob);
                                    resolve(blob);
                                }, type, quality);
                            })];
                    });
                });
            };
            // Change the camera
            var changeCamera = function (deviceID) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            stop();
                            if (constraints.video && typeof constraints.video !== "boolean") {
                                constraints.video.deviceId = { exact: deviceID };
                            }
                            else {
                                constraints.video = { deviceId: { exact: deviceID } };
                            }
                            return [4 /*yield*/, start()];
                        case 1:
                            _a.sent();
                            emit("camera-change", deviceID);
                            return [2 /*return*/];
                    }
                });
            }); };
            // Resume the video stream
            var resume = function () {
                var _a;
                (_a = video.value) === null || _a === void 0 ? void 0 : _a.play();
                emit("resumed");
            };
            // Pause the video stream
            var pause = function () {
                var _a;
                (_a = video.value) === null || _a === void 0 ? void 0 : _a.pause();
                emit("paused");
            };
            // Stop the video stream
            var stop = function () {
                var _a;
                (_a = stream.value) === null || _a === void 0 ? void 0 : _a.getTracks().forEach(function (track) { return track.stop(); });
                emit("stopped");
            };
            vue.onMounted(function () {
                if (!navigator.mediaDevices)
                    throw new Error("Media devices not available");
                if (props.playsinline && video.value) {
                    video.value.setAttribute("playsinline", "");
                }
                if (props.autoplay)
                    start();
            });
            vue.onUnmounted(function () { return stop(); });
            // Compute styles for the video element to handle zoom and centering
            var videoStyles = vue.computed(function () {
                var scale = zoomLevel.value;
                var translate = ((scale - 1) / 2) * 100;
                return {
                    // Translate and scale the video to keep it centered when zoomed
                    transform: "translate(-" + translate + "%, -" + translate + "%) scale(" + scale + ")",
                };
            });
            return {
                start: start,
                stop: stop,
                video: video,
                snapshot: snapshot,
                canvas: canvas,
                devices: devices,
                currentDeviceID: currentDeviceID,
                pause: pause,
                resume: resume,
                changeCamera: changeCamera,
                stream: stream,
                zoomLevel: zoomLevel,
                zoomIn: zoomIn,
                zoomOut: zoomOut,
                onTouchStart: onTouchStart,
                onTouchMove: onTouchMove,
                onTouchEnd: onTouchEnd,
                videoStyles: videoStyles,
            };
        },
    });

    const _hoisted_1 = { id: "camera-container" };
    const _hoisted_2 = { id: "slot-container" };
    const _hoisted_3 = {
      ref: "canvas",
      id: "canvas"
    };

    function render(_ctx, _cache, $props, $setup, $data, $options) {
      return (vue.openBlock(), vue.createElementBlock(vue.Fragment, null, [
        vue.createElementVNode("div", _hoisted_1, [
          vue.createElementVNode("video", {
            style: vue.normalizeStyle(_ctx.videoStyles),
            onTouchstart: _cache[0] || (_cache[0] = vue.withModifiers((...args) => (_ctx.onTouchStart && _ctx.onTouchStart(...args)), ["prevent"])),
            onTouchmove: _cache[1] || (_cache[1] = vue.withModifiers((...args) => (_ctx.onTouchMove && _ctx.onTouchMove(...args)), ["prevent"])),
            onTouchend: _cache[2] || (_cache[2] = (...args) => (_ctx.onTouchEnd && _ctx.onTouchEnd(...args))),
            autoplay: "",
            ref: "video",
            id: "video"
          }, null, 36 /* STYLE, HYDRATE_EVENTS */),
          vue.createElementVNode("div", _hoisted_2, [
            vue.renderSlot(_ctx.$slots, "default")
          ])
        ]),
        vue.createElementVNode("canvas", _hoisted_3, null, 512 /* NEED_PATCH */)
      ], 64 /* STABLE_FRAGMENT */))
    }

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css_248z = "\n#camera-container[data-v-74104ed5] {\n    position: relative;\n    width: 100%;\n    height: 100%;\n    overflow: hidden; /* Prevent video from overflowing the container when zoomed */\n}\n#slot-container[data-v-74104ed5] {\n    position: absolute;\n    height: 100%;\n    width: 100%;\n    left: 0;\n    top: 0;\n    pointer-events: none; /* Allow interactions with underlying elements */\n}\n#video[data-v-74104ed5] {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  object-fit: contain; /* Ensure video covers the container */\n  transition: transform 0.2s ease; /* Smooth transition when zooming */\n  transform-origin: center center; /* Zoom from the center */\n}\n#canvas[data-v-74104ed5] {\n    display: none;\n}\n  ";
    styleInject(css_248z);

    script.render = render;
    script.__scopeId = "data-v-74104ed5";
    script.__file = "src/components/Camera.vue";

    return script;

}));
