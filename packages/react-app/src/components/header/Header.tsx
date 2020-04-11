import React, { ReactElement } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import GitHubIcon from '@material-ui/icons/GitHub';
import Avatar from '@material-ui/core/Avatar';

import Blockies from 'react-blockies';

import { useAddress } from '../../contexts/OnboardContext';

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

const Header = (): ReactElement => {
  const classes = useStyles();
  const userAddress = useAddress();
  const trimmedAddress = `${userAddress.slice(0, 6)}...${userAddress.slice(-5, -1)}`;

  return (
    <AppBar position="static">
      <Toolbar>
        <LocalAtmIcon className={classes.icon} />
        <Typography variant="h6" className={classes.title}>
          NoteStream
        </Typography>
        <Chip
          avatar={
            <Avatar>
              <Blockies seed={userAddress} />
            </Avatar>
          }
          label={trimmedAddress}
        />

        <IconButton className={classes.icon} href="https://github.com/TomAFrench/NoteStream">
          <GitHubIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {};

export default Header;
