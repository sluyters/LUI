import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import GestureHandler from 'quantumleapjs';

// const canvas = this.refs.canvas;
// canvas.width = canvas.clientWidth;
// canvas.height = canvas.clientHeight;
// const ctx = canvas.getContext("2d");
const fingers = ["#9bcfed", "#B2EBF2", "#80DEEA", "#4DD0E1", "#26C6DA"];
const paused_fingers = ["#9bed9b", "#b1f0b1", "#80ea80", "#4ce14c", "#25da25"];

const styles = {
    canvas: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        zIndex: 10,
        pointerEvents: 'none'
    }

};

class Leap extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            hand: false,
            indexFinger: "",
            hovered: "",
            clicked: "",
            pause: 4
        }
        this.gestureHandler = new GestureHandler();
    }

    componentDidMount() {
        this.gestureHandler.registerGestures('dynamic', ['rhand_uswipe', 'rindex_airtap']);
        this.gestureHandler.addEventListener('gesture', (event) => {
            let gesture = event.gesture;
            console.log(gesture.name);
            this.setState({ pause: 4 });
            switch (gesture.name) {
                case 'rhand_uswipe':
                    this.props.handleSwipeUp();
                    break;
                case 'rindex_airtap': {
                    let { hovered } = this.state;
                    this.setState({ clicked: hovered })
                    this.props.handleClick(hovered);
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
                var { hovered } = this.state;

                // hovering
                hovered = this.checkHover();
                this.setState({ hovered });
                this.props.handleHover(hovered);
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

    drawCircle(center, radius, color, fill) {
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
        // calculate location of cards
        const cards = this.props.cards;
        const { x, y } = this.state.indexFinger;
        for (let i = 0; i < cards.length; i++) {
            if (cards[i]) {
                const dims = ReactDOM.findDOMNode(cards[i]).getBoundingClientRect();
                if (x > dims.left && x < dims.right &&
                    y > dims.top && y < dims.bottom) {
                    return ("card" + String(i + 1));
                }
            }
        }
        return ("");
    }

    render() {
        const { classes } = this.props;

        return (
            <canvas className={classes.canvas} ref="canvas"></canvas>
        )
    }
}


Leap.propTypes = {
    cards: PropTypes.array,
    handleHover: PropTypes.func,
    handleClick: PropTypes.func,
    handleExit: PropTypes.func
};

// TODO: better default values
Leap.defaultProps = {

};

export default withStyles(styles)(Leap);
