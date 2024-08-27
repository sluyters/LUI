import React, { createRef } from 'react';
import { withRouter } from 'react-router';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Grid, Paper, Button } from '@material-ui/core';
import ReactPlayer from 'react-player';

const styles = (theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    height: '100vh',
  },
  player: {
    overflow: 'hidden',
    borderRadius: theme.spacing(2),
  },
});

class Tutorials extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videoFile: undefined,
      playerRef: createRef(),
    };
  }

  componentDidMount() {
    this.setState({ videoFile: this.props.match.params.file });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ videoFile: nextProps.match.params.file });
    if (this.state.playerRef.current) {
      this.state.playerRef.current.seekTo(0);
    }
  }

  render() {
    const { classes, history } = this.props;
    const { videoFile, playerRef } = this.state;
    console.log(window.innerHeight, window.innerWidth)
    let videoHeight = 0;
    let videoWidth = 0;
    if (window.innerHeight * 16/9 > window.innerWidth) {
      videoHeight = 0.9 * window.innerWidth * 9/16;
      videoWidth = 0.9 * window.innerWidth;
    } else {
      videoHeight = 0.9 * window.innerHeight;
      videoWidth = 0.9 * window.innerHeight * 16/9;
    }
    return (
      <div className={classes.root}>
        <ReactPlayer 
          className = {classes.player}
          ref = {playerRef}
          volume={0}
          playing={true}
          width={videoWidth} height={videoHeight} 
          url={`/tutorialVideos/${videoFile}`} 
          controls={true} 
        />
      </div>
    );
  }
}

export default withRouter(withStyles(styles)(Tutorials));