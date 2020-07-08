import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import Home from '@material-ui/icons/Home';
import GestureHandler from '../../gesture-interface/app-interface'; // Added

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
            hand: false,
            indexFinger: "",
            hovered: -1,
            clicked: -1,
            amiclicked: "",
            pause: 4,
            lhovered: "",
            intervalId1: 0,
            intervalId2: 0,
            intervalId3: 0,
            intervalId4: 0,
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ amiclicked: nextProps.amiclicked });
    }

    componentDidMount() {
        let gestureHandler = new GestureHandler();
        this.gestureHandler = gestureHandler;
        gestureHandler.onEachGesture(function (gesture) {
            console.log(gesture);
            this.setState({ pause: 4 });
        }.bind(this));
        // gestureHandler.onGesture("rhand_open", function () {
        //     this.props.handleZoom("in");
        // }.bind(this));

        // gestureHandler.onGesture("rhand_close", function () {
        //     this.props.handleZoom("out");
        // }.bind(this));

        gestureHandler.onGesture("rhand_lswipe", function () {
            this.props.handleSwipe("left");
        }.bind(this));

        gestureHandler.onGesture("rhand_rswipe", function () {
            this.props.handleSwipe("right");
        }.bind(this));

        gestureHandler.onGesture("rhand_uswipe", function () {
            let clicked = this.state.clicked;
            if (clicked != -1) {
                gestureHandler.removePoseHandler("pinch");
                clicked = -1;
                this.setState({ clicked });

            }
            this.props.handleSwipeUp();
        }.bind(this));

        gestureHandler.onGesture("rindex_airtap", function () {
            var hovered = this.state.hovered;
            if (hovered != -1) {
                gestureHandler.onPose("pinch", function (data) {
                    this.props.handlePinch(data.pinch);
                }.bind(this));
                const clicked = hovered;
                this.props.handleClick(clicked);
                this.setState({ clicked: clicked, hovered: -1});
            }
        }.bind(this));

        gestureHandler.onGesture("rhand_crotate", function () {
            this.props.handleRotate("clockwise");
        }.bind(this));

        gestureHandler.onGesture("rhand_acrotate", function () {
            this.props.handleRotate("anti-clockwise");
        }.bind(this));

        gestureHandler.onFrame(function (frame) {
            if (frame.fingers.length != 0) {
                this.setState({ hand: true });
            } else {
                this.setState({ hand: false });
            }
            this.traceFingers(frame.fingers);
        }.bind(this));

        this.timer = setInterval(() => {
            if (this.state.pause > 0) {
                this.setState({ pause: this.state.pause - 1 });
            }
            if (this.state.hand) {
                var { clicked, hovered } = this.state;
                if (clicked == -1 && !this.state.amiclicked) {
                    hovered = this.checkHover();
                    this.setState({ hovered });
                    this.props.handleHover(hovered);
                }
            }

        }, 100);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        this.gestureHandler.disconnect();
        //this.leap.disconnect();
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

    darken() {
        const canvas = this.refs.canvas;
        const ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.rect(20, 20, 150, 100);
        ctx.fillStyle = "red";
        ctx.fill();
    }

    getCoords(x, y, degrees, radius) {
        /** Calculates the coordinates for the center of a button relative
         * to the center of the radial menu.
         * 
         * params: x,y are the center of the radial menu
         * degrees is the angle of the button from the horizontal
         * radius is the distance from the center of the radial menu to the center of the button
         * 
         * returns: coordinates of the center of the button
         */
        const newx = x + radius * Math.cos(degrees * Math.PI / 180)
        const newy = y + radius * Math.sin(degrees * Math.PI / 180)
        return [newx, newy]
    }

    clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }

    rollToVolume(roll) {
        return this.clamp(2 - roll, 0, 3) * 100 / 3;
    }

    drawLabel(center) { //label for button
        const canvas = this.refs.canvas;
        const ctx = canvas.getContext("2d");
        ctx.font = "40px Helvetica";
        // const coords = this.getCoords(x, y, )
        ctx.fillText("Home", center[0] - 50, center[1] + 15);
    }

    drawArc(center, radius, color, percent) {
        const canvas = this.refs.canvas;
        const ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(center[0], center[1], radius, 0, percent * 2 * Math.PI, false);
        ctx.lineWidth = 10;
        ctx.strokeStyle = color;
        ctx.stroke();
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

    drawPointer(center, radius, color, fill) { //draw small circle that points to what is hovered
        const canvas = this.refs.canvas;
        const ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI, false);
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


    checkHover() { //returns which pdf is hovered
        const pdfs = this.props.pdfs;
        const { x, y } = this.state.indexFinger;
        for (let i = 0; i < pdfs.length; i++) {
            if (pdfs[i] && pdfs[i].current) {
                const dims = pdfs[i].current.getBoundingClientRect();
                if (x > dims.left && x < dims.right &&
                    y > dims.top && y < dims.bottom) {
                    return i;
                }
            }
        }
        return (-1);
    }

    timer() {
        // setState method is used to update the state
        this.setState({ currentCount: this.state.currentCount - 1 });
    }

    render() {
        //console.log(this.state.amiclicked);

        const { classes } = this.props;

        return (
            <canvas className={classes.canvas} ref="canvas"></canvas>
        )
    }

}


Leap.propTypes = {
    pdfs: PropTypes.array,
    handleHover: PropTypes.func,
    handleSwipe: PropTypes.func,
    handleExit: PropTypes.func,
    handleRotate: PropTypes.func,
    handlePinch: PropTypes.func
};

// TODO: better default values
Leap.defaultProps = {
    pdfs: [],
};

export default withStyles(styles)(Leap);
