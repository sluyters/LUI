import React, { Component, createRef } from 'react';
import { Redirect } from 'react-router';
import { withStyles } from '@material-ui/core/styles';
import glamorous from 'glamorous'
import Leap from './leap.js';
import Button from '@material-ui/core/Button';
import Home from '@material-ui/icons/Home';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { css } from 'glamor';


// https://stackoverflow.com/questions/49441600/react-leaflet-marker-files-not-found
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
});;

const dwv = require("dwv");

const dicomURLs = [
  "/dicom/bbmri-53323851.dcm",
  "/dicom/bbmri-53323707.dcm",
  "/dicom/bbmri-53323563.dcm",
  "/dicom/bbmri-53323419.dcm",
  "/dicom/bbmri-53323275.dcm",
  "/dicom/bbmri-53323131.dcm",
];

const nDicom = 20;
// const dicomURLs = ['/dicom/image(1)'];
// // for (let i = 0; i < nDicom; i++) {
// //   dicomURLs.push(`/dicom/image(${i + 1}).dcm`);
// // }


//CSS:
const styles = {

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

  maincontent: {
    position: 'absolute',
    bottom: '50px',
    top: '50px',
    left: 0,
    right: 0,
    overflow: 'hidden',
    background: 'black',
  },

  dataDisplay: {
    position: 'absolute',
    top: '50px',
    left: '50px',
    zIndex: 5,
  },

  dwvContainer: {
    height: '100%',
    width: '100%',
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

  button: {
    color: "rgba(50,50,50,0.8)",
  },

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

class DicomViewerApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      exit: false,
      zoom: 1.0,
      imagePos: 0.0,
      translation: { x: 0.0, y: 0.0 }
    };

    this.map = undefined;
    this.app = undefined;
  }

  componentDidMount() {
    // base function to get elements
    dwv.gui.getElement = dwv.gui.base.getElement;
    dwv.image.decoderScripts = {
      "jpeg2000": "node_modules/dwv/decoders/pdfjs/decode-jpeg2000.js",
      "jpeg-lossless": "node_modules/dwv/decoders/rii-mango/decode-jpegloss.js",
      "jpeg-baseline": "node_modules/dwv/decoders/pdfjs/decode-jpegbaseline.js"
    };

    // create the dwv app
    this.app = new dwv.App();
    // initialise with the id of the container div
    this.app.init({
        containerDivId: "dwv",
    });

    // activate tool once done loading
    this.app.addEventListener("load", () => {
      // this.app.setTool("Scroll");
      this.app.fitToContainer()
    });

    // load dicom data
    this.app.loadURLs(dicomURLs);    

  }

  handleExit = () => {
    this.setState({
      exit: true
    })
  }

  handlePinch = (pinch, handTranslation) => {
    this.setState(prevState => { 
      let zoom = prevState.zoom;
      let newZoom = Math.round((zoom * (((pinch - 1) * 1.2) + 1)) * 50) / 50;
      newZoom = Math.min(4.0, Math.max(0.25, newZoom));
      if (Math.abs(newZoom/zoom) < 2 && Math.abs(newZoom/zoom) > 0.5 && newZoom !== zoom) {
        zoom = newZoom
        //this.map.flyTo(this.map.getCenter(), zoom)
      }
      let translation = {
        x: prevState.translation.x + handTranslation[0] * 5,
        y: prevState.translation.y + handTranslation[1] * -5,
      }
      return { zoom, translation };
    });
  }

  handlePoint = (translation) => {
    const threshold = 0.5;

    if (Math.abs(translation[1]) > threshold) {
      const adjustment = dicomURLs.length / 150;
      let newImagePos = Math.min(Math.max(this.state.imagePos - translation[1] * adjustment, 0), dicomURLs.length - 1);
      this.setState({ 
        imagePos: newImagePos 
      });

      let pos = this.app.getLayerController().getActiveViewLayer().getViewController().getCurrentPosition();
      pos.k = Math.round(newImagePos);
      this.app.getLayerController().getActiveViewLayer().getViewController().setCurrentPosition(pos)
    }
  }

  handleThumb = (isUp) => {

  }

  handleSwipeUp = () => {
    this.setState({ exit: true });
  }

  render() {
    const { classes } = this.props;
    const { zoom, imagePos, translation } = this.state;

    // Handling whether to go back to the Home page or display the Photos page
    if (this.state.exit) {
      console.log("EXITING")
      return <Redirect to={{ pathname: "/Home", state: {page: "home"} }} />
    }

    return (
      <Wrapper isMounted={this.props.isMounted} exit={this.state.exit}>
          <div className={classes.container} justify={"center"}>
            <Leap
              handleSwipeUp={this.handleSwipeUp}
              handlePinch={this.handlePinch}
              handlePoint={this.handlePoint}
              handleThumb={this.handleThumb}
            />

            {/* Handling whether to render a full screen photo or not */}
            <div className={classes.maincontent}>
              <div className={classes.dataDisplay}>
                <p style={{color: 'white'}}>
                  {`Study 1 of 1\n`}
                  <br/>
                  {`Image ${Math.round(imagePos + 1)} of ${dicomURLs.length}`}
                  <br/>
                  {`Zoom level: ${Math.round(zoom * 100)}%`}
                </p>
              </div>
              <div className={classes.dwvContainer} style={{transform: `translate(${translation.x}px,${translation.y}px)`, willChange: 'transform, box-shadow, z-index'}} > 
                <div id='dwv' style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', transform: `scale3d(${zoom}, ${zoom}, 1)`, willChange: 'transform, box-shadow, z-index'}}>
                  <div className="layerContainer"></div>
                </div>
              </div>


            </div>

            {/* Control bar */}
            <div className={classes.controlbar}>
              {/* Home button: */}
              <Button onClick={() => this.handleExit()}  className={classes.button}>
                <Home/>
              </Button>
              <div>
              </div>
              <div className={classes.buttons}>
              </div>
            </div>
          </div>
      </Wrapper>
    );
  }
}

export default withStyles(styles)(DicomViewerApp);
