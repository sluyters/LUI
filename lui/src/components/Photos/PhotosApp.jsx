import React, { Component } from 'react';
import clsx from 'clsx';
import { Redirect } from 'react-router';
import { withStyles } from '@material-ui/core/styles';
import glamorous from 'glamorous'
import classNames from 'classnames';
import { Grid } from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';
import MobileStepper from '@material-ui/core/MobileStepper';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Home from '@material-ui/icons/Home';
import Clear from '@material-ui/icons/Clear';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import { css } from 'glamor';
import { styles } from './styles';
import GestureHandler from 'quantumleapjs';

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

// List of photos
const photos = [
  'photo (1).jpg',
  'photo (2).jpg',
  'photo (3).jpg',
  'photo (4).jpg',
  'photo (5).jpg',
  'photo (6).jpg',
  'photo (7).jpg',
  'photo (8).jpg',
  'photo (9).jpg',
  'photo (10).jpg',
  'photo (11-2).jpg',
  'photo (12).jpg',
];

// Component code
class PhotosApp extends Component {
  constructor(props) {
    super(props);

    let photoRefs = [];
    for (let i = 0; i < photos.length; i++) {
      photoRefs.push(React.createRef());
    }

    this.state = {
      photoRefs: photoRefs,
      numPreviewPages: Math.ceil(photoRefs.length / 8),
      hovered: -1,
      clicked: -1,
      liked: {},
      index: 0,
      exit: false,
      displayHeart: false,
      rotation: 0,
      transition: false,
      zoom: 1.0,
      translation: { x: 0.0, y: 0.0 },
      indexFinger: "",
      pause: 4,
      pauseStatic: 4,
    };
    // Gesture handler
    this.gestureHandler = new GestureHandler();

    // Timeouts & intervals
    this.rotateTimeout = undefined;
    this.heartTimeout = undefined;
    this.gestureInterval = undefined;

    this.handleClick = this.handleClick.bind(this);

    this.evaluationHelper = this.evaluationHelper.bind(this);
  }

  evaluationHelper(props) {
    const searchString = props.location.search;
    const searchParams = new URLSearchParams(searchString);
    if (searchParams.has("clicked")) {
      let clicked = parseInt(searchParams.get("clicked"));
      if (clicked === -1) {
        if (this.state.clicked !== -1) {
          this.handleSwipeUp();
        }
        if (searchParams.has("page")) {
          this.setState({ index: parseInt(searchParams.get("page")) });
        }
      } else {
        this.handleClick(clicked);
        if (searchParams.has("favorite")) {
          this.setState(prevState => ({
            liked: {
              ...prevState.liked,
              [clicked]: searchParams.get("favorite") === "true",
            }
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
    // Gesture recognition
    this.gestureHandler.registerGestures('dynamic', ['rhand_lswipe', 'rhand_rswipe', 'rhand_uswipe', 'rindex_airtap']);
    this.gestureHandler.addEventListener('gesture', (event) => {
      let gesture = event.gesture;
      if (gesture.type === 'static') {
        this.setState({ pauseStatic: 4 });
      } else if (gesture.type === 'dynamic') {
        console.log(gesture.name);
        this.setState({ pause: 4 });
      }
      switch (gesture.name) {
        case 'rhand_lswipe':
          this.handleSwipe('left');
          break;
        case 'rhand_rswipe':
          this.handleSwipe('right');
          break;
        case 'rhand_uswipe': {
          this.handleSwipeUp();
          break;
        }
        case 'rindex_airtap': {
          let { clicked, hovered } = this.state;
          if (clicked == -1 && hovered != -1) {
            this.handleClick(hovered);
          }
          break;
        }
        case 'grab':
          this.handleRotate(gesture.data.rotation);
          break;
        case 'pinch':
          this.handlePinch(gesture.data.pinch, gesture.data.translation);
          break;
        case 'thumb': {
          let thumbUp = gesture.data.thumbVector[1] > 40;
          let thumbDown = gesture.data.thumbVector[1] < -40;
          if (thumbUp) {
            this.handleThumb(true);
          }
          if (thumbDown) {
            this.handleThumb(false);
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
      if (this.state.pauseStatic > 0) {
        this.setState({ pauseStatic: this.state.pauseStatic - 1 })
      }
      if (this.state.hand) {
        var { clicked, hovered } = this.state;
        if (clicked == -1 && !this.state.amiclicked) {
          hovered = this.checkHover();
          this.setState({ hovered });
          this.handleHover(hovered);
        }
      }
    }, 100);
  }

  componentWillUnmount() {
    clearTimeout(this.heartTimeout);
    clearTimeout(this.rotateTimeout);
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

  checkHover() { //returns which photo is hovered
    const { photoRefs, indexFinger } = this.state;
    const { x, y } = indexFinger;
    for (let i = 0; i < photoRefs.length; i++) {
      if (photoRefs[i] && photoRefs[i].current) {
        const dims = photoRefs[i].current.getBoundingClientRect();
        if (x > dims.left && x < dims.right &&
          y > dims.top && y < dims.bottom) {
          return i;
        }
      }
    }
    return -1;
  }

  // Handlers
  rotate() {
    clearTimeout(this.rotateTimeout);
    let newRotation = this.state.rotation + 90;
    if (newRotation >= 360) {
      newRotation = - 360;
    }
    this.setState({
      rotation: newRotation,
    });
  }

  handleHover = (photo) => {
    this.setState({ hovered: photo });
  }

  handleClick = (photoId) => {
    this.gestureHandler.registerGestures('static', ['grab', 'pinch', 'thumb']);
    this.setState({ clicked: photoId, hovered: -1, rotation: 0, zoom: 1.0, translation: { x: 0.0, y: 0.0 } });
  }

  handleExit = () => {
    this.setState({
      exit: true
    });
  }

  handleRotate = (handRotation) => {
    const { rotation } = this.state;
    clearTimeout(this.rotateTimeout);
    let newRotation = Math.round((rotation + 180 * handRotation / 3.14) * 10) / 10;
    if (newRotation !== rotation) {
      this.setState({
        rotation: newRotation,
      });
    }
    this.rotateTimeout = setTimeout(() => {
      this.setState({
        rotation: Math.round(rotation / 90) * 90,
        transition: true,
      });
      setTimeout(() => {
        this.setState({
          transition: false,
        });
      }, 200);
    }, 200);
  }

  handlePinch = (pinch, handTranslation) => {
    if (this.state.clicked != -1) {
      this.setState(prevState => {
        let zoom = Math.round((prevState.zoom * (((pinch - 1) * 1.2) + 1)) * 50) / 50;
        if (zoom < 0.4) {
          zoom = 0.4;
        } else if (zoom > 4) {
          zoom = 4;
        }
        if (Math.abs(handTranslation[0]) < 20 && Math.abs(handTranslation[1]) < 20) {
          let translation = {
            x: prevState.translation.x + handTranslation[0] * 5,
            y: prevState.translation.y + handTranslation[1] * -5,
          }
          return { zoom, translation };
        } else {
          console.log(handTranslation[0])
          return { zoom };
        }
        
      });
    }
  }

  handleThumb = (isUp) => {
    let { clicked, liked } = this.state;

    if (!liked.hasOwnProperty(clicked) || liked[clicked] != isUp) {
      this.setState(prevState => ({
        displayHeart: true,
        liked: {
          ...prevState.liked,
          [clicked]: isUp
        }
      }));
      // Timeout to stop displaying the heart
      clearTimeout(this.heartTimeout);
      this.heartTimeout = setTimeout(_ => {
        this.setState({ displayHeart: false });
      }, 750);
    }
  }

  handleSwipe = (dir) => {
    let { clicked, photoRefs, index, numPreviewPages } = this.state;
    this.setState({ rotation: 0, zoom: 1.0, translation: { x: 0.0, y: 0.0 } })
    if (dir === "left") {
      if (clicked != -1) {
        this.setState({ clicked: Math.min(photoRefs.length - 1, clicked + 1) })
      } else if (index < numPreviewPages - 1) {
        this.setState({ index: index + 1 })
      }
    } else {
      if (clicked != -1) {
        this.setState({ clicked: Math.max(0, clicked - 1) })
      } else if (index > 0) {
        this.setState({ index: index - 1 })
      }
    }
  }

  handleNext = () => {
    let { index, numPreviewPages } = this.state;
    if (index < numPreviewPages - 1) {
      this.setState({ index: index + 1 });
    }
  };

  handleBack = () => {
    let { index } = this.state;
    if (index > 0) {
      this.setState({ index: index - 1 });
    }
  };

  handleSwipeUp = () => {
    let { clicked } = this.state;
    if (clicked != -1) {
      this.gestureHandler.unregisterGestures('static', ['grab', 'pinch', 'thumb']);
      this.setState({ clicked: -1 });
    } else {
      this.setState({ exit: true });
    }
  }

  renderPhoto(index) { //renders a photo in the grid
    const { classes } = this.props;
    const { hovered, photoRefs } = this.state;
    const ref = photoRefs[index];

    return (<Grid item className={classes.cell} ref={ref} xs={12} sm={3}>
      <img
        onMouseEnter={() => { this.setState({hovered: index}) }}
        onMouseLeave={() => { this.setState({hovered: -1}) }}
        onClick={() => { this.handleClick(index) }} 
        className={hovered === index ? classNames(classes.image, classes.hovered) : classes.image}
        src={ `/photos/${photos[index]}` } />
    </Grid>);
  }

  renderFullScreenPhoto(index) { //renders the selected photo in full screen view
    const { classes } = this.props;
    const { rotation, zoom, translation, transition } =  this.state; 
    return (
      <div className={classes.fullScreenContainer}>
        <div className={classes.imageBox} style={{transform: `translate(${translation.x}px,${translation.y}px)`, willChange: 'transform, box-shadow, z-index'}} > 
          <img
            style={{ transform: `rotate(${rotation}deg) scale3d(${zoom}, ${zoom}, 1)`, willChange: 'transform, box-shadow, z-index'}} 
            onClick={() => { this.rotate() }}
            className={clsx(classes.zoomed, {[classes.transition]: transition})}
            src={`/photos/${photos[index]}`}/>
        </div>
      </div>
    );
  }

  renderFullScreen(index) { //renders the full screen gallery view for the photos
    const { classes } = this.props;
    const { photoRefs, displayHeart, liked } = this.state;

    let fullScreenPhotos = [];
    for (let i = 0; i < photoRefs.length; i++) {
      fullScreenPhotos.push(this.renderFullScreenPhoto(i));
    }

    return (
      <div className={classes.contentContainer}>
        <div className={clsx(classes.heartContainer, {[classes.hidden]: !displayHeart})}>
          {(liked[index]) ? (
            <svg className={classes.heart} viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
          ) : (
            <svg className={classes.hollowHeart} viewBox="0 0 24 24"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"></path></svg>
          )}
        </div>
        <SwipeableViews className={classes.gallery} containerStyle={{ width: '100%', height: '100%' }} index={index} >
          {fullScreenPhotos}
        </SwipeableViews>
        {/* Exit button: */}
        <Button onClick={() => this.handleSwipeUp()}  className={classes.xbutton}> 
          <Clear/>
        </Button>
      </div>
    );
  }

  renderPhotos() {
    const { classes } = this.props;
    const { index, photoRefs } = this.state;
    let pages = [];
    let rows = [];
    let previews = [];
    var i;
    for (i = 0; i < photoRefs.length; i++) {
      previews.push(this.renderPhoto(i));
      if ((i + 1) % 4 == 0) {
        rows.push(<Grid container className={classes.row} spacing={0} justify={"center"} >
          {previews}
        </Grid>);
        previews = [];
      }
      if ((i + 1) % 8 == 0) {
        pages.push(<div className={classes.carousel} justify={"center"}>
          {rows}
        </div>);
        rows = [];
      }
    }
    if ((photoRefs.length % 8) != 0) { 
      if ((photoRefs.length % 4) != 0) { 
        rows.push(<Grid container className={classes.row} spacing={0} justify={"center"} >
          {previews}
        </Grid>);
      }
      pages.push(<div className={classes.carousel} justify={"center"}>
        {rows}
      </div>);
    }

    return (
      <SwipeableViews className={classes.gallery} index={index} containerStyle={{ width: '100%', height: '100%' }}>
        {pages}
      </SwipeableViews>
    );
  }

  renderStepper() {
    const { classes } = this.props;
    const { index, numPreviewPages } = this.state;

    return (numPreviewPages <= 1) ? "" : (<div className = "stepper">
      <MobileStepper
        variant="dots"
        steps={numPreviewPages}
        position="bottom"
        activeStep={index}
        className={classes.stepper}
        classes={{ dots: classes.dots }}
        nextButton={
          <Button size="small" onClick={this.handleNext} disabled={index >= numPreviewPages - 1}>
            <KeyboardArrowRight />
          </Button>
        }
        backButton={
          <Button size="small" onClick={this.handleBack} disabled={index <= 0}>
            <KeyboardArrowLeft />
          </Button>
        }
      />
    </div>);
  }

  renderFullScreenStepper() {
    const { classes } = this.props;
    const { clicked, photoRefs } = this.state;

    return (<div className = "stepper">
        <MobileStepper
          variant="dots"
          steps={photoRefs.length}
          position="bottom"
          activeStep={clicked}
          className={classes.stepper}
          classes={{ dots: classes.dots }}
          nextButton={
            <Button size="small" onClick={()=>this.handleSwipe("left")} disabled={clicked >= photoRefs.length - 1}>
              <KeyboardArrowRight />
            </Button>
          }
          backButton={
            <Button size="small" onClick={()=>this.handleSwipe("right")} disabled={clicked <= 0}>
              <KeyboardArrowLeft />
            </Button>
          }
        />
      </div>);
  }

  render() {
    const { classes } = this.props;
    const { clicked, liked } = this.state;

    // Handling whether to go back to the Home page or display the Photos page
    if (this.state.exit) {
      console.log("EXITING")
      return <Redirect to={{ pathname: "/Home", state: {page: "home"} }} />
    }

    return (
      <Wrapper isMounted={this.props.isMounted} exit={this.state.exit}>
          <div className={classes.container} justify={"center"}>
            {/* Display fingers */}
            <canvas className={classes.canvas} ref="canvas"></canvas>

            {/* Handling whether to render a full screen photo or not */}
            <div className={classes.maincontent}>
              { clicked != -1 ? this.renderFullScreen(clicked) : this.renderPhotos() }
            </div>

            {/* Control bar */}
            <div className={classes.controlbar}>
              {/* Home button: */}
              <Button onClick={() => this.handleExit()}  className={classes.button}>
                <Home/>
              </Button>
              <div>
                { clicked != -1 ? this.renderFullScreenStepper() : this.renderStepper() }
              </div>
              <div className={classes.buttons}>
                {clicked !== -1 &&
                  <>
                    { liked.hasOwnProperty(clicked) && liked[clicked] ? (
                      <FavoriteIcon onClick={() => this.handleThumb(false)}/> 
                    ) : ( 
                      <FavoriteBorderIcon onClick={() => this.handleThumb(true)}/> 
                    )}
                    <Button onClick={() => this.handleSwipeUp()} className={classes.xbutton}>
                      <Clear />
                    </Button>
                  </>
                }
              </div>
            </div>
          </div>
      </Wrapper>
    );
  }
}

export default withStyles(styles)(PhotosApp);
