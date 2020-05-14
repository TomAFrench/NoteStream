import React, { ReactElement, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import getZkAssetsForNetwork from 'zkasset-metadata';
import {
  getContractAddressesForNetwork,
  abis,
} from '@notestream/contract-artifacts';
import { ethers } from 'ethers';

import Status from './components/status';
import DepositDialog from './components/modals/DepositModal';
import WithdrawDialog from './components/modals/WithdrawModal';
import CreateStreamDialog from './components/modals/CreateStreamModal';
import { useAddress, useWallet } from './contexts/OnboardContext';
import setupAztec from './utils/setup';
import Header from './components/header/Header';

const useStyles = makeStyles((theme) => ({
  layout: {
    width: 'auto',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(1200 + theme.spacing(2) * 2)]: {
      width: 1200,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
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
  // button: {
  //   marginRight: theme.spacing(2),
  // },
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
  const userAddress = useAddress();
  const wallet = useWallet();
  const [streamContractInstance, setStreamContractInstance] = useState({});
  const [value, setValue] = useState(0);
  const [aztec, setAztec] = useState({} as any);
  const addresses = getContractAddressesForNetwork(NETWORK_ID);
  const zkAssets = getZkAssetsForNetwork(NETWORK_ID);

  useEffect(() => {
    window.addEventListener('load', () => {
      setupAztec(NETWORK_ID).then(() => {
        setAztec(window.aztec);
      });
    });
  }, []);

  useEffect(() => {
    if (wallet.provider) {
      const signer = new ethers.providers.Web3Provider(
        wallet.provider,
      ).getSigner();
      const streamContract = new ethers.Contract(
        addresses.NoteStream,
        abis.NoteStream,
        signer,
      );
      setStreamContractInstance(streamContract);
    }
  }, [wallet.provider, addresses.NoteStream]);

  return (
    <>
      <Header />
      <main className={classes.layout}>
        <Paper className={`${classes.pageElement} ${classes.paper}`}>
          <Grid container direction="row" justify="space-around" spacing={3}>
            <Grid item>
              <DepositDialog
                aztec={aztec}
                zkAssets={zkAssets}
                userAddress={userAddress}
              />
            </Grid>
            <Grid item>
              <CreateStreamDialog
                aztec={aztec}
                zkAssets={zkAssets}
                userAddress={userAddress}
                streamContractInstance={streamContractInstance}
              />
            </Grid>
            <Grid item>
              <WithdrawDialog
                aztec={aztec}
                zkAssets={zkAssets}
                userAddress={userAddress}
              />
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
            <TabPanel value={value} index={0}>
              <Status
                role="sender"
                userAddress={userAddress}
                aztec={aztec}
                streamContractInstance={streamContractInstance}
              />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <Status
                role="recipient"
                userAddress={userAddress}
                aztec={aztec}
                streamContractInstance={streamContractInstance}
              />
            </TabPanel>
          </Paper>
        </Grid>
      </main>
    </>
  );
};

export default App;
