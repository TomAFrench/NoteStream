import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';


import './App.css';
import getWeb3 from './utils/web3';

import Create from './components/create';
import Deposit from './components/deposit';
import Status from './components/status';

import { getContractAddressesForNetwork, abis } from "@quachtli/contracts"

const useStyles = makeStyles(theme => ({
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
}));

// async function fetchGanacheContractAddress(contractName) {
//   let network;
//   try {
//     const response = await fetch(`${window.__AZTEC_ARTIFACTS_URL_DEV__}/${contractName}.json`);
//     const contract = await response.json();
//     const lastNetworkId = Object.keys(contract.networks).pop();
//     network = contract.networks[lastNetworkId];
//   } catch (error) {
//     return '';
//   }

//   return (network && network.address) || '';
// }

// function handleRetry() {
//   handleReload();
//   initAztecSdk();
// }

// function handleProfileChanged(type, value, error) {
//   if (type === 'aztecAccountChanged') {
//     if (error) {
//       handleLoadError(error);
//     }
//   } else {
//     handleReload(type, value);
//   }
// }

// async function initAztecSdk() {
//   window.aztec.addListener('profileChanged', handleProfileChanged);

//   const contractAddresses = {
//     ganache: {
//       ACE: await fetchGanacheContractAddress('ACE'),
//       AccountRegistryManager: await fetchGanacheContractAddress('AccountRegistryManager'),
//     },
//   };
//   try {
//     await window.aztec.enable({
//       apiKey: 'test1234',
//       contractAddresses,
//     });
//   } catch (error) {
//     console.error('Failed to enable aztec', error);
//   }
// };

// if (window.aztec) {
//   initAztecSdk();
// } else {
//   window.aztecCallback = initAztecSdk;
// }

function TabPanel(props) {
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


const App = () => {
  const classes = useStyles();
  // const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [zkAsset, setZkAsset] = useState();
  const [daiBalance, setDaiBalance] = useState(0);
  const [zkdaiBalance, setZkdaiBalance] = useState(0);
  const [streamContractInstance, setStreamContractInstance] = useState(null);
  const [value, setValue] = useState(0);


  const addresses = getContractAddressesForNetwork(4)

  useEffect(() => {
    async function init() {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();

      console.log('windowaztec', window.aztec);

      setAccount(accounts[0]);

      await window.aztec.enable({
        // web3Provider: _web3.currentProvider, // change this value to use a different web3 provider
        contractAddresses: {
          ACE: addresses.ACE
        },
        apiKey: '7FJF5YK-WV1M90Y-G25V2MW-FG2ZMDV', // API key for use with GSN for free txs.
      });

      // Fetch the zkAsset
      const asset = await window.aztec.zkAsset(addresses.ZkAsset);
      setZkAsset(asset);
      console.log('ASSET:', asset);

      const updateBalances = async (zkBalance) => {
        setZkdaiBalance(zkBalance);
        const publicBalance = await asset.balanceOfLinkedToken(accounts[0]);
        setDaiBalance(publicBalance.toString(10));
      }
      
      // Initialise balances
      updateBalances(await asset.balance())

      // Update balances on each transfer of ZkAsset
      asset.subscribeToBalance(updateBalances)

      const streamContract = new web3.eth.Contract(
        abis.AztecStreamer,
        addresses.AztecStreamer,
      );
      setStreamContractInstance(streamContract);
    }
    init();
  }, [addresses]);

  return (
    <main className={classes.layout}>
      <Grid
        container
        direction="row"
        spacing={3}
      >
        <Grid
          item
          container
          direction="column"
          justify="flex-start"
          // alignContent="stretch"
          // alignItems="stretch"
          spacing={3}
          xs={6}
        >
          <Grid item>
            <Paper className={`${classes.pageElement} ${classes.paper}`}>
              <Typography variant="h5" gutterBottom>
                Deposit DAI for ZkDAI
              </Typography>
              <Deposit
                userAddress={account}
                zkAsset={zkAsset}
                streamContractAddress={addresses.AztecStreamer}
                daiBalance={daiBalance}
                zkdaiBalance={zkdaiBalance}
              />
            </Paper>
          </Grid>
          <Grid item>
            <Paper className={`${classes.pageElement} ${classes.paper}`}>
              <Typography variant="h5" gutterBottom>
                Create a private stream
              </Typography>
              <Create
                userAddress={account}
                zkAsset={zkAsset}
                streamContractAddress={addresses.AztecStreamer}
                streamContractInstance={streamContractInstance}
              />
            </Paper>
          </Grid>
        </Grid>
        
        <Grid item xs={6} className={classes.pageElement}>
          <AppBar position="static">
          <Tabs value={value} onChange={(event, newValue) => setValue(newValue)} variant="fullWidth">
            <Tab label="Sending"  />
            <Tab label="Receiving"  />
          </Tabs>
        </AppBar>
          <Paper className={classes.paper}>
            <TabPanel value={value} index={0}>
              <Status
                  role="sender"
                  userAddress={account}
                  aztec={window.aztec}
                  streamContractInstance={streamContractInstance}
                  zkdaiBalance={zkdaiBalance}
                />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <Status
                  role="recipient"
                  userAddress={account}
                  aztec={window.aztec}
                  streamContractInstance={streamContractInstance}
                  zkdaiBalance={zkdaiBalance}
                />
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </main>
  );
};

export default App;
