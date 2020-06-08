import React, { ReactElement } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Blockies from 'react-blockies';

import { useAddress, useSetup } from '../../contexts/OnboardContext';
import useENSName from '../../hooks/useENSName';

const useStyles = makeStyles((theme) => ({
  avatar: {
    marginLeft: theme.spacing(-1),
  },
}));

const trimAddress = (address: string): string =>
  `${address.slice(0, 6)}...${address.slice(-5, -1)}`;

const WalletButton = (): ReactElement => {
  const classes = useStyles();
  const setup = useSetup();
  const userAddress = useAddress();
  const ensName = useENSName(userAddress);

  if (!userAddress) {
    return (
      <ListItem button onClick={(): void => setup()}>
        {/* <ListItemIcon></ListItemIcon> */}
        <ListItemText primary={'Connect to Wallet'} />
      </ListItem>
    );
  }
  return (
    <ListItem button>
      <ListItemIcon>
        <Avatar className={classes.avatar}>
          <Blockies seed={userAddress} size={10} />
        </Avatar>
      </ListItemIcon>
      <ListItemText primary={ensName || trimAddress(userAddress)} />
    </ListItem>
  );
};

export default WalletButton;
