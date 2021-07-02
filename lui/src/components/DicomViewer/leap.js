import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import GestureHandler from 'quantumleapjs';

const fingers = ["#9bcfedBB", "#B2EBF2CC", "#80DEEABB", "#4DD0E1BB", "#26C6DABB"];
const left_fingers = ["#d39bed", "#e1b1f1", "#ca80ea", "#b74ce1", "#a425da"];
const paused_fingers = ["#9bed9b", "#b1f0b1", "#80ea80", "#4ce14c", "#25da25"];
const pausedStatic_fingers = ["#ee0231", "#e50b36", "#dc143c", "#d31d42", "#ca2647"];

const styles = {
    canvas: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        zIndex: 500,
        pointerEvents: 'none',
    }

};

class Leap extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            indexFinger: "",
            hovered: -1,
            clicked: -1,
            pause: 4,
            pauseStatic: 4,
        }
        this.gestureHandler = new GestureHandler();
    }

    componentDidMount() {
        this.gestureHandler.registerGestures('dynamic', ['rhand_uswipe']);
        this.gestureHandler.registerGestures('static', ['pinch', 'thumb', 'point-index']);
        this.gestureHandler.addEventListener('gesture', (event) => {
            let gesture = event.gesture;
            if (gesture.type === 'static') {
                this.setState({ pauseStatic: 4 });
            } else if (gesture.type === 'dynamic') {
                this.setState({ pause: 4 });
            }
            switch (gesture.name) {
                case 'rhand_uswipe': {
                    this.props.handleSwipeUp();
                    break;
                }
                case 'point-index':
                    this.props.handlePoint(gesture.data.translation);
                    break;
                case 'pinch':
                    this.props.handlePinch(gesture.data.pinch, gesture.data.translation);
                    break;
                case 'thumb': {
                    let thumbUp = gesture.data.thumbVector[1] > 40;
                    let thumbDown = gesture.data.thumbVector[1] < -40;
                    if (thumbUp) {
                        console.log("THUMB UP");
                        this.props.handleThumb(true);
                    }
                    if (thumbDown) {
                        console.log("THUMB DOWN");
                        this.props.handleThumb(false);
                    }
                    break;
                }
                default:
                    console.log(`No action associated to '${gesture.name}' gesture.`)
            }
        });
        this.gestureHandler.addEventListener('frame', (event) => {
            if (event.frame.fingers.length != 0) {
                this.setState({ hand: true });
            } else {
                this.setState({ hand: false });
            }
            this.traceFingers(event.frame.fingers);
        });
        this.gestureHandler.connect();
        this.timer = setInterval(() => {
            if (this.state.pause > 0) {
                this.setState({ pause: this.state.pause - 1 });
            }
            if (this.state.pauseStatic > 0) {
                this.setState({pauseStatic: this.state.pauseStatic - 1})
            }
        }, 100);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        this.gestureHandler.removeEventListeners();
        this.gestureHandler.disconnect();
    }

    traceFingers(pointables) {
        try {
            // TODO: make canvas and ctx global
            const canvas = this.refs.canvas;
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const { pause } = this.state;
            const { pauseStatic } = this.state;
            pointables.forEach((pointable) => {
                let color = fingers[pointable.type];
                if (pause) {
                    color = paused_fingers[pointable.type];
                } else if (pauseStatic) {
                    // color = pausedStatic_fingers[pointable.type];                
                }
                //const color = pause > 0 ? paused_fingers[pointable.type] : fingers[pointable.type];
                const normalized = pointable.normalizedPosition;
                const x = ctx.canvas.width * normalized[0];
                const y = ctx.canvas.height * (1 - normalized[1]);
                const radius = Math.min(20 / Math.abs(pointable.touchDistance), 50);
                this.drawCircle([x, y], radius, color, pointable.type === 1);

                if (pointable.type === 1 && pointable.hand === 'right') {
                    this.setState({
                        indexFinger: { x, y, vel: pointable.tipVelocity[2] }
                    })
                }
            });
        } catch (err) {
            // console.log("ERR", err);
        }
    }

    drawCircle(center, radius, color, fill) { //draws a circle
        const canvas = this.refs.canvas;
        const ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.lineWidth = 10;
        if (fill) {
            ctx.fillStyle = color;
            ctx.fill();
        } else {
            ctx.strokeStyle = color;
            ctx.stroke();
        }
    }

    render() {
        const { classes } = this.props;
        return (
            <canvas className={classes.canvas} ref="canvas"></canvas>
        )
    }

}


Leap.propTypes = {
    photos: PropTypes.array,
    handleExit: PropTypes.func,
    handleRotate: PropTypes.func,        
    handlePinch: PropTypes.func,         
    handlePoint: PropTypes.func,
    handleThumb: PropTypes.func
};

// TODO: better default values
Leap.defaultProps = {
    photos: [],
};

export default withStyles(styles)(Leap);
