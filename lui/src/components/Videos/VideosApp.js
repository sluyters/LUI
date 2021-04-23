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

const styles = {

  gallery: {
    animation: `${zoomIn} 0.5s`,
    height: '95vh',
  },

  carousel: {
    // width: '90%',
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

  // cell: {
  //   display: 'inline-block',
  //   width: '100%',
  //   height: '100%',
  //   verticalAlign: 'middle',
  //   boxSizing: 'border-box',
  //   margin: '0px',
  //   position: 'relative',
  // },

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

  frameContainer: {
    display: 'block',
    width: '25vw',
    height: '27vh',
    verticalAlign: 'middle',
    // boxSizing: 'border-box',
    padding: '0px',
    // margin: '1.5vw',
    // transform: 'scale(1)',
    // transition: '200ms',
    // border: '2px solid #37474F',
    boxShadow: '0px 0px 10px 2px #999',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 5
    // pointerEvents: 'none'
  },

  zoomed: {
    width: '100vw',
    height: '93vh',
    // top: '0px',
    // left: '0px',
    // position: 'fixed',
    // zIndex: '100',
  },

  hovered: {
    transform: 'scale(1.15)',
    transition: '200ms ease-out',
    position: 'relative',
    zIndex: 5,
  },

  stepper: {
    // display: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '8em',
    backgroundColor: 'rgba(0,0,0,0)',
    position: "absolute",
    bottom: "1px",
  },

  dots: {
    margin: 'auto',
  },

  button: {
    position: 'fixed',
    bottom: '10px',
    left: '10px',
    color: "rgba(50,50,50,0.8)",
  },

  xbutton: {
    position: 'fixed',
    bottom: '10px',
    right: '10px',
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
    // transform: 'scale(1)',
    // transition: '200ms',
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
  }

  // row: {
  //   pointerEvents: "none"
  // }

};

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
  'video (1).mp4',
  'video (2).mp4',
  'video (3).mp4',
  'video (4).mov',
  'video (5).mp4',
  'video (6).mp4',
  'video (7).mov',
  'video (8).mp4',
  'video (9).mp4',
  'video (10).mp4',
  'video (11).mp4',
  'video (12).mp4',
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
    };
    this.videosRefs = videos.map(_ => createRef());
    this.fullScreenVideosRefs = videos.map(_ => createRef());
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
    let videoRef = this.fullScreenVideosRefs[videoId];
    if (Math.abs(translation[0]) > threshold || Math.abs(translation[1]) > threshold) {
      if (Math.abs(translation[0]) > Math.abs(translation[1])) {
        const adjustment = videoRef.current.getDuration() / (3 * 60);
        let seconds = videoRef.current.getCurrentTime() - Math.round(translation[0]) * adjustment;
        videoRef.current.seekTo(seconds, 'seconds');
      } else {
        this.setState(prevState => ({
          volume: Math.min(Math.max(prevState.volume + translation[1] / 100, 0), 1), 
        }));
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
      <MobileStepper
        variant="dots"
        steps={pages.length}
        position="bottom"
        activeStep={index}
        className={classes.stepper}
        classes={{ dots: classes.dots }}
        nextButton={
          <Button size="small" onClick={this.handleNext} disabled={index === pages.length - 1}>
            <KeyboardArrowRight />
          </Button>
        }
        backButton={
          <Button size="small" onClick={this.handleBack} disabled={index === 0}>
            <KeyboardArrowLeft />
          </Button>
        }
      />
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

    return (
      <div className={classes.contentContainer}>
        <SwipeableViews key='swipeFullscreen' className={classes.gallery} containerStyle={{ width: '100%', height: '100%' }} index={index}>
          {videos.map((_, index) => this.renderFullScreenVideo(index))}
        </SwipeableViews>
        <div className="stepper">
          <MobileStepper
            variant="dots"
            steps={videos.length}
            position="bottom"
            activeStep={index}
            className={classes.stepper}
            classes={{ dots: classes.dots }}
            nextButton={
              <Button size="small" onClick={() => this.handleSwipe("left")} disabled={index === videos.length - 1}>
                <KeyboardArrowRight />
              </Button>
            }
            backButton={
              <Button size="small" onClick={() => this.handleSwipe("right")} disabled={index === 0}>
                <KeyboardArrowLeft />
              </Button>
            }
          />
        </div>
        <Button onClick={() => this.handleSwipeUp()} className={classes.xbutton}>
          <Clear />
        </Button>
      </div>
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

          {zoomed != -1 ? this.renderFullScreen(zoomed) : this.renderVideos()}

          <Button onClick={() => this.handleExit()} className={classes.button}>
            <Home />
          </Button>
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
