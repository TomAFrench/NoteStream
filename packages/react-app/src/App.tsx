import React, { ReactElement, useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  // Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';

import {
  getContractAddressesForNetwork,
  abis,
} from '@notestream/contract-artifacts';
import { Contract } from '@ethersproject/contracts';

import { useWalletProvider, useNetwork } from './contexts/OnboardContext';

import HomePage from './pages/HomePage';
import ExchangePage from './pages/ExchangePage';
import SendPage from './pages/SendPage';
import ReceivePage from './pages/ReceivePage';

import SideBar from './components/Sidebar';

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

const App = (): ReactElement => {
  const classes = useStyles();
  const provider = useWalletProvider();
  const { appNetworkId } = useNetwork();
  const [open, setOpen] = useState<boolean>(true);
  const [streamContract, setStreamContract] = useState<Contract>();

  useEffect(() => {
    if (appNetworkId && provider) {
      const { NoteStream } = getContractAddressesForNetwork(appNetworkId);
      const noteStreamContract = new Contract(
        NoteStream,
        abis.NoteStream,
        provider.getSigner(),
      );
      setStreamContract(noteStreamContract);
    }
  }, [provider, appNetworkId]);

  return (
    <div className={classes.root}>
      <CssBaseline />
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
            <Route exact path="/">
              <HomePage streamContract={streamContract} />
            </Route>
          </Switch>
        </main>
      </Router>
    </div>
  );
};

export default App;
