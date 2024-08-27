import React, { Component } from 'react';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import ReactPlayer from 'react-player/file';
import { Redirect } from 'react-router';
import glamorous from 'glamorous'
import { css } from 'glamor';
import SwipeableViews from 'react-swipeable-views';
import MobileStepper from '@material-ui/core/MobileStepper';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Home from '@material-ui/icons/Home';
import Clear from '@material-ui/icons/Clear';
import { createRef } from 'react';
import AspectRatio from './AspectRatio';
import ReactDOM from 'react-dom';
import { styles } from './styles';
import GestureHandler from 'quantumleapjs';

const N_ROWS = 2;
const N_COLS = 3;

const videoSizeOffset = 100;

// Fingers styling
const fingers = ["#9bcfedBB", "#B2EBF2CC", "#80DEEABB", "#4DD0E1BB", "#26C6DABB"];
const left_fingers = ["#d39bed", "#e1b1f1", "#ca80ea", "#b74ce1", "#a425da"];
const paused_fingers = ["#9bed9b", "#b1f0b1", "#80ea80", "#4ce14c", "#25da25"];
const pausedStatic_fingers = ["#ee0231", "#e50b36", "#dc143c", "#d31d42", "#ca2647"];

// Animations entering/exiting this page:
const fadeIn = css.keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 }
});

const slideOut = css.keyframes({
  '100%': { transform: 'translateY(-100%)' },
});

const Wrapper = glamorous.div(props => ({
  animation: props.isMounted ? `${slideOut} 2.5s` : `${fadeIn} 1.5s`,
  position: 'absolute',
  top: '0px',
  left: '0px',
  width: '100vw',
  height: '100vh',
  zIndex: 5
}));

// List of videos (from videvo)
const videos = [
  'video (1).m4v',
  'video (2).m4v',
  'video (3).m4v',
  'video (4).m4v',
  'video (5).m4v',
  'video (6).m4v',
  'video (7).m4v',
  'video (8).m4v',
  'video (9).m4v',
  'video (10).m4v',
  'video (11).m4v',
  'video (12).m4v',
];

// Component code
class VideosApp extends Component {
  constructor(props) {
    super(props);

    let videosRefs = videos.map(_ => createRef());
    let fullScreenVideosRefs = videos.map(_ => createRef());

    this.state = {
      videosRefs: videosRefs,
      fullScreenVideosRefs: fullScreenVideosRefs,
      playing: false,
      zoomed: -1,
      hovered: -1,
      index: 0,
      exit: false,
      volume: 0.5,
      displayVolume: false,
      indexFinger: "",
      pause: 4,
      pauseStatic: 4,
    };
    // Gesture handler
    this.gestureHandler = new GestureHandler();

    // Timeouts & intervals
    this.volumeTimeout = undefined;
    this.gestureInterval = undefined;

    this.evaluationHelper = this.evaluationHelper.bind(this);
  }

  evaluationHelper(props) {
    const searchString = props.location.search;
    const searchParams = new URLSearchParams(searchString);
    if (searchParams.has("clicked")) {
      let clicked = parseInt(searchParams.get("clicked"));
      if (clicked === -1) {
        if (this.state.zoomed !== -1) {
          this.handleSwipeUp();
        }
        if (searchParams.has("page")) {
          this.setState({ index: parseInt(searchParams.get("page")) });
        }
      } else {
        this.handleZoom(clicked);
        if (searchParams.has("play")) {
          this.setState(prevState => ({ playing: searchParams.get("play") === "true" }))
        }
        if (searchParams.has("progress")) {
          this.setState(prevState => ({ playing: searchParams.get("play") === "true" }))
          let videoRef = this.state.fullScreenVideosRefs[clicked];
          
          let helperInterval = setInterval(_ => {
            if (videoRef.current && videoRef.current.getCurrentTime() !== null) {
              clearInterval(helperInterval);
              videoRef.current.seekTo(parseInt(searchParams.get("progress")) / 100);
            }
          }, 100)
        }
        if (searchParams.has("volume")) {
          this.setState(prevState => ({
            volume: parseInt(searchParams.get("volume")) / 100, 
          }));
        }
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.evaluationHelper(nextProps);
  }

  componentDidMount() {
    this.evaluationHelper(this.props);

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
          this.handleSwipe("left");
          break;
        }
        case 'rhand_rswipe': {
          this.handleSwipe("right");
          break;
        }
        case 'rhand_uswipe': {
          this.handleSwipeUp();
          break;
        }
        case 'rindex_airtap': {
          if (hovered !== -1 && zoomed === -1) { // zoom in
            this.handleZoom(hovered);
          } else if (zoomed !== -1) {  // play video
            this.handleClick(zoomed);
          }
          break;
        }
        case 'point-index': {
          if (zoomed !== -1) {
            this.handleIndex(zoomed, gesture.data.translation);
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
    this.gestureInterval = setInterval(() => {
      if (this.state.pause > 0) {
        this.setState({ pause: this.state.pause - 1 });
      }
      if (this.state.hand) {
        var { zoomed, hovered } = this.state;
        if (zoomed === -1) {
          hovered = this.checkHover();
          this.setState({ hovered });
          this.handleHover(hovered);
        }
      }
    }, 100);
  }

  componentWillUnmount() {
    clearTimeout(this.volumeTimeout);
    clearInterval(this.gestureInterval);
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
    const { videosRefs, fullScreenVideosRefs, indexFinger, zoomed } = this.state;
    const { x, y } = indexFinger;
    let refs = zoomed === -1 ? videosRefs : fullScreenVideosRefs;
    // don't check for hovering while zoomed in
    if (zoomed === -1) {
      for (let i = 0; i < refs.length; i++) {
        if (refs[i]) {
          const videoNode = ReactDOM.findDOMNode(refs[i].current);
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

  // Handlers
  handleHover = (videoId) => {
    this.setState({ hovered: videoId })
  }

  handleSwipe = (dir) => {
    var { zoomed } = this.state;
    // swipe between zoomed in videos
    if (zoomed != -1) {
      if (dir === "right") {
        zoomed = Math.max(0, zoomed - 1);
      } else {
        zoomed = Math.min(videos.length - 1, zoomed + 1);
      }
      this.setState({ 
        zoomed: zoomed, 
        playing: false, 
      });
    }
    else {
      if (dir === "left") {
        this.handleNext();
      } else {
        this.handleBack();
      }
    }
  }

  handleNext = () => {
    this.setState(prevState => ({
      index: Math.min(Math.ceil(videos.length / (N_COLS * N_ROWS)) - 1, prevState.index + 1)
    }));
  };

  handleBack = () => {
    this.setState(prevState => ({
      index: Math.max(0, prevState.index - 1)
    }));
  };

  handleExit = () => {
    this.setState({
      exit: true
    })
  }

  handleClick = (videoId) => {
    this.setState(prevState => ({ playing: !prevState.playing }));
  }

  handleZoom = (videoId) => {
    this.gestureHandler.registerGestures('static', 'point-index');
    this.setState({ zoomed: videoId, hovered: -1 });
  }

  handleIndex = (videoId, translation) => {
    const { fullScreenVideosRefs } = this.state;
    const threshold = 0.5;
    const ratio = 3;
    if (Math.abs(translation[0]) > threshold || Math.abs(translation[1]) > threshold) {
      if (Math.abs(translation[0]) > ratio * Math.abs(translation[1])) {
        // Move in the video
        let videoRef = fullScreenVideosRefs[videoId];
        const adjustment = videoRef.current.getDuration() / (3 * 60);
        let seconds = videoRef.current.getCurrentTime() - Math.round(translation[0]) * adjustment;
        videoRef.current.seekTo(seconds, 'seconds');
      } else if (Math.abs(translation[1]) > ratio * Math.abs(translation[0])) {
        // Update volume
        this.setState(prevState => ({
          displayVolume: true,
          volume: Math.min(Math.max(prevState.volume + translation[1] / 100, 0), 1), 
        }));
        // Timeout to stop displaying the volume
        clearTimeout(this.volumeTimeout);
        this.volumeTimeout = setTimeout(_ => {
          this.setState({ displayVolume: false });
        }, 500);
      }
    }
  }

  handleSwipeUp = () => {
    let { zoomed } = this.state;
    if (zoomed != -1) {
      this.gestureHandler.unregisterGestures('static', 'point-index');
      this.setState({ 
        playing: false, 
        zoomed: -1 
      });
    } else {
      this.setState({ exit: true });
    }
  }

  renderVideo(index) {
    const { classes } = this.props;
    const { hovered, videosRefs } = this.state;

    return (
      <div className={classes.videoPreviewContainer}>     
        <AspectRatio ratio={16/9} className={clsx(classes.videoPreview, {[classes.videoPreviewHovered]: hovered === index})}>
          <ReactPlayer 
            className={classes.reactPlayer} 
            width='100%' height='100%' 
            ref={videosRefs[index]} 
            url={`/videos/${videos[index]}`} 
            onMouseEnter={() => { this.setState({ hovered: index }) }}
            onMouseLeave={() => { this.setState({ hovered: -1 }) }}
            onClick={() => { this.handleZoom(index) }} 
          />
        </AspectRatio>
      </div>);
  }

  renderVideos() {
    const { classes } = this.props;
    const { index } = this.state;
    let pages = []
    let rows = [];
    let previews = [];
    videos.forEach((video, id) => {
      // Add video
      previews.push(this.renderVideo(id));
      // New row
      if (((id + 1) % N_COLS === 0) || (id + 1 === videos.length)) {
        rows.push(
          <div className={classes.overviewRow}>
            {previews}
          </div>
        );
        previews = [];
      }
      // New page
      if (((id + 1) % (N_ROWS * N_COLS) === 0) || (id + 1 === videos.length)) {
        pages.push(
          <div className={classes.overviewPage}>
            {rows}
          </div>
        );
        rows = [];
      }
    });

    return (<div>
      <SwipeableViews key='swipeOverview' className={classes.gallery} containerStyle={{ width: '100%', height: '100%' }} index={index}>
        {pages}
      </SwipeableViews>
    </div>
    );
  }

  renderFullScreenVideo(index) {
    const { classes } = this.props;
    const { volume, playing, zoomed, fullScreenVideosRefs } = this.state;

    return (
      <div className={classes.carousel} justify={"center"}>
        <div className={classes.videoFullscreenContainer}>        
          <AspectRatio ratio={16/9} className={clsx(classes.videoFullscreen)}>
            <ReactPlayer 
              className={classes.reactPlayer}
              playing={playing && zoomed === index} 
              volume={volume}
              width='100%' height='100%' 
              ref={fullScreenVideosRefs[index]} 
              url={`/videos/${videos[index]}`} 
              controls={true} 
              onStart={() => this.setState({ playing: true })}
              onPlay={() => this.setState({ playing: true })}
              onPause={() => this.setState({ playing: false })}
              onEnded={() => this.setState({ playing: false })}
            />
          </AspectRatio>
        </div>
      </div>
      );
  }

  renderFullScreen(index) {
    const { classes } = this.props;
    const { volume, displayVolume } = this.state;

    return (
      <div className={classes.contentContainer}>
        <div className={clsx(classes.volume, {[classes.hidden]: !displayVolume})}>
          <div className={classes.volumeSlider} style={{ height: `${Math.round(volume * 100)}%` }}></div>
        </div>
        <SwipeableViews key='swipeFullscreen' className={classes.gallery} containerStyle={{ width: '100%', height: '100%' }} index={index}>
          {videos.map((_, index) => this.renderFullScreenVideo(index))}
        </SwipeableViews>
      </div>
    );
  }

  renderStepper() {
    const { classes } = this.props;
    const { index, zoomed } = this.state;

    let numPages = (zoomed !== -1) ? videos.length : (videos.length / (N_COLS * N_ROWS));
    let currentStep = (zoomed !== -1) ? zoomed : index;

    return (numPages <= 1) ? "" : (
      <MobileStepper
        variant="dots"
        steps={numPages}
        activeStep={currentStep}
        className={classes.stepper}
        classes={{ dots: classes.dots }}
        nextButton={
          <Button size="small" onClick={() => this.handleSwipe("left")} disabled={currentStep >= numPages - 1}>
            <KeyboardArrowRight />
          </Button>
        }
        backButton={
          <Button size="small" onClick={() => this.handleSwipe("right")} disabled={currentStep <= 0}>
            <KeyboardArrowLeft />
          </Button>
        }
      />
    );
  }

  render() {
    const { classes } = this.props;
    const { zoomed } = this.state;

    if (this.state.exit) {
      return <Redirect to={{ pathname: "/Home", state: { page: "home" } }} />
    }

    return (
      <Wrapper isMounted={this.props.isMounted} exit={this.state.exit}>
        <div className={classes.container}>
          {/* Display fingers */}
          <canvas className={classes.canvas} ref="canvas"></canvas>

          {/* Handling whether to render a full screen video or not */}
          <div className={classes.maincontent}>
            { zoomed != -1 ? this.renderFullScreen(zoomed) : this.renderVideos() }
          </div>

          {/* Control bar */}
          <div className={classes.controlbar}>
            {/* Home button: */}
            <Button onClick={() => this.handleExit()}  className={classes.button}>
              <Home/>
            </Button>
            <div className={classes.control}>
              {this.renderStepper()}
            </div>
            <div className={classes.control}>
              {zoomed !== -1 &&
                <Button onClick={() => this.handleSwipeUp()} className={classes.xbutton}>
                  <Clear />
                </Button>
              }
            </div>
          </div>
        </div>
      </Wrapper>
    );
  }
}

VideosApp.defaultProps = {
  hovered: false,
  clicked: false,
};

export default withStyles(styles)(VideosApp);
