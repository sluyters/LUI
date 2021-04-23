import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

// https://medium.com/bleeding-edge/enforcing-an-aspect-ratio-on-an-html-element-in-react-and-css-27a13241c3d4

const useStyles = makeStyles({
  ratioOuterWrapper: {
    position: 'relative',
    width: '100%',
    height: 0,
    paddingBottom: props => `${props.padding}%`,
  },
  ratioInnerWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

function AspectRatio({ children, className, ratio }) {
  const classes = useStyles({ padding: (1 / ratio) * 100});
  return (
    <div className={className}>
      <div class={classes.ratioOuterWrapper}>
        <div className={classes.ratioInnerWrapper}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AspectRatio;
