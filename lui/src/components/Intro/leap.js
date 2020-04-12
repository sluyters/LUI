import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
// import LeapMotion from 'leapjs';
import GestureHandler from '../../gesture-interface/app-interface' // Added
import { Fade } from '@material-ui/core';

const fingers = ["#9bcfed", "#B2EBF2", "#80DEEA", "#4DD0E1", "#26C6DA"];
const paused_fingers = ["#9bed9b", "#b1f0b1", "#80ea80", "#4ce14c", "#25da25"];

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
            frame: {},
            hand: "",
            indexFinger: "",

        }
    }

    componentDidMount() {
        this.gestureHandler = new GestureHandler();

        this.gestureHandler.onEachGesture(function (gesture) {
            console.log(gesture);
            this.setState({ pause: 4 });
        }.bind(this));

        this.gestureHandler.onGesture("rhand-uswipe", function () {
            this.props.handleExit();
        }.bind(this));

        this.gestureHandler.onGesture("rindex-airtap", function () {
            this.props.handleClick();
        }.bind(this));

        this.gestureHandler.onFrame(function (frame) {
            this.traceFingers(frame.fingers);
        }.bind(this));

        this.timer = setInterval(() => {
            if (this.state.pause > 0) {
                this.setState({ pause: this.state.pause - 1 });
            }     
        }, 100);
    }

    componentWillUnmount() {
        console.log("Intro leap is unmounted")
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

    render() {
        const { classes } = this.props;

        return (
            <canvas className={classes.canvas} ref="canvas"></canvas>
        )
    }
}


Leap.propTypes = {
    handleUnlock: PropTypes.func
};

// TODO: better default values
Leap.defaultProps = {

};

export default withStyles(styles)(Leap);
