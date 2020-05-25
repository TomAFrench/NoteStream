import React, { ReactElement, useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  // Redirect,
  // Route,
  // Switch,
} from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import {
  getContractAddressesForNetwork,
  abis,
} from '@notestream/contract-artifacts';
import { Contract } from 'ethers';
import { Web3Provider } from 'ethers/providers';

import Status from './components/Status';
import DepositDialog from './components/modals/DepositModal';
import WithdrawDialog from './components/modals/WithdrawModal';
import CreateStreamDialog from './components/modals/CreateStreamModal';
import { useWalletProvider } from './contexts/OnboardContext';

import SideBar from './components/SideBar';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  paper: {
    padding: theme.spacing(2),
    [theme.breakpoints.up(800 + theme.spacing(3) * 2)]: {
      padding: theme.spacing(3),
    },
  },
  pageElement: {
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
    [theme.breakpoints.up(800 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
    },
  },
  icon: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

function TabPanel(props: any): ReactElement {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

const NETWORK_ID: number = parseInt(
  process.env.REACT_APP_NETWORK_ID as string,
  10,
);

const App = (): ReactElement => {
  const classes = useStyles();
  const provider = useWalletProvider();
  const [open, setOpen] = useState(true);
  const [streamContractInstance, setStreamContractInstance] = useState<
    Contract
  >();
  const [value, setValue] = useState(0);
  const addresses = getContractAddressesForNetwork(NETWORK_ID);

  useEffect(() => {
    if (provider) {
      const signer = new Web3Provider(provider).getSigner();
      const streamContract = new Contract(
        addresses.NoteStream,
        abis.NoteStream,
        signer,
      );
      setStreamContractInstance(streamContract);
    }
  }, [provider, addresses.NoteStream]);

  return (
    <div className={classes.root}>
      <SideBar open={open} setOpen={setOpen} />
      <main
        className={`${classes.content} ${open ? classes.contentShift : ''}`}
      >
        <Router>
          <Paper className={`${classes.pageElement} ${classes.paper}`}>
            <Grid container direction="row" justify="space-around" spacing={3}>
              <Grid item>
                <DepositDialog />
              </Grid>
              {streamContractInstance && (
                <Grid item>
                  <CreateStreamDialog
                    streamContractInstance={streamContractInstance}
                  />
                </Grid>
              )}
              <Grid item>
                <WithdrawDialog />
              </Grid>
            </Grid>
          </Paper>
          <Grid item xs={12} className={classes.pageElement}>
            <AppBar position="static">
              <Tabs
                value={value}
                onChange={(event, newValue): void => setValue(newValue)}
                variant="fullWidth"
              >
                <Tab label="Sending" />
                <Tab label="Receiving" />
              </Tabs>
            </AppBar>
            <Paper className={classes.paper}>
              {streamContractInstance && (
                <>
                  <TabPanel value={value} index={0}>
                    <Status
                      role="sender"
                      streamContractInstance={streamContractInstance}
                    />
                  </TabPanel>
                  <TabPanel value={value} index={1}>
                    <Status
                      role="recipient"
                      streamContractInstance={streamContractInstance}
                    />
                  </TabPanel>
                </>
              )}
            </Paper>
          </Grid>
        </Router>
      </main>
    </div>
  );
};

export default App;
