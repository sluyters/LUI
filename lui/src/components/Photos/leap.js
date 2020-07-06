import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import GestureHandler from '../../gesture-interface/app-interface' // Added

const fingers = ["#9bcfedBB", "#B2EBF2CC", "#80DEEABB", "#4DD0E1BB", "#26C6DABB"];
const left_fingers = ["#d39bed", "#e1b1f1", "#ca80ea", "#b74ce1", "#a425da"];
const paused_fingers = ["#9bed9b", "#b1f0b1", "#80ea80", "#4ce14c", "#25da25"];

const styles = {
    canvas: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        zIndex: 10,
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
        }
    }

    componentDidMount() {
        let gestureHandler = new GestureHandler();
        this.gestureHandler = gestureHandler;
        gestureHandler.onEachGesture(function (gesture) {
            console.log(gesture);
            this.setState({ pause: 4 });
        }.bind(this));
        gestureHandler.onGesture("rhand_lswipe", function () {
            this.props.handleSwipe("left");
        }.bind(this));
        gestureHandler.onGesture("rhand_rswipe", function () {
            this.props.handleSwipe("right");
        }.bind(this));
        gestureHandler.onGesture("rhand_uswipe", function () {
            let clicked = this.state.clicked;
            if (clicked != -1) {
                gestureHandler.removePoseHandler("grab");
                gestureHandler.removePoseHandler("pinch");
                gestureHandler.removePoseHandler("thumb");
                clicked = -1;
                this.setState({ clicked });
            }
            this.props.handleSwipeUp();
        }.bind(this));
        gestureHandler.onGesture("rindex_airtap", function () {
            var { clicked, hovered } = this.state;
            if (clicked == -1 && hovered != -1) {
                gestureHandler.onPose("grab", function (data) {
                    this.props.handleRotate(data.rotation);
                }.bind(this));
                gestureHandler.onPose("pinch", function (data) {
                    this.props.handlePinch(data.pinch, data.translation);
                }.bind(this));
                gestureHandler.onPose("thumb", function (data) {
                    let thumbUp = data.thumbVector[1] > 40;
                    let thumbDown = data.thumbVector[1] < -40;
                    if (thumbUp) {
                        console.log("THUMB UP");
                        this.props.handleThumb(true);
                    }
                    if (thumbDown) {
                        console.log("THUMB DOWN");
                        this.props.handleThumb(false);
                    }
                }.bind(this));
                clicked = hovered;
                this.props.handleClick(clicked);
                this.setState({ clicked: clicked, hovered: -1});
            }
        }.bind(this));
        this.gestureHandler.onFrame(function (frame) {
            var { clicked, hovered } = this.state;
            this.traceFingers(frame.fingers);
            if (frame.fingers.length != 0) {
                if (clicked == -1) {
                    hovered = this.checkHover();
                    this.setState({ hovered });
                    this.props.handleHover(hovered);
                }
            }
        }.bind(this));

        this.timer = setInterval(() => {
            if (this.state.pause > 0) {
                this.setState({ pause: this.state.pause - 1 });
            }
        }, 100);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
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

            pointables.forEach((pointable) => {
                const color = pause > 0 ? paused_fingers[pointable.type] : fingers[pointable.type];
                const normalized = pointable.normalizedPosition;
                const x = ctx.canvas.width * normalized[0];
                const y = ctx.canvas.height * (1 - normalized[1]);
                const radius = Math.min(20 / Math.abs(pointable.touchDistance), 50);
                this.drawCircle([x, y], radius, color, pointable.type === 1);

                if (pointable.type == 1) {
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

    checkHover() { //returns which photo is hovered
        const photos = this.props.photos;
        const { x, y } = this.state.indexFinger;
        for (let i = 0; i < photos.length; i++) {
            if (photos[i] && photos[i].current) {
                const dims = photos[i].current.getBoundingClientRect();
                if (x > dims.left && x < dims.right &&
                    y > dims.top && y < dims.bottom) {
                    return i;
                }
            }
        }
        return -1;
    }

    // timer() {
    //     // setState method is used to update the state
    //     this.setState({ currentCount: this.state.currentCount - 1 });
    // }

    render() {
        const { classes } = this.props;
        return (
            <canvas className={classes.canvas} ref="canvas"></canvas>
        )
    }

}


Leap.propTypes = {
    photos: PropTypes.array,
    handleHover: PropTypes.func,
    handleSwipe: PropTypes.func,
    handleExit: PropTypes.func,
    handleRotate: PropTypes.func,        
    handlePinch: PropTypes.func,         
    handleTranslate: PropTypes.func,
    handleThumb: PropTypes.func
};

// TODO: better default values
Leap.defaultProps = {
    photos: [],
};

export default withStyles(styles)(Leap);
