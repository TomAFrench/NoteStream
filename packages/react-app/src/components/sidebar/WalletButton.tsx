import React, { ReactElement, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Blockies from 'react-blockies';

import { Web3Provider } from 'ethers/providers';

import lookupAddress from '../../utils/ens/lookupAddress';
import {
  useAddress,
  useSetup,
  useWalletProvider,
} from '../../contexts/OnboardContext';

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
