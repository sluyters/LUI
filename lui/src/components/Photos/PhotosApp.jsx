import React, { Component } from 'react';
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

import { css } from 'glamor';
import { Transition } from 'react-transition-group';
import Carousel from 'react-responsive-carousel';
//firebase
import * as firebase from "firebase/app";
import "firebase/database";

const zoomIn = css.keyframes({
  '0%': { transform: 'scale(0.5)' },
  '100%': { transform: 'scale(1)' }
})

//CSS:
const styles = {

  gallery: {
    animation: `${zoomIn} 1s`
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
    // width: '90%',
    maxHeight: '95%',
    padding: '0px',
    margin: '0px',
    overflow: 'hidden',
  },

  row: {
    maxHeight: '50vh',
  },

  cell: {
    display: 'inline-block',
    maxWidth: '85%',
    maxHeight: '85%',
    verticalAlign: 'middle',
    boxSizing: 'border-box',
    margin: '0px',
    padding: '3%',
    position: 'relative',
  },

  image: {
    display: 'block',
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
    maxHeight: '80vh'
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
    flex: '1 1 0'
  },

  stepper: {
    // display: 'auto',
    margin: 'auto',
    width: 'fit-content',
    maxWidth: '100%',
    // marginLeft: 'auto',
    // marginRight: 'auto',
    //width: '8em',
    backgroundColor: 'rgb(0,0,0,0)',
    //position: "absolute",
    //bottom: "1px",
  },

  button: {
    //position: 'fixed',
    // bottom: '10px',
    // left: '10px',
    color: "rgba(50,50,50,0.8)",
  },

  xbutton: {
    position: 'fixed',
    top: '10px',
    right: '10px',
    color: "rgba(50,50,50,0.8)",
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
const photos = ['https://images.unsplash.com/photo-1531752074002-abf991376d04?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=d9a0a2b6b4212fc234d319be9c87c615&auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1531700968341-bd114e5006ec?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=0e3b02f32d781454cb7f97a78657a5b4&auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1533247094082-709d7257cb7b?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=03d0175eccb69353cf2cc77869902e4f&auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1531686888376-83ee7d64f5eb?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=2d03c403992f2433e3bc7900db49834f&auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1533213603451-060f6ec38bfa?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=4d961f9dbe9795f95febb3743a89d14d&auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1531574595918-cb77c99fe5e2?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=ad5b61555629bdf87c0dd87b4a383ff1&auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1533135347859-2d07f6e8199b?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=eb46a125e61ce38dc70712cefc7cb147&auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1533071581733-1a1600ec8ac6?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=4a59d7ee412d9efb4818bb4a9ddd55c9&auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1533213603451-060f6ec38bfa?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=4d961f9dbe9795f95febb3743a89d14d&auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1531574595918-cb77c99fe5e2?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=ad5b61555629bdf87c0dd87b4a383ff1&auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1533135347859-2d07f6e8199b?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=eb46a125e61ce38dc70712cefc7cb147&auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1533071581733-1a1600ec8ac6?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=4a59d7ee412d9efb4818bb4a9ddd55c9&auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1531752074002-abf991376d04?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=d9a0a2b6b4212fc234d319be9c87c615&auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1531700968341-bd114e5006ec?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=0e3b02f32d781454cb7f97a78657a5b4&auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1533247094082-709d7257cb7b?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=03d0175eccb69353cf2cc77869902e4f&auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1531686888376-83ee7d64f5eb?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=2d03c403992f2433e3bc7900db49834f&auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1531686888376-83ee7d64f5eb?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=2d03c403992f2433e3bc7900db49834f&auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1531686888376-83ee7d64f5eb?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=2d03c403992f2433e3bc7900db49834f&auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1531686888376-83ee7d64f5eb?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=2d03c403992f2433e3bc7900db49834f&auto=format&fit=crop&w=800&q=60',
                'https://images.unsplash.com/photo-1531686888376-83ee7d64f5eb?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=2d03c403992f2433e3bc7900db49834f&auto=format&fit=crop&w=800&q=60']

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

    let refs = [];
    for (let i = 0; i < photos.length; i++) {
      refs.push(React.createRef());
    }

    this.state = {
      refs: refs,
      numPreviewPages: Math.ceil(refs.length / 8),
      numPages: null,
      hovered: -1,
      clicked: -1,
      index: 0,
      exit: false,
      amiclicked:false,
      rotation: 45, // Added - rotate image
      zoom: 1.0,
      translation: { x: 0.0, y: 0.0 }
    };

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
        if (something.state.amiclicked){
          something.handleSwipeUp();
        }
        else{
          something.setState({ exit: true });
            
        }
        currentRef.update({"back":false});
      }
    });
  }



  rotate(){
    let newRotation = this.state.rotation + 45;
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
    this.setState({ rotation: 0, zoom: 1.0, translation: { x: 0.0, y: 0.0 } })
    this.setState({ clicked: photoId });
    this.setState({ amiclicked: true });
  }

  handleExit = () => {
    this.setState({
      exit: true
    })
  }

  // Added - rotation
  // handleRotate = (dir) => {
  //   let { rotation } = this.state;

  //   if (dir === "clockwise") {
  //     this.setState({
  //       rotation: rotation + 90
  //     })
  //   } else {
  //     this.setState({
  //       rotation: rotation - 90
  //     })
  //   }
  // }

  handleRotate = (handRotation) => {
    let { rotation } = this.state;
    rotation += 180 * handRotation / 3.14;
    this.setState({ rotation })
  }

  handlePinch = (pinch, handTranslation) => {
    let { clicked, zoom, translation } = this.state;
    if (clicked != -1) {
      zoom *= ((pinch - 1) * 1.2) + 1;
      if (zoom < 0.4) {
        zoom = 0.4;
      } else if (zoom > 4) {
        zoom = 4;
      }
      translation.x += handTranslation[0] * 5;
      translation.y += handTranslation[1] * -5;
      this.setState({ zoom, translation })
    }
  }

  handleTranslate = (translation) => {
    console.log("translate");
    console.log(translation);
  }

  handleSwipe = (dir) => {
    let { clicked, refs, index, numPreviewPages } = this.state; 
    this.setState({ rotation: 0, zoom: 1.0, translation: { x: 0.0, y: 0.0 } })    // Added - rotation
    if (dir === "left") {
      console.log("swipe left");
      if (clicked != -1) {
        this.setState({ clicked: (clicked < refs.length - 1) ? clicked + 1 : clicked })
      } else if (index < numPreviewPages - 1) {
        this.setState({ index: index + 1 })
      }
    } else {
      console.log("swipe right");
      if (clicked != -1) {
        this.setState({ clicked: (clicked > 0) ? clicked - 1 : clicked })
      } else if (index > 0) {
        this.setState({ index: index -1 })
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
      this.setState({ amiclicked: false });
    } else {
      this.setState({ exit: true });
    }
  }

  renderPhoto(index) { //renders a photo in the grid
    const { classes } = this.props;
    const { hovered, refs } = this.state;
    const ref = refs[index]

    return (<Grid item className={classes.cell} ref={ref} xs={12} sm={3}>
      <img
        onMouseEnter={() => { this.setState({hovered: index}) }}
        onMouseLeave={() => { this.setState({hovered: -1}) }}
        onClick={() => { this.handleClick(index) }} 
        className={hovered === index ? classNames(classes.image, classes.hovered) : classes.image}
        src={ photos[index] } />
    </Grid>);
  }

  renderFullScreenPhoto(index) { //renders the selected photo in full screen view
    const { classes } = this.props;
    const { rotation, zoom, translation } =  this.state; 
    return (<div className={classes.carousel} justify={"center"}>
      <Grid container spacing={0} justify={"center"} >
        <Grid item className={classes.cell} xs={12} sm={12}>
          <div style={{transform: `translate(${translation.x}px,${translation.y}px)`}} > 
            <img
              style={{transform: `rotate(${rotation}deg) scale(${zoom})`}} 
              onClick={() => { this.rotate() }}
              className={classNames(classes.image, classes.zoomed)}
              src={ photos[index] } />
          </div>
        </Grid>
      </Grid>
    </div>);
  }

  renderFullScreen(index) { //renders the full screen gallery view for the photos
    const { classes } = this.props;
    const { refs } = this.state;

    let fullScreenPhotos = [];
    for (let i = 0; i < refs.length; i++) {
      fullScreenPhotos.push(this.renderFullScreenPhoto(i));
    }

    return (<div>
      <SwipeableViews className={classes.gallery} index={index} >
        {fullScreenPhotos}
      </SwipeableViews>
      {/* Exit button: */}
      <Button onClick={() => this.handleSwipeUp()}  className={classes.xbutton}> 
        <Clear/>
      </Button>
    </div>);
  }

  renderPhotos() {
    const { classes } = this.props;
    const { index, refs, numPreviewPages } = this.state;
    let pages = [];
    let rows = [];
    let previews = [];
    var i;
    for (i = 0; i < refs.length; i++) {
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
    if ((refs.length % 8) != 0) { 
      if ((refs.length % 4) != 0) { 
        rows.push(<Grid container className={classes.row} spacing={0} justify={"center"} >
          {previews}
        </Grid>);
      }
      pages.push(<div className={classes.carousel} justify={"center"}>
        {rows}
      </div>);
    }

    return (<div>
      <div>
        <SwipeableViews className={classes.gallery} index={index}>
          {pages}
        </SwipeableViews>
      </div>
    </div>);
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
    const { clicked, refs } = this.state;

    return (<div className = "stepper">
        <MobileStepper
          variant="dots"
          steps={refs.length}
          position="bottom"
          activeStep={clicked}
          className={classes.stepper}
          classes={{ dots: classes.dots }}
          nextButton={
            <Button size="small" onClick={()=>this.handleSwipe("left")} disabled={clicked >= refs.length - 1}>
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
    const { clicked } = this.state;

    // Handling whether to go back to the Home page or display the Photos page
    if (this.state.exit) {
      console.log("EXITING")
      return <Redirect to={{ pathname: "/Home", state: {page: "home"} }} />
    }

    return (
      <Wrapper isMounted={this.props.isMounted} exit={this.state.exit}>
        <div>
          <div className={classes.container} justify={"center"}>
            <Leap
              //photos={this.state.photos}
              photos={this.state.refs}
              handleHover={this.handleHover}
              handleClick={this.handleClick}
              amiclicked={this.state.amiclicked}              
              handleSwipe={this.handleSwipe}
              handleSwipeUp={this.handleSwipeUp}
              handleRotate={this.handleRotate}
              handlePinch={this.handlePinch}
              handleTranslate={this.handleTranslate}
            />

            {/* Handling whether to render a full screen photo or not */}
            <div className={classes.maincontent}>
              { clicked != -1 ? this.renderFullScreen(clicked) : this.renderPhotos() }
            </div>

            {/* Control bar */}
            <div className={classes.controlbar}>
              {/* Home button: */}
              <div className={classes.control}>
                <Button onClick={() => this.handleExit()}  className={classes.button}>
                  <Home/>
                </Button>
              </div>
              <div className={classes.control}>
                { clicked != -1 ? this.renderFullScreenStepper() : this.renderStepper() }
              </div>
              <div className={classes.control}>
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    );
  }
}

export default withStyles(styles)(PhotosApp);
