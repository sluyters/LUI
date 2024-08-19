import { css } from 'glamor';

const zoomIn = css.keyframes({
  '0%': { transform: 'scale(0.5)' },
  '100%': { transform: 'scale(1)' }
});

// CSS styling of Documents application
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

  cell: {
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center', 
    alignItems: 'center',
  },

  thumbnail: {
    width: '70%',
    height: '70%',
    padding: '3%',
    boxSizing: 'border-box',
    boxShadow: '0px 0px 10px 2px #999',
    backgroundColor: "#ECEFF1",
    transform: 'scale(1)',
    transition: 'all 0.4s',
    zIndex: '1'
  },

  thumbnailPage: {
    height: '100% !important',
    width: '100% !important',
    display: 'flex',
    justifyContent: 'center', 
    alignItems: 'center',
    '& *': {
      width: 'auto !important',
      height: 'auto !important',
      maxHeight: '100% !important',
      maxWidth: '100% !important',
    }
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
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center', 
    alignItems: 'center',
  },

  pdf: {
    position: 'relative',
    height: 'fit-content',
    width: 'fit-content',
    margin: 'auto'
  },

  transition: {
    transition: 'all 0.2s',
  },

  imageBox: {
    height: '100%',
    width: '100%',
    display: 'flex', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
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

export { styles };