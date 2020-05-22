import React, { ReactElement, useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import HelpIcon from '@material-ui/icons/Help';
import GitHubIcon from '@material-ui/icons/GitHub';
import Avatar from '@material-ui/core/Avatar';

import Blockies from 'react-blockies';
import { Web3Provider } from 'ethers/providers';

import lookupAddress from '../../utils/ens/lookupAddress';
import { useAddress, useWalletProvider } from '../../contexts/OnboardContext';

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

const trimAddress = (address: string): string =>
  `${address.slice(0, 6)}...${address.slice(-5, -1)}`;

const Header = (): ReactElement => {
  const classes = useStyles();
  const userAddress = useAddress();
  const provider = useWalletProvider();
  const [ensName, setEnsName] = useState<string>(userAddress || '');

  useEffect(() => {
    if (provider) {
      const ethersProvider = new Web3Provider(provider);
      lookupAddress(ethersProvider, userAddress).then((name) => {
        if (name) setEnsName(name);
      });
    }
  }, [userAddress, provider]);

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
          label={ensName || trimAddress(userAddress)}
        />
        <IconButton
          target="_blank"
          rel="noopener noreferrer"
          href="https://docs.note.stream"
        >
          <HelpIcon color="action" />
        </IconButton>
        <IconButton
          className={classes.icon}
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/TomAFrench/NoteStream"
        >
          <GitHubIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {};

export default Header;
