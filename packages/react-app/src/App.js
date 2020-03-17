import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';


import './App.css';
import {
  Route, BrowserRouter as Router, Redirect, useHistory,
} from 'react-router-dom';
import getWeb3 from './utils/web3';

import Create from './views/create';
import Deposit from './views/deposit';
import Status from './views/status';
import Withdraw from './views/withdraw';


const zkAssetAddress = '0x54Fac13e652702a733464bbcB0Fb403F1c057E1b';
const streamContractAddress = '0x2a8F71f7beb02Dc230cc1C453AC5f9Aad87d4aa0';
const streamContractABI = require('./AztecStreamer.abi.js');

const useStyles = makeStyles(theme => ({
  appBar: {
    position: 'relative',
  },
  layout: {
    width: 'auto',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(800 + theme.spacing(2) * 2)]: {
      width: 800,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(800 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  stepper: {
    padding: theme.spacing(3, 0, 5),
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
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

function LinkTab(props) {
  const history = useHistory();
  return (
    <Tab
      onClick={(event) => {
        event.preventDefault();
        history.push(props.href);
      }}
      {...props}
    />
  );
}


const App = () => {
  const classes = useStyles();
  const [openTab, setOpenTab] = useState(0);
  // const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [zkAsset, setZkAsset] = useState();
  const [daiBalance, setDaiBalance] = useState(0);
  const [zkdaiBalance, setZkdaiBalance] = useState(0);
  const [streamContractInstance, setStreamContractInstance] = useState(null);

  useEffect(() => {
    async function getBalance(asset, address) {
      const publicBalance = await asset.balanceOfLinkedToken(address);
      const zkBalance = await asset.balance();
      setDaiBalance(publicBalance.toString(10));
      setZkdaiBalance(zkBalance);
    }

    async function init() {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();

      console.log('web3', web3);
      console.log('windowaztec', window.aztec);
      // setWeb3(web3);

      setAccount(accounts[0]);
      console.log('accounts', accounts);

      await window.aztec.enable({
        // web3Provider: _web3.currentProvider, // change this value to use a different web3 provider
        // contractAddresses: {
        // ACE: '0x5B59B26bdBBA8e32C1C6DD107e3862b5D538fa48', // the address of the ace contract on the local network
        // AccountRegistry: '0x66db0e20a9d619ee3dfa3819513ab8bed1b21a87' // the address of the aztec account registry contract on the local network.
        // },
        apiKey: '7FJF5YK-WV1M90Y-G25V2MW-FG2ZMDV', // API key for use with GSN for free txs.
      });

      // Fetch the zkAsset
      const asset = await window.aztec.zkAsset(zkAssetAddress);
      setZkAsset(asset);
      console.log('ASSET:', asset);
      getBalance(asset, accounts[0]);

      const streamContract = new web3.eth.Contract(
        streamContractABI,
        streamContractAddress,
      );
      setStreamContractInstance(streamContract);
    }
    init();
  }, []);

  return (
    <Router>
      <AppBar position="static">
        <Tabs
          value={openTab}
          // indicatorColor="primary"
          // textColor="primary"
          onChange={(event, newTab) => setOpenTab(newTab)}
          variant="fullWidth"
          >
          <LinkTab label="Deposit" href="/deposit" />
          <LinkTab label="Create" href="/create" />
          <LinkTab label="Status" href="/status" />
          <LinkTab label="Withdraw" href="/withdraw" />
        </Tabs>
      </AppBar>
      <main className={classes.layout}>

      <Paper className={classes.paper}>
        <Route
          path="/deposit"
          render={() => (
            <Deposit
              userAddress={account}
              zkAsset={zkAsset}
              streamContractAddress={streamContractAddress}
              daiBalance={daiBalance}
              zkdaiBalance={zkdaiBalance}
            />
          )}
        />

        <Route
          path="/create"
          render={() => (
            <Create
              userAddress={account}
              zkAsset={zkAsset}
              streamContractAddress={streamContractAddress}
              streamContractInstance={streamContractInstance}
              zkdaiBalance={zkdaiBalance}
            />
          )}
        />

        <Route
          path="/status"
          render={() => (
            <Status
              userAddress={account}
              streamContractInstance={streamContractInstance}
              zkdaiBalance={zkdaiBalance}
              zkNote={window.aztec.zkNote}
            />
          )}
        />

        <Route
          path="/withdraw"
          render={() => (
            <Withdraw
              userAddress={account}
              aztec={window.aztec}
              zkdaiBalance={zkdaiBalance}
              streamContractInstance={streamContractInstance}
            />
          )}
        />

        <Redirect path="/" to="/deposit" />
      </Paper>
      </main>
    </Router>
  );
};

export default App;
