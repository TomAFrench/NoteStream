import React, { ReactElement, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
// import AddIcon from '@material-ui/icons/Add';
// import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
// import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import HelpIcon from '@material-ui/icons/Help';
import GitHubIcon from '@material-ui/icons/GitHub';
import Blockies from 'react-blockies';

import { Web3Provider } from 'ethers/providers';
import Link from './Link';

import lookupAddress from '../utils/ens/lookupAddress';
import {
  useAddress,
  useSetup,
  useWalletProvider,
} from '../contexts/OnboardContext';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  hide: {
    display: 'none',
  },
  avatar: {
    marginLeft: theme.spacing(-1),
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(8),
    },
  },
  paper: {},
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

const links = [
  // { text: 'Deposit', icon: <AddIcon />, url: '/deposit' },
  // { text: 'Buy Options', icon: <ShoppingCartIcon />, url: '/options/buy' },
  // {
  //   text: 'Exercise Options',
  //   icon: <SwapHorizIcon />,
  //   url: '/options/exercise',
  // },
  { text: 'FAQ', icon: <HelpIcon />, url: 'https://docs.note.stream' },
  {
    text: 'Github',
    icon: <GitHubIcon />,
    url: 'https://github.com/TomAFrench/NoteStream',
  },
];

const trimAddress = (address: string): string =>
  `${address.slice(0, 6)}...${address.slice(-5, -1)}`;

const SideBar = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Function;
}): ReactElement => {
  const classes = useStyles();
  const setup = useSetup();
  const userAddress = useAddress();
  const provider = useWalletProvider();
  const [ensName, setEnsName] = useState<string>(userAddress || '');

  const toggleDraw = (): void => {
    setOpen(!open);
  };

  useEffect(() => {
    if (provider) {
      const ethersProvider = new Web3Provider(provider);
      lookupAddress(ethersProvider, userAddress).then((name) => {
        if (name) setEnsName(name);
      });
    }
  }, [userAddress, provider]);

  // useEffect(() => setup('MetaMask'), [setup]);

  return (
    <Drawer
      variant="permanent"
      className={`${classes.drawer} ${
        open ? classes.drawerOpen : classes.drawerClose
      }`}
      classes={{
        paper: `${classes.paper} ${
          open ? classes.drawerOpen : classes.drawerClose
        }`,
      }}
    >
      <div className={classes.toolbar}>
        <IconButton onClick={toggleDraw}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </div>
      <Divider />
      {userAddress ? (
        <ListItem button>
          <ListItemIcon>
            <Avatar className={classes.avatar}>
              <Blockies seed={userAddress} size={10} />
            </Avatar>
          </ListItemIcon>
          <ListItemText primary={ensName || trimAddress(userAddress)} />
        </ListItem>
      ) : (
        <ListItem button onClick={() => setup()}>
          {/* <ListItemIcon></ListItemIcon> */}
          <ListItemText primary={'Connect to Wallet'} />
        </ListItem>
      )}
      <Divider />
      <List>
        {links.map((link, index) => (
          <ListItem button component={Link} to={link.url} key={index}>
            <ListItemIcon>{link.icon}</ListItemIcon>
            <ListItemText primary={link.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default SideBar;
