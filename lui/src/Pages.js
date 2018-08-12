import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import App from './App';
import Intro from './components/Intro/Intro.jsx';
import Photos from './components/Photos/PhotosApp.jsx';
import Videos from './components/Videos/VideosApp.js';

class Pages extends Component {

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path='/' component={App}/>
          <Route path='/Photos' component={Photos}/>
          <Route path='/Videos' component={Videos}/>
          <Route path='*' component={App}/>
        </Switch>
      </Router>
    );
  }
}

export default Pages;
