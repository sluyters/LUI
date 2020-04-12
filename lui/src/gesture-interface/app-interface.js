import { w3cwebsocket as W3CWebSocket } from "websocket";

class GestureHandler {
    
    constructor() {
        this.handlers = {};
        this.forEachHandler = (gesture) => {};
        this.frameHandler = (frame) => {};

        // Connect to the gesture recognizer.
        this.client = new W3CWebSocket('ws://127.0.0.1:6442');
        this.client.onopen = function() {
            console.log('WebSocket Client Connected');
        };
        this.client.onmessage = function(event) {
            let data = JSON.parse(event.data);
            if (data.hasOwnProperty('gesture')) {
                if (this.handlers.hasOwnProperty(data.gesture)) {
                    this.handlers[data.gesture]();
                    this.forEachHandler(data.gesture);
                }
            } else if (data.hasOwnProperty('frame')) {
                this.frameHandler(data.frame);
            }
        }.bind(this);
    }

    /**
     * Perform an action related to a gesture.
     * @callback frameCallback
     * @param {Object} frame - The data from the sensor.
     */

    /**
     * Execute the callback each time a frame is received from the sensor.
     * @param {frameCallback} callback - The callback that handles the frame
     */
    onFrame(callback) {
        this.frameHandler = callback;
    }

    /**
     * Perform an action for each gesture.
     * @callback gesturesCallback
     * @param {string} gesture - The name of the detected gesture.
     */

    /**
     * Execute the callback each time any gesture is detected.
     * @param {gesturesCallback} callback - The callback that handles the gestures.
     */
    onEachGesture(callback) {
        this.forEachHandler = callback;
    }

    /**
     * Perform an action related to a gesture.
     * @callback gestureCallback
     */

    /**
     * Execute the callback each time the gesture is detected.
     * @param {string} gesture - The name of the gesture which should trigger the callback.
     * @param {gestureCallback} callback - The callback that handles the gesture.
     */
    onGesture(gesture, callback) {
        this.handlers[gesture] = callback;
    }

    /**
     * Remove the callback associated to the gesture.
     * @param {string} gesture - The name of the gesture for which the callback should be removed.
     */
    removeGestureHandler(gesture) {
        if (this.handlers.hasOwnProperty(gesture)) {
            delete this.handlers[gesture];
        }
    }

    /**
     * Disconnect from the gesture recognizer.
     */
    disconnect() {
        this.client.close();
    }
}

export default GestureHandler