import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
//import LeapMotion from 'leapjs';
import GestureHandler from '../../gesture-interface/app-interface' // Added

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
            hovered: "",
            zoomed: "",
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
            let zoomed = this.state.zoomed;
            if (zoomed) {
                const index = parseInt(zoomed.slice(5));
                const newIndex = Math.min(this.props.videos.length, index + 1)
                zoomed = "video" + String(newIndex);
                console.log("SWIPE LEFT (leap) " + zoomed)
                this.setState({ zoomed });
            }
        }.bind(this));
        gestureHandler.onGesture("rhand_rswipe", function () {
            this.props.handleSwipe("right");
            let zoomed = this.state.zoomed;
            if (zoomed) {
                const index = parseInt(zoomed.slice(5));
                const newIndex = Math.max(1, index - 1)
                zoomed = "video" + String(newIndex);
                console.log("SWIPE RIGHT (leap) " + zoomed)
                this.setState({ zoomed });
            }
        }.bind(this));
        gestureHandler.onGesture("rhand_uswipe", function () {
            let zoomed = this.state.zoomed;
            if (zoomed) {
                zoomed = "";
                gestureHandler.removePoseHandler("point-index");
                this.setState({ zoomed });
            }
            this.props.handleSwipeUp();
        }.bind(this));
        gestureHandler.onGesture("rindex_airtap", function () {
            var { zoomed, hovered } = this.state;
            if (hovered && !zoomed) { // zoom in
                zoomed = hovered;
                this.props.handleZoom(zoomed);
                this.setState({ zoomed, hovered: "" });
                // Add gesture handler for volume
                gestureHandler.onPose("point-index", function (data) {
                    let zoomed = this.state.zoomed;
                    if (zoomed) {
                        this.props.handleIndex(zoomed, data.translation);
                    }
                }.bind(this));
            } else if (zoomed) {  // play video
                console.log("PLAY (leap) " + zoomed)
                this.props.handleClick(zoomed);
            }
        }.bind(this));
        this.gestureHandler.onFrame(function (frame) {
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
                var { zoomed, hovered } = this.state;
                if (!zoomed) {
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

    checkHover() {
        const videos = this.props.videos;
        const { x, y } = this.state.indexFinger;
        // don't check for hovering while zoomed in
        if (!this.state.zoomed) {
          for (let i = 0; i < videos.length; i++) {
              if (videos[i]){
                  const videoNode = ReactDOM.findDOMNode(videos[i]);
                  const dims = videoNode.getBoundingClientRect();
                  if (x > dims.left && x < dims.right &&
                      y > dims.top - videoSizeOffset && y < dims.bottom + videoSizeOffset) {
                      // console.log("HOVER", String(i + 1));
                      // console.log(videos[i].props);
                      return ("video" + String(i + 1));
                  }
              }
          }
        }
        // console.log("HOVER NONE");
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
