import { css } from 'glamor';

const zoomIn = css.keyframes({
  '0%': { transform: 'scale(0.5)' },
  '100%': { transform: 'scale(1)' }
});

// CSS styling of Photos application
const styles = {
  gallery: {
    animation: `${zoomIn} 1s`,
    width: '100%',
    height: '100%',
  },

  canvas: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 10,
    pointerEvents: 'none',
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
    fill: 'white',
  },

  hidden: {
    opacity: 0,
  }
};

export { styles };