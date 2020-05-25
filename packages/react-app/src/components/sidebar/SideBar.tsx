import React, { ReactElement } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import SideBarLinks from './SideBarLinks';
import WalletButton from './WalletButton';

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

const SideBar = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Function;
}): ReactElement => {
  const classes = useStyles();

  const toggleDraw = (): void => {
    setOpen(!open);
  };

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
      <WalletButton />
      <Divider />
      <SideBarLinks />
    </Drawer>
  );
};

export default SideBar;
