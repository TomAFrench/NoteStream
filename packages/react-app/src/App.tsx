import React, { ReactElement, useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  // Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

import {
  getContractAddressesForNetwork,
  abis,
} from '@notestream/contract-artifacts';
import { Contract } from 'ethers';
import { Web3Provider } from 'ethers/providers';

import { useWalletProvider } from './contexts/OnboardContext';

import ExchangePage from './pages/ExchangePage';
import SendPage from './pages/SendPage';
import ReceivePage from './pages/ReceivePage';

import SideBar from './components/sidebar/SideBar';

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

const NETWORK_ID: number = parseInt(
  process.env.REACT_APP_NETWORK_ID as string,
  10,
);

const App = (): ReactElement => {
  const classes = useStyles();
  const provider = useWalletProvider();
  const [open, setOpen] = useState(true);
  const [streamContract, setStreamContract] = useState<Contract>();
  const addresses = getContractAddressesForNetwork(NETWORK_ID);

  useEffect(() => {
    if (provider) {
      const signer = new Web3Provider(provider).getSigner();
      const noteStreamContract = new Contract(
        addresses.NoteStream,
        abis.NoteStream,
        signer,
      );
      setStreamContract(noteStreamContract);
    }
  }, [provider, addresses.NoteStream]);

  return (
    <div className={classes.root}>
      <Router>
        <SideBar open={open} setOpen={setOpen} />
        <main
          className={`${classes.content} ${open ? classes.contentShift : ''}`}
        >
          <Switch>
            <Route exact path="/exchange">
              <ExchangePage />
            </Route>
            <Route exact path="/send">
              <SendPage streamContract={streamContract} />
            </Route>
            <Route exact path="/receive">
              <ReceivePage streamContract={streamContract} />
            </Route>
            <Route exact path="/"></Route>
          </Switch>
        </main>
      </Router>
    </div>
  );
};

export default App;
