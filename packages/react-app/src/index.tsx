import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import OnboardProvider from './contexts/OnboardContext';

const walletChecks = [{ checkName: 'connect' }, { checkName: 'network' }];

const wallets: any = [{ walletName: 'metamask', preferred: true }];

// const subscriptions: any = {
//   address: () => {},
//   balance: () => {},
//   network: () => {},
//   wallet: () => {},
// };

// dappid is mandatory so will have throw away id for local usage.
const testid = 'c212885d-e81d-416f-ac37-06d9ad2cf5af';

const initialisation = {
  dappId: testid,
  networkId: 4,
  walletCheck: walletChecks,
  walletSelect: {
    heading: 'Select a wallet to connect to NoteStream',
    description: 'To use NoteStream you need an Ethereum wallet. Please select one from below:',
    wallets,
  },
  // subscriptions,
};

ReactDOM.render(
  <OnboardProvider initialisation={initialisation}>
    <App />
  </OnboardProvider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
