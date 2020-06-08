import { createMuiTheme } from '@material-ui/core/styles';
import { cyan, orange, grey } from '@material-ui/core/colors';

const theme = createMuiTheme({
  palette: {
    primary: cyan,
    secondary: orange,
    background: {
      default: grey[200],
    },
  },
});

export default theme;
