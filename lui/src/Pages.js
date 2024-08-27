import React, { Component } from 'react';
// import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Router, Route, Switch } from "react-router-dom";

import App from './App';
import Intro from './components/Intro/Intro.jsx';
import Photos from './components/Photos/PhotosApp.jsx';
import Videos from './components/Videos/VideosApp.js';
import Documents from './components/Documents/DocumentsApp';
import Maps from './components/Maps/MapsApp';
import DicomViewer from './components/DicomViewer/DicomViewerApp';
import GestureKeyboard from './components/GestureKeyboard/GestureKeyboardApp.jsx';
import CandyCrush from './components/CandyCrush/CandyCrushApp';
import Model from './components/Model/ModelApp';
import Prismatic from './components/Prismatic/PrismaticApp';
import Tutorials from './components/Tutorials/TutorialsApp.jsx';
// Added for evaluation
import { createBrowserHistory } from 'history';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import ReconnectingWebSocket from 'reconnecting-websocket';

// Added for evaluation
const history = createBrowserHistory();

class Pages extends Component {
  // Added for evaluation
  componentDidMount() {
    this.ws = new ReconnectingWebSocket("ws://127.0.0.1:8765", [], {
      constructor: W3CWebSocket,
      connectionTimeout: 10000,  // in milliseconds
      reconnectInterval: 3000
    });

    this.ws.onmessage = (e) => {
      let msg = JSON.parse(e.data);
      let path = msg.path
      console.log(path)
      history.push(path)
    }
    // setInterval(() => {
    //   history.push("/")
    // }, 2000);
  }

  render() {
    return (
      <Router history={history}>
        {/* "history={history}" added for evaluation */}
        <Switch>
          {/* <Route exact path='/' component={Intro}/>
          <Route path='/Home' component={App}/> */}
          <Route exact path='/' render={(props) => <Intro {...props} page={"intro"} />}/>
          <Route path='/Home' component={App}/>
          <Route path='/Photos/:params?' component={Photos}/>
          <Route path='/Videos/:params?' component={Videos}/>
          <Route path='/Documents/:params?' component={Documents}/>
          <Route path='/Maps' component={Maps}/>
          <Route path='/DicomViewer' component={DicomViewer}/>
          <Route path='/GestureKeyboard' component={GestureKeyboard}/>
          <Route path='/CandyCrush' component={CandyCrush}/>
          <Route path='/Model' component={Model} />
          <Route path='/Prismatic' component={Prismatic} />
          <Route path='/Tutorials/:file' component={Tutorials} />
          <Route path='*' component={App}/>
        </Switch>
      </Router>
    );
  }
}

export default Pages;
