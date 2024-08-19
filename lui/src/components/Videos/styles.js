import { css } from 'glamor';

const zoomIn = css.keyframes({
  '0%': { transform: 'scale(0.5)' },
  '100%': { transform: 'scale(1)' }
});

// CSS styling of Documents application
const styles = (theme) => ({
  gallery: {
    animation: `${zoomIn} 0.5s`,
    height: '95vh',
  },
  canvas: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 100,
    pointerEvents: 'none'
  },
  carousel: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  row: {
    height: '30%',
    margin: '2%'
  },
  contentContainer: {
    width: '100%', 
    height: '100%',
  },
  container: {
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: '100%',
    height: '100%',
    padding: '0px',
    listStyle: 'none',
    overflow: 'none',
    zIndex: '1',
    backgroundColor: '#ECEFF1',
    overflow: 'hidden',
  },
  maincontent: {
    position: 'absolute',
    bottom: '50px',
    top: 0,
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
    flex: 0,
  },
  frameContainer: {
    display: 'block',
    width: '25vw',
    height: '27vh',
    verticalAlign: 'middle',
    padding: '0px',
    boxShadow: '0px 0px 10px 2px #999',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 5
  },
  zoomed: {
    width: '100vw',
    height: '93vh',
  },
  hovered: {
    transform: 'scale(1.15)',
    transition: '200ms ease-out',
    position: 'relative',
    zIndex: 5,
  },
  stepper: {
    margin: 'auto',
    width: 'fit-content',
    maxWidth: '100%',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  dots: {
    margin: 'auto',
  },
  button: {
    color: "rgba(50,50,50,0.8)",
  },
  xbutton: {
    color: "rgba(50,50,50,0.8)",
  },
  overviewPage: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewRow: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPreviewContainer: {
    height: '90%',
    width: '90%',
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPreview: {
    width: '80%', 
    boxShadow: '0px 0px 10px 2px #999', 
    transition: 'all 0.2s',
  },
  videoPreviewHovered: {
    transform: 'scale(1.1)',
  },
  videoFullscreenContainer: {
    height: '95%',
    width: '95%',
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoFullscreen: {
    maxWidth: 'calc(85vh * (16/9))',
    width: '90%', 
    boxShadow: '0px 0px 10px 2px #999', 
  },
  reactPlayer: {
    '& > video': {
      display: 'block',
    },
  },
  volume: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: '-100px',
    marginLeft: '-25px',
    height: '200px',
    width: '50px',
    borderRadius: '25px',
    overflow: 'hidden',
    zIndex: 55,
    backgroundColor: 'rgba(0,0,0,0.7)',
    transition: 'opacity 0.2s',
  },
  volumeSlider: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  hidden: {
    opacity: 0,
  }
});

export { styles };