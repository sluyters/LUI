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
import Pagination from '@material-ui/lab/Pagination';
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

import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

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

  thumbnail: {
    display: 'block',
    maxWidth: '90%',
    maxHeight: '60%',
    width: 'auto',
    height: '300px',
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

  pdf: {
    position: 'relative',
    height: 'fit-content',
    width: 'fit-content',
    margin: 'auto'
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

  pagination: {
    margin: 'auto',
    width: 'fit-content',
    maxWidth: '100%'
  },

  stepper: {
    margin: 'auto',
    width: 'fit-content',
    maxWidth: '100%',
    backgroundColor: 'rgb(0,0,0,0)'
  },

  button: {
    position: 'relative',
    height: '100%',
    color: "rgba(50,50,50,0.8)"
  },

  xbutton: {
    position: 'fixed',
    top: '10px',
    right: '10px',
    color: "rgba(50,50,50,0.8)"
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
const pdfs = [require('./pdfs/test1.pdf'),
              require('./pdfs/test2.pdf'),
              require('./pdfs/test3.pdf'),
              require('./pdfs/test1.pdf'),
              require('./pdfs/test2.pdf'),
              require('./pdfs/test3.pdf'),
              require('./pdfs/test1.pdf'),
              require('./pdfs/test2.pdf'),
              require('./pdfs/test3.pdf')]

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
class PDFsApp extends Component {
  constructor(props) {
    super(props);

    let refs = [];
    for (let i = 0; i < pdfs.length; i++) {
      refs.push(React.createRef());
    }

    this.state = {
      refs: refs,
      numPreviewPages: Math.ceil(refs.length / 8),
      numPages: null,
      currentPage: 1,
      hovered: -1,
      clicked: -1,
      index: 0,
      exit: false,
      amiclicked:false,
      rotation: 0, // Rotate pdf
      zoom: 1.0
    };

    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    //google home
    currentRef.update({"current":"pdfs"});
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
    let newRotation = this.state.rotation + 90;
    if(newRotation >= 360){
      newRotation =- 360;
    }
    this.setState({
      rotation: newRotation,
    })
  }

  handleHover = (pdf) => {
    this.setState({ hovered: pdf })
    currentRef.update({"hovered": pdf}); 
  }

  handleClick = (pdfId) => {
    this.setState({ clicked: pdfId })
    this.setState({ amiclicked: true })
    this.setState({ currentPage: 1 })
    this.setState({ rotation: 0 }) 
  }

  handleExit = () => {
    this.setState({
      exit: true
    })
  }

  handleRotate = (handRotation) => {
    this.setState(prevState => ({ rotation: (prevState.rotation + 180 * handRotation / 3.14) }))
  }

  handlePinch = (pinch) => {
    let { clicked, zoom } = this.state;
    if (clicked != -1) {
      zoom *= ((pinch - 1) * 1.2) + 1;
      if (zoom < 0.4) {
        zoom = 0.4;
      } else if (zoom > 4) {
        zoom = 4;
      }
      this.setState({ zoom })
    }
  }

  handleSwipe = (dir) => {
    let { clicked, numPages, currentPage, index, numPreviewPages } = this.state;
    if (dir === "left") {
      console.log("swipe left");
      if (clicked != -1) {
        this.setState({ currentPage: (currentPage < numPages) ? currentPage + 1 : currentPage })
      } else if (index < numPreviewPages - 1) {
        this.setState({ index: index + 1 })
      }
    } else {
      console.log("swipe right");
      if (clicked != -1) {
        this.setState({ currentPage: (currentPage > 1) ? currentPage - 1 : currentPage })
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

  renderPDF(index) { //renders a pdf in the grid
    const { classes } = this.props;
    const { hovered, refs } = this.state;
    const ref = refs[index]

    return (<Grid item className={classes.cell} ref={ref} xs={12} sm={3}>
      <div
        onMouseEnter={() => { this.setState({hovered: index}) }}
        onMouseLeave={() => { this.setState({hovered: -1}) }}
        onClick={() => { this.handleClick(index) }}
        className={hovered === index ? classNames(classes.thumbnail, classes.hovered) : classes.thumbnail} >
          {pdfs[index]}
      </div>
    </Grid>);
  }

  onDocumentLoadSuccess = (document) => {
    console.log("loaded")
    const { numPages } = document;
    this.setState({
      numPages,
      pageNumber: 1,
    });
  };

  goToPage(page) {
    const { numPages } = this.state;
    if (page > 0 && page <= numPages) {
      this.setState({ currentPage: page })
    }
  }

  renderFullScreen(index) { //renders the full screen gallery view for the pdfs
    const { classes } = this.props;
    const { rotation, zoom, currentPage, numPages } = this.state;
    let pdfRotation = Math.round(rotation / 90) * 90;
    return (<div>
      {/* PDF */}
        <div className={classes.pdf} justify={"center"}>
            <Document
              file={pdfs[index]}
              onLoadSuccess={this.onDocumentLoadSuccess}
              onLoadError={console.error}
              rotate={pdfRotation}
            >
              <Page pageNumber={currentPage} scale={zoom} className={classes.pdfpage} />
            </Document>
        </div>
      {/* Exit button: */}
      <Button onClick={() => this.handleSwipeUp()}  className={classes.xbutton}> 
        <Clear/>
      </Button>
    </div>);
  }

  renderPDFs() { //renders the full grid of pdfs
    const { classes } = this.props;
    const { index, refs } = this.state;
    let pages = [];
    let rows = [];
    let previews = [];
    var i;
    for (i = 0; i < refs.length; i++) { 
      previews.push(this.renderPDF(i));
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

  renderPageSelection() {
    const { classes } = this.props;
    const { numPages, currentPage } = this.state;
    return <div className = "pagination">
        {/* Page number at the bottom of the view: */}
        <Pagination className={classes.pagination} count={numPages} page={currentPage} onChange={(event, page) => this.goToPage(page)} shape="rounded" />
      </div>
  }

  render() {
    const { classes } = this.props;
    const { clicked } = this.state;

    // Handling whether to go back to the Home page or display the PDFs page
    if (this.state.exit) {
      console.log("EXITING")
      return <Redirect to={{ pathname: "/Home", state: {page: "home"} }} />
    }

    return (
      <Wrapper isMounted={this.props.isMounted} exit={this.state.exit}>
        <div>
          <div className={classes.container} justify={"center"}>
            <Leap
              pdfs={this.state.refs}
              handleHover={this.handleHover}
              handleClick={this.handleClick}
              amiclicked = {this.state.amiclicked}              
              handleSwipe={this.handleSwipe}
              handleSwipeUp={this.handleSwipeUp}
              handleRotate={this.handleRotate}
              handlePinch={this.handlePinch}
            />

            {/* Handling whether to render a full screen pdf or not */}
            <div className={classes.maincontent}>
              { clicked != -1 ? this.renderFullScreen(clicked) : this.renderPDFs() }
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
                { clicked != -1 ? this.renderPageSelection() : this.renderStepper() }
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

export default withStyles(styles)(PDFsApp);
