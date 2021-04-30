import React, { Component } from 'react';
import clsx from 'clsx';
import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import YouTube from 'react-youtube';
import ReactPlayer from 'react-player/file';
import Leap from './leap.js'
import { Redirect } from 'react-router';
import glamorous from 'glamorous'
import { css } from 'glamor';
import SwipeableViews from 'react-swipeable-views';
import MobileStepper from '@material-ui/core/MobileStepper';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Home from '@material-ui/icons/Home';
//add firebase
import firebase from 'firebase/app'
import "firebase/database";
import Clear from '@material-ui/icons/Clear';
import { createRef } from 'react';
import AspectRatio from './AspectRatio';

const N_ROWS = 2;
const N_COLS = 3;

const zoomIn = css.keyframes({
  '0%': { transform: 'scale(0.5)' },
  '100%': { transform: 'scale(1)' }
})
//firebase
const firebaseConfig = {
  apiKey: "AIzaSyDjM37_DSv2RvPQzl5YiVzmgRHfpd4rJFU",
  authDomain: "lui-medialab.firebaseapp.com",
  databaseURL: "https://lui-medialab.firebaseio.com",
  projectId: "lui-medialab",
  storageBucket: "lui-medialab.appspot.com",
  messagingSenderId: "247289397118",
  appId: "1:247289397118:web:eb2bcb0076d4bb4d"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
var database = firebase.database();
var currentRef = database.ref('voice');
//end

const styles = (theme) => ({
  gallery: {
    animation: `${zoomIn} 0.5s`,
    height: '95vh',
  },
  carousel: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  row: {
    height: '30%',
    margin: '2%'
  },
  contentContainer: {
    width: '100%', 
    height: '100%',
  },
  container: {
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: '100%',
    height: '100%',
    padding: '0px',
    listStyle: 'none',
    overflow: 'none',
    zIndex: '1',
    backgroundColor: '#ECEFF1',
    overflow: 'hidden',
  },
  maincontent: {
    position: 'absolute',
    bottom: '50px',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden'
  },
  controlbar: {
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 0,
    padding: '5px',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50px'
  },
  control: {
    flex: 0,
  },
  frameContainer: {
    display: 'block',
    width: '25vw',
    height: '27vh',
    verticalAlign: 'middle',
    padding: '0px',
    boxShadow: '0px 0px 10px 2px #999',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 5
  },
  zoomed: {
    width: '100vw',
    height: '93vh',
  },
  hovered: {
    transform: 'scale(1.15)',
    transition: '200ms ease-out',
    position: 'relative',
    zIndex: 5,
  },
  stepper: {
    margin: 'auto',
    width: 'fit-content',
    maxWidth: '100%',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  dots: {
    margin: 'auto',
  },
  button: {
    // position: 'fixed',
    // bottom: '10px',
    // left: '10px',
    color: "rgba(50,50,50,0.8)",
  },
  xbutton: {
    color: "rgba(50,50,50,0.8)",
  },
  overviewPage: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewRow: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPreviewContainer: {
    height: '90%',
    width: '90%',
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPreview: {
    width: '80%', 
    boxShadow: '0px 0px 10px 2px #999', 
    transition: 'all 0.2s',
  },
  videoPreviewHovered: {
    transform: 'scale(1.1)',
  },
  videoFullscreenContainer: {
    height: '95%',
    width: '95%',
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoFullscreen: {
    maxWidth: 'calc(85vh * (16/9))',
    width: '90%', 
    boxShadow: '0px 0px 10px 2px #999', 
  },
  reactPlayer: {
    '& > video': {
      display: 'block',
    },
  },
  volume: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: '-100px',
    marginLeft: '-25px',
    height: '200px',
    width: '50px',
    borderRadius: '25px',
    overflow: 'hidden',
    zIndex: 55,
    backgroundColor: 'rgba(0,0,0,0.7)',
    transition: 'opacity 0.2s',
  },
  volumeSlider: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  hidden: {
    opacity: 0,
  }
});

// const videos = [
//     { id: 'rnlCGw-0R8g' },
//     { id: 'zw47_q9wbBE' },
//     { id: '7m6J8W6Ib4w' },
//     { id: 'l7uuTnk69Eo' },
//     { id: '6ZfuNTqbHE8' },
//     { id: '_8w9rOpV3gc' },
//     { id: 'c-SE2Qeqj1g' },
//     { id: '-AbaV3nrw6E' },
//     { id: 'FTPmnZVgDjQ' },
//     { id: 'dQw4w9WgXcQ' },
//     { id: 'Xnk4seEHmgw' },
//     { id: '5G1C3aBY62E' }
// ]

// Videos from videvo
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

const opts = {
  height: '350',
  width: '500',
  playerVars: { // https://developers.google.com/youtube/player_parameters
    autoplay: 0,
    controls: 0
  }
};

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


class VideosApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playing: false,
      zoomed: -1,
      hovered: -1,
      index: 0,
      exit: false,
      volume: 1,
      displayVolume: false,
    };
    this.videosRefs = videos.map(_ => createRef());
    this.fullScreenVideosRefs = videos.map(_ => createRef());
    this.volumeTimeout = undefined;
  }

  componentDidMount() {
    //google home
    currentRef.update({ "current": "videos" });
    var something = this;
    currentRef.on('value', function (snapshot) {
      console.log(snapshot.val());
      var db = snapshot.val();
      var name = db.goto;
      if (db.update) {
        if (name === "home") {
          something.setState({ exit: true });
          currentRef.update({ "update": false });
        }
      }
      if (db.back) {
        something.setState({ exit: true });
        currentRef.update({ "back": false });
      }

    });
  }

  componentWillUnmount() {
    clearTimeout(this.volumeTimeout);
  }

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
    this.setState({ zoomed: videoId, hovered: -1 });
  }

  handleIndex = (videoId, translation) => {
    const threshold = 0.5;
    const ratio = 3;
    if (Math.abs(translation[0]) > threshold || Math.abs(translation[1]) > threshold) {
      if (Math.abs(translation[0]) > ratio * Math.abs(translation[1])) {
        // Move in the video
        let videoRef = this.fullScreenVideosRefs[videoId];
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
    const { hovered } = this.state;

    return (
      <div className={classes.videoPreviewContainer}>     
        <AspectRatio ratio={16/9} className={clsx(classes.videoPreview, {[classes.videoPreviewHovered]: hovered === index})}>
          <ReactPlayer 
            className={classes.reactPlayer} 
            width='100%' height='100%' 
            ref={this.videosRefs[index]} 
            url={`/videos/${videos[index]}`} 
            onMouseEnter={() => { this.setState({ hovered: index }) }}
            onMouseLeave={() => { this.setState({ hovered: -1 }) }}
            onClick={() => { this.setState({ zoomed: index }) }} 
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
    const { volume, playing, zoomed } = this.state;

    return (
      <div className={classes.carousel} justify={"center"}>
        <div className={classes.videoFullscreenContainer}>        
          <AspectRatio ratio={16/9} className={clsx(classes.videoFullscreen)}>
            <ReactPlayer 
              className={classes.reactPlayer}
              playing={playing && zoomed === index} 
              volume={volume}
              width='100%' height='100%' 
              ref={this.fullScreenVideosRefs[index]} 
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
          <Leap
            videos={zoomed === -1 ? this.videosRefs : this.fullScreenVideosRefs}
            handleHover={this.handleHover}
            handleSwipe={this.handleSwipe}
            handleSwipeUp={this.handleSwipeUp}
            handleClick={this.handleClick}
            handleZoom={this.handleZoom}
            handleIndex={this.handleIndex}
          />

          {/* Handling whether to render a full screen photo or not */}
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
