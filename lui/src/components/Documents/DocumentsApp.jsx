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
import Pagination from '@material-ui/lab/Pagination';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Home from '@material-ui/icons/Home';
import Clear from '@material-ui/icons/Clear';
import { Document, Page, pdfjs } from "react-pdf";
import { css } from 'glamor';
import { styles } from './styles';
import GestureHandler from 'quantumleapjs';

// Fingers styling
const fingers = ["#9bcfedBB", "#B2EBF2CC", "#80DEEABB", "#4DD0E1BB", "#26C6DABB"];
const left_fingers = ["#d39bed", "#e1b1f1", "#ca80ea", "#b74ce1", "#a425da"];
const paused_fingers = ["#9bed9b", "#b1f0b1", "#80ea80", "#4ce14c", "#25da25"];
const pausedStatic_fingers = ["#ee0231", "#e50b36", "#dc143c", "#d31d42", "#ca2647"];

// Pdfs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

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

// List of pdfs
const pdfs = [
  require('./pdfs/test1.pdf'),
  require('./pdfs/test5.pdf'),
  require('./pdfs/test3.pdf'),
  require('./pdfs/test7.pdf'),
  require('./pdfs/test2.pdf'),
  require('./pdfs/test4.pdf'),
  require('./pdfs/test6.pdf'),
  require('./pdfs/test8.pdf'),
  require('./pdfs/test9.pdf')
];

// Component code
class DocumentsApp extends Component {
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
        if (searchParams.has("page")) {
          this.setState({ currentPage: parseInt(searchParams.get("page")) });
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
      let gesture = event.gesture;
      if (gesture.type === 'dynamic') {
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
    const { refs, indexFinger } = this.state;
    const { x, y } = indexFinger;
    for (let i = 0; i < refs.length; i++) {
      if (refs[i] && refs[i].current) {
        const dims = refs[i].current.getBoundingClientRect();
        if (x > dims.left && x < dims.right &&
          y > dims.top && y < dims.bottom) {
          return i;
        }
      }
    }
    return -1;
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
  }

  handleClick = (pdfId) => {
    this.gestureHandler.registerGestures('static', ['grab', 'pinch']);
    this.setState({ 
      clicked: pdfId,
      hovered: -1, 
      amiclicked: true,
      currentPage: 1,
      zoom: 1.0,
      rotation: 0.0,
      translation: { x: 0.0, y: 0.0 },
    });
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
    if (newRotation < 0) {
      newRotation += 360;
    }
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
    let { clicked, zoom } = this.state;
    if (clicked != -1) {
      this.setState(prevState => { 
        let zoom = Math.round((prevState.zoom * (((pinch - 1) * 1.2) + 1)) * 50) / 50;
        if (zoom < 0.4) {
          zoom = 0.4;
        } else if (zoom > 4) {
          zoom = 4;
        }
        let translation = {
          x: prevState.translation.x + handTranslation[0] * 6,
          y: prevState.translation.y + handTranslation[1] * -6,
        }
        return { zoom, translation };
      });
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
      this.gestureHandler.unregisterGestures('static', ['grab', 'pinch']);
      this.setState({ 
        clicked: -1, 
        amiclicked: false,
      });
    } else {
      this.setState({ exit: true });
    }
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

  renderPDF(index) { //renders a pdf in the grid
    const { classes } = this.props;
    const { hovered, refs } = this.state;
    const ref = refs[index]

    return (<Grid item className={classes.cell} ref={ref} xs={12} sm={3}>
      <Document
        file={pdfs[index]}
        onLoadSuccess={this.onDocumentLoadSuccess}
        onLoadError={console.error}
        onMouseEnter={() => { this.setState({hovered: index}) }}
        onMouseLeave={() => { this.setState({hovered: -1}) }}
        onClick={() => { this.handleClick(index) }}
        className={hovered === index ? classNames(classes.thumbnail, classes.hovered) : classes.thumbnail} 
      >
          {/* {pdfs[index]} */}
        <Page pageNumber={1} className={classes.thumbnailPage} />
      </Document>
    </Grid>);
  }

  renderFullScreen(index) { //renders the full screen gallery view for the pdfs
    const { classes } = this.props;
    const { translation, rotation, zoom, currentPage, transition } = this.state;
    return (<div>
      {/* PDF */}
        <div className={classes.pdf} justify={"center"}>
          <div className={classes.pdfBox} style={{transform: `translate(${translation.x}px,${translation.y}px)`, willChange: 'transform, box-shadow, z-index'}} >
            <div 
              className={clsx({[classes.transition]: transition})}
              style={{ transform: `rotate(${rotation}deg) scale3d(${zoom}, ${zoom}, 1)`, willChange: 'transform, box-shadow, z-index'}}
            >
              <Document
                file={pdfs[index]}
                onLoadSuccess={this.onDocumentLoadSuccess}
                onLoadError={console.error}
              >
                <Page pageNumber={currentPage} />
              </Document>
            </div>
            
          </div>
        </div>
      {/* Exit button: */}
      <Button onClick={() => this.handleSwipeUp()}  className={classes.xbutton}> 
        <Clear/>
      </Button>
    </div>);
  }

  renderDocuments() { //renders the full grid of pdfs
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

    // Handling whether to go back to the Home page or display the Documents page
    if (this.state.exit) {
      console.log("EXITING")
      return <Redirect to={{ pathname: "/Home", state: {page: "home"} }} />
    }

    return (
      <Wrapper isMounted={this.props.isMounted} exit={this.state.exit}>
        <div className={classes.container} justify={"center"}>
          {/* Display fingers */}
          <canvas className={classes.canvas} ref="canvas"></canvas>

          {/* Handling whether to render a full screen pdf or not */}
          <div className={classes.maincontent}>
            { clicked != -1 ? this.renderFullScreen(clicked) : this.renderDocuments() }
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
      </Wrapper>
    );
  }
}

export default withStyles(styles)(DocumentsApp);
