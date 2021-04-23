import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Home from '@material-ui/icons/Home';
import GestureHandler from 'quantumleapjs';

const fingers = ["#9bcfedBB", "#B2EBF2CC", "#80DEEABB", "#4DD0E1BB", "#26C6DABB"];
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
        this.gestureHandler = new GestureHandler();
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ amiclicked: nextProps.amiclicked });
    }

    componentDidMount() {
        this.gestureHandler.registerGestures('dynamic', ['rhand_lswipe', 'rhand_rswipe', 'rhand_uswipe', 'rindex_airtap']);
        this.gestureHandler.addEventListener('gesture', (event) => {
            let gesture = event.gesture;
            if (gesture.type === 'dynamic') {
                console.log(gesture.name);
                this.setState({ pause: 4 });
            }
            switch (gesture.name) {
                case 'rhand_lswipe':
                    this.props.handleSwipe('left');
                    break;
                case 'rhand_rswipe':
                    this.props.handleSwipe('right');
                    break;
                case 'rhand_uswipe': {
                    let clicked = this.state.clicked;
                    if (clicked != -1) {
                        this.gestureHandler.unregisterGestures('static', ['grab', 'pinch']);
                        clicked = -1;
                        this.setState({ clicked });
                    }
                    this.props.handleSwipeUp();
                    break;
                }
                case 'rindex_airtap': {
                    var hovered = this.state.hovered;
                    if (hovered != -1) {
                        this.gestureHandler.registerGestures('static', ['grab', 'pinch']);
                        const clicked = hovered;
                        this.props.handleClick(clicked);
                        this.setState({ clicked: clicked, hovered: -1});
                    }
                    break;
                }
                case 'grab':
                    this.props.handleRotate(gesture.data.rotation);
                    break;
                case 'pinch':
                    this.props.handlePinch(gesture.data.pinch);
                    break;
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

            pointables.forEach((pointable) => {
                const color = pause > 0 ? paused_fingers[pointable.type] : fingers[pointable.type];
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

    render() {
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
