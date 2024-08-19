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

class MapsApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      exit: false,
      zoom: 13.0,
    };

    this.map = undefined;
  }

  handleExit = () => {
    this.setState({
      exit: true
    })
  }

  handlePinch = (pinch, handTranslation) => {
    
    
    // if (Math.abs(pinch) < 1.2 * Math.abs(handTranslation[1]) || Math.abs(pinch) < 1.2 * Math.abs(handTranslation[0])) {
    //   // Translate
    //   let translation = [
    //     handTranslation[0] * -50,
    //     handTranslation[1] * 50
    //   ];
    //   this.map.panBy(translation);
    // } else {
      // Zoom
      this.setState(prevState => { 
        let zoom = prevState.zoom;
        let zoomFactor = 0.2 * (1 + Math.pow((18 - zoom), 3) / 600);
        let newZoom = Math.round((zoom * (((pinch - 1) * zoomFactor) + 1)) * 100) / 100;
        newZoom = Math.min(18, Math.max(0.5, newZoom));
        if (Math.abs(newZoom - zoom) < 1 && newZoom !== zoom) {
          zoom = newZoom
          this.map.flyTo(this.map.getCenter(), zoom)
        }
        return { zoom };
      });
    // }
  }

  handleTranslate = (handTranslation) => {
    let translation = [
      handTranslation[0] * -50,
      handTranslation[1] * 50
    ];
    this.map.panBy(translation);
  }

  handleThumb = (isUp) => {

  }

  handleSwipeUp = () => {
    this.setState({ exit: true });
  }

  render() {
    const { classes } = this.props;
    const { zoom } = this.state;

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
              handleTranslate={this.handleTranslate}
              handleThumb={this.handleThumb}
            />

            {/* Handling whether to render a full screen photo or not */}
            <div className={classes.maincontent}>
              <MapContainer whenCreated={(map) => this.map = map} center={[50.669923420711996, 4.616001941428229]} zoomSnap={0} zoom={zoom} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[50.6495196, 4.5672765]}></Marker>
                <Marker position={[50.6495196, 4.5552765]}></Marker>
              </MapContainer>
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

export default withStyles(styles)(MapsApp);
