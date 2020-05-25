import React, { ReactElement, useEffect, useState } from 'react';
import { useTheme } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HomeIcon from '@material-ui/icons/Home';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import HelpIcon from '@material-ui/icons/Help';
import GitHubIcon from '@material-ui/icons/GitHub';

import TransakSDK from '@transak/transak-sdk';
import Link from '../Link';

import setupTransak from '../../utils/transak';
import { useAddress } from '../../contexts/OnboardContext';

const links = [
  { text: 'Home', icon: <HomeIcon />, url: '/' },
  { text: 'Convert assets', icon: <SwapHorizIcon />, url: '/exchange' },
  { text: 'Create new stream', icon: <LocalAtmIcon />, url: '/send' },
  {
    text: 'Collect earnings',
    icon: <AccountBalanceWalletIcon />,
    url: '/receive',
  },
  { text: 'FAQ', icon: <HelpIcon />, url: 'https://docs.note.stream' },
  {
    text: 'Github',
    icon: <GitHubIcon />,
    url: 'https://github.com/TomAFrench/NoteStream',
  },
];

const SideBarLinks = (): ReactElement => {
  const theme = useTheme();
  const userAddress = useAddress();
  const [transak, setTransak] = useState<typeof TransakSDK>();

  useEffect(() => {
    setTransak(setupTransak(userAddress, theme.palette.primary.main));
  }, [userAddress, theme.palette.primary.main]);

  return (
    <List>
      {links.map((link, index) => (
        <ListItem button component={Link} to={link.url} key={index}>
          <ListItemIcon>{link.icon}</ListItemIcon>
          <ListItemText primary={link.text} />
        </ListItem>
      ))}
      <ListItem button onClick={(): Promise<void> => transak.init()}>
        <ListItemIcon>
          <ShoppingCartIcon />
        </ListItemIcon>
        <ListItemText primary="Buy crypto" />
      </ListItem>
    </List>
  );
};

export default SideBarLinks;
