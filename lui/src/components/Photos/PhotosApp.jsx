import React, { Component } from 'react';
import clsx from 'clsx';
import { Redirect } from 'react-router';
import { withStyles } from '@material-ui/core/styles';
import glamorous from 'glamorous'
import classNames from 'classnames';
import Leap from './leap.js';
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
//firebase
import firebase from 'firebase/app'
import "firebase/database";

const zoomIn = css.keyframes({
  '0%': { transform: 'scale(0.5)' },
  '100%': { transform: 'scale(1)' }
})

//CSS:
const styles = {

  gallery: {
    animation: `${zoomIn} 1s`,
    width: '100%',
    height: '100%',
  },

  container: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: '100%',
    height: '100%',
    padding: '0px',
    listStyle: 'none',
    overflow: 'hidden',
    zIndex: '1',
    backgroundColor: '#CFD8DC',
  },

  carousel: {
    width: '100%',
    height: '100%',
    padding: '0px',
    margin: '0px',
    overflow: 'hidden',
  },

  row: {
    height: '50%',
  },

  fullScreenContainer: { 
    height: '100%', 
    width: '100%', 
    overflow: 'hidden',
  },

  imageBox: {
    height: '100%',
    width: '100%',
    display: 'flex', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
  },

  cell: {
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center', 
    alignItems: 'center',
  },

  image: {
    display: 'block',
    boxSizing: 'border-box',
    maxWidth: '90%',
    maxHeight: '60%',
    width: 'auto',
    height: 'auto',
    margin: 'auto',
    padding: '3%',
    border: 'none',
    transform: 'scale(1)',
    transition: 'all 0.4s',
    boxShadow: '0px 0px 10px 2px #999',
    backgroundColor: "#ECEFF1",
    position: "relative",
    zIndex: '1'
  },

  hovered: {
    transform: 'scale(1.5)',
    animationDuration: '0.1s',
    zIndex: '15 !important',
    cursor: 'pointer',
  },

  zoomed: {
    display: 'block',
    boxSizing: 'border-box',
    width: 'auto',
    height: 'auto',
    margin: 'auto',
    padding: '30px',
    border: 'none',
    transform: 'scale(1)',
    boxShadow: '0px 0px 10px 2px #999',
    backgroundColor: "#ECEFF1",
    position: "relative",
    zIndex: '1',
    maxHeight: '90%',
    maxWidth: '90%'
  },

  transition: {
    transition: 'all 0.2s',
  },

  dots: {
    margin: 'auto',
  },

  maincontent: {
    position: 'absolute',
    bottom: '50px',
    top: '50px',
    left: 0,
    right: 0,
    overflow: 'hidden'
  },

  contentContainer: {
    width: '100%', 
    height: '100%',
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

  buttons: {
    display: 'flex',
    alignItems: 'center',
  },

  stepper: {
    margin: 'auto',
    width: 'fit-content',
    maxWidth: '100%',
    backgroundColor: 'rgb(0,0,0,0)',
  },

  button: {
    color: "rgba(50,50,50,0.8)",
  },

  xbutton: {
    color: "rgba(50,50,50,0.8)",
  },

  heartContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: '-100px',
    marginLeft: '-100px',
    height: '200px',
    width: '200px',
    zIndex: 55,
    transition: 'opacity 0.2s',
  },
  heart: {
    width: '100%',
    fill: 'red',
  },
  hollowHeart: {
    width: '100%',
    fill: 'black',
  },
  hidden: {
    opacity: 0,
  }
};

const fadeIn = css.keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 }
})
const slideOut = css.keyframes({
  '100%': { transform: 'translateY(-100%)' },
})

//Animations entering/exiting this page:
const Wrapper = glamorous.div(props => ({
  animation: props.isMounted ? `${slideOut} 2.5s` : `${fadeIn} 1.5s`,
  position: 'absolute',
  top: '0px',
  left: '0px',
  width: '100vw',
  height: '100vh',
  zIndex: 5
}))
// const photos = ['https://images.unsplash.com/photo-1531752074002-abf991376d04?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=d9a0a2b6b4212fc234d319be9c87c615&auto=format&fit=crop&w=800&q=60',
//                 'https://images.unsplash.com/photo-1531700968341-bd114e5006ec?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=0e3b02f32d781454cb7f97a78657a5b4&auto=format&fit=crop&w=800&q=60',
//                 'https://images.unsplash.com/photo-1533247094082-709d7257cb7b?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=03d0175eccb69353cf2cc77869902e4f&auto=format&fit=crop&w=800&q=60',
//                 'https://images.unsplash.com/photo-1531686888376-83ee7d64f5eb?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=2d03c403992f2433e3bc7900db49834f&auto=format&fit=crop&w=800&q=60',
//                 'https://images.unsplash.com/photo-1533213603451-060f6ec38bfa?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=4d961f9dbe9795f95febb3743a89d14d&auto=format&fit=crop&w=800&q=60',
//                 'https://images.unsplash.com/photo-1531574595918-cb77c99fe5e2?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=ad5b61555629bdf87c0dd87b4a383ff1&auto=format&fit=crop&w=800&q=60',
//                 'https://images.unsplash.com/photo-1533135347859-2d07f6e8199b?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=eb46a125e61ce38dc70712cefc7cb147&auto=format&fit=crop&w=800&q=60',
//                 'https://images.unsplash.com/photo-1533071581733-1a1600ec8ac6?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=4a59d7ee412d9efb4818bb4a9ddd55c9&auto=format&fit=crop&w=800&q=60',
//                 'https://images.unsplash.com/photo-1533213603451-060f6ec38bfa?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=4d961f9dbe9795f95febb3743a89d14d&auto=format&fit=crop&w=800&q=60',
//                 'https://images.unsplash.com/photo-1531574595918-cb77c99fe5e2?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=ad5b61555629bdf87c0dd87b4a383ff1&auto=format&fit=crop&w=800&q=60',
//                 'https://images.unsplash.com/photo-1533135347859-2d07f6e8199b?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=eb46a125e61ce38dc70712cefc7cb147&auto=format&fit=crop&w=800&q=60',
//                 'https://images.unsplash.com/photo-1533071581733-1a1600ec8ac6?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=4a59d7ee412d9efb4818bb4a9ddd55c9&auto=format&fit=crop&w=800&q=60',
//                 'https://images.unsplash.com/photo-1531752074002-abf991376d04?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=d9a0a2b6b4212fc234d319be9c87c615&auto=format&fit=crop&w=800&q=60',
//                 'https://images.unsplash.com/photo-1531700968341-bd114e5006ec?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=0e3b02f32d781454cb7f97a78657a5b4&auto=format&fit=crop&w=800&q=60',
//                 'https://images.unsplash.com/photo-1533247094082-709d7257cb7b?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=03d0175eccb69353cf2cc77869902e4f&auto=format&fit=crop&w=800&q=60',
//                 'https://images.unsplash.com/photo-1531686888376-83ee7d64f5eb?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=2d03c403992f2433e3bc7900db49834f&auto=format&fit=crop&w=800&q=60',
//                 'https://images.unsplash.com/photo-1531686888376-83ee7d64f5eb?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=2d03c403992f2433e3bc7900db49834f&auto=format&fit=crop&w=800&q=60',
//                 'https://images.unsplash.com/photo-1531686888376-83ee7d64f5eb?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=2d03c403992f2433e3bc7900db49834f&auto=format&fit=crop&w=800&q=60',
//                 'https://images.unsplash.com/photo-1531686888376-83ee7d64f5eb?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=2d03c403992f2433e3bc7900db49834f&auto=format&fit=crop&w=800&q=60',
//                 'https://images.unsplash.com/photo-1531686888376-83ee7d64f5eb?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=2d03c403992f2433e3bc7900db49834f&auto=format&fit=crop&w=800&q=60']

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
]

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
      translation: { x: 0.0, y: 0.0 }
    };

    this.rotateTimeout = undefined;

    this.heartTimeout = undefined;

    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    //google home
    currentRef.update({"current":"photos"});
    var something = this;
    currentRef.on('value', function(snapshot) {
      var db = snapshot.val();
      var name = db.goto;
      if (db.update){
        if (name === "home") {
            something.setState({ exit: true });
            currentRef.update({"update":false});
        }
        
      }
      if(db.clicked){
        currentRef.update({"clicked":false});
        something.gestureDetected = true;
        console.log(db.hovered);
        something.handleClick(db.hovered);
      }
      if (db.back){
        if (something.state.clicked != -1){
          something.handleSwipeUp();
        }
        else{
          something.setState({ exit: true });
            
        }
        currentRef.update({"back":false});
      }
    });
  }

  componentWillUnmount() {
    clearTimeout(this.heartTimeout);
  }

  rotate(){
    clearTimeout(this.rotateTimeout);
    let newRotation = this.state.rotation + 90;
    if(newRotation >= 360){
      newRotation =- 360;
    }
    this.setState({
      rotation: newRotation,
    })
  }

  handleHover = (photo) => {
    this.setState({ hovered: photo })
    currentRef.update({"hovered": photo}); 
  }

  handleClick = (photoId) => {
    this.setState({ clicked: photoId, rotation: 0, zoom: 1.0, translation: { x: 0.0, y: 0.0 } })
  }

  handleExit = () => {
    this.setState({
      exit: true
    })
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
        let translation = {
          x: prevState.translation.x + handTranslation[0] * 5,
          y: prevState.translation.y + handTranslation[1] * -5,
        }
        return { zoom, translation };
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
    this.setState({ rotation: 0, zoom: 1.0, translation: { x: 0.0, y: 0.0 } })    // Added - rotation
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
            <svg className={classes.hollowheart} viewBox="0 0 24 24"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"></path></svg>
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
            <Leap
              photos={this.state.photoRefs}
              handleHover={this.handleHover}
              handleClick={this.handleClick}           
              handleSwipe={this.handleSwipe}
              handleSwipeUp={this.handleSwipeUp}
              handleRotate={this.handleRotate}
              handlePinch={this.handlePinch}
              handleTranslate={this.handleTranslate}
              handleThumb={this.handleThumb}
            />

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
