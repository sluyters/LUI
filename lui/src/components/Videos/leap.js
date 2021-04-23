import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import GestureHandler from 'quantumleapjs';

const fingers = ["#9bcfed", "#B2EBF2", "#80DEEA", "#4DD0E1", "#26C6DA"];
const paused_fingers = ["#9bed9b", "#b1f0b1", "#80ea80", "#4ce14c", "#25da25"];

const videoSizeOffset = 100;

const styles = {
    canvas: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        zIndex: 100,
        pointerEvents: 'none'
    }
};

class Leap extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            indexFinger: "",
            hovered: -1,
            zoomed: -1,
            pause: 4,
        }
        this.gestureHandler = new GestureHandler();
    }

    componentDidMount() {
        this.gestureHandler.registerGestures('dynamic', ['rhand_lswipe', 'rhand_rswipe', 'rhand_uswipe', 'rindex_airtap']);
        this.gestureHandler.addEventListener('gesture', (event) => {
            let { zoomed, hovered } = this.state;

            let gesture = event.gesture;
            if (gesture.type === 'dynamic') {
                console.log(gesture.name);
                this.setState({ pause: 4 });
            }
            switch (gesture.name) {
                case 'rhand_lswipe': {
                    this.props.handleSwipe("left");
                    if (zoomed !== -1) {
                        this.setState({ zoomed: Math.min(this.props.videos.length - 1, zoomed + 1) });
                    }
                    break;
                }
                case 'rhand_rswipe': {
                    this.props.handleSwipe("right");
                    if (zoomed !== -1) {
                        this.setState({ zoomed: Math.max(0, zoomed - 1) });
                    }
                    break;
                }
                case 'rhand_uswipe': {
                    if (zoomed !== -1) {
                        this.gestureHandler.unregisterGestures('static', 'point-index');
                        this.setState({ zoomed: -1 });
                    }
                    this.props.handleSwipeUp();
                    break;
                }
                case 'rindex_airtap': {
                    if (hovered !== -1 && zoomed === -1) { // zoom in
                        zoomed = hovered;
                        this.props.handleZoom(zoomed);
                        this.setState({ zoomed: zoomed, hovered: -1 });
                        this.gestureHandler.registerGestures('static', 'point-index');
                    } else if (zoomed !== -1) {  // play video
                        this.props.handleClick(zoomed);
                    }
                    break;
                }
                case 'point-index': {
                    if (zoomed !== -1) {
                        this.props.handleIndex(zoomed, gesture.data.translation);
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
            if (this.state.hand) {
                var { zoomed, hovered } = this.state;
                if (zoomed === -1) {
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

    checkHover() {
        const videos = this.props.videos;
        const { x, y } = this.state.indexFinger;
        // don't check for hovering while zoomed in
        if (this.state.zoomed === -1) {
            for (let i = 0; i < videos.length; i++) {
                if (videos[i]) {
                    const videoNode = ReactDOM.findDOMNode(videos[i].current);
                    if (videoNode !== null) {
                        const dims = videoNode.getBoundingClientRect();
                        if (x > dims.left && x < dims.right &&
                            y > dims.top - videoSizeOffset && y < dims.bottom + videoSizeOffset) {
                            // console.log("HOVER", String(i + 1));
                            // console.log(videos[i].props);
                            return i;
                        }
                    }   
                }
            }
        }
        // console.log("HOVER NONE");
        return -1;
    }

    render() {
        const { classes } = this.props;

        return (
            <canvas className={classes.canvas} ref="canvas"></canvas>
        );
    }
}


Leap.propTypes = {
    videos: PropTypes.array,
    handleHover: PropTypes.func,
    handleSwipe: PropTypes.func,
    handleExit: PropTypes.func,
    handleClick: PropTypes.func,
    handleIndex: PropTypes.func
};

// TODO: better default values
Leap.defaultProps = {
    videos: [],
};

export default withStyles(styles)(Leap);
