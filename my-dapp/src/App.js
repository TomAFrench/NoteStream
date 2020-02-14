import React, { PureComponent } from 'react';
import {
  Block,
  Text,
  Button,
} from '@aztec/guacamole-ui';
import Loading from './views/Loading';
import Account from './views/Account';
import getContractAddress from './utils/getContractAddress';
import styles from './app.module.scss';

class App extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      sdkLoaded: false,
      aztecAccount: false,
      account: null,
      network: null,
      nextAccount: null,
      nextNetwork: null,
      error: null,
    };
  }

  componentDidMount() {
    if (window.aztec) {
      this.aztecSdkLoaded();
    } else {
      window.aztecCallback = this.aztecSdkLoaded;
    }
  }

  componentWillUnmount() {
    window.aztec.removeListener('profileChanged', this.handleProfileChanged);
  }

  aztecSdkLoaded = () => {
    window.aztec.addListener('profileChanged', this.handleProfileChanged);

    const account = window.aztec.web3.getAccount();
    const network = window.aztec.web3.getNetwork();

    this.setState(
      {
        sdkLoaded: true,
        account,
        network,
      },
      this.enableAztecSdk,
    );
  };

  enableAztecSdk = async () => {
    try {
      const contractAddresses = {
        ganache: {
          ACE: getContractAddress('ACE'),
          AccountRegistryManager: getContractAddress('AccountRegistryManager'),
        },
      };
      await window.aztec.enable({
        apiKey: 'ethglobalstarterkit',
        contractAddresses,
      });
    } catch (error) {
      console.error('Failed to enable AZTEC SDK.');
      console.log(error);
      this.setState({
        error,
      });
    }
  };

  handleProfileChanged = (type, value, error) => {
    const {
      nextAccount,
      nextNetwork,
    } = this.state;

    const nextState = {
      aztecAccount: null,
      account: nextAccount,
      network: nextNetwork,
    };

    switch (type) {
      case 'accountChanged':
        nextState.aztecAccount = null;
        nextState.nextAccount = value;
        break;
      case 'chainChanged':
      case 'networkChanged':
        nextState.aztecAccount = null;
        nextState.nextNetwork = value;
        break;
      case 'aztecAccountChanged': {
        const {
          aztecAccount: prevAztecAccount,
        } = this.state;
        if (value) {
          const account = window.aztec.web3.getAccount();
          const network = window.aztec.web3.getNetwork();
          nextState.aztecAccount = value;
          nextState.account = account;
          nextState.network = network;
          nextState.nextAccount = null;
          nextState.nextNetwork = null;
        } else if (prevAztecAccount || error) {
          nextState.error = error;
        }
        break;
      }
      default:
    }

    this.setState(nextState);
  };

  retryLogin = () => {
    this.setState(
      {
        error: null,
      },
      this.enableAztecSdk,
    );
  };

  renderRetryButton() {
    return (
      <Block padding="l">
        <Text
          text="Please login to continue."
        />
        <Block top="m">
          <Button
            text="Login"
            onClick={this.retryLogin}
          />
        </Block>
      </Block>
    );
  }

  render() {
    const {
      sdkLoaded,
      aztecAccount,
      account,
      network,
      nextAccount,
      nextNetwork,
      error,
    } = this.state;

    let contentNode = null;
    let loadingMessage = '';
    if (error) {
      contentNode = this.renderRetryButton();
    } else if (!sdkLoaded) {
      loadingMessage = 'Loading SDK...';
    } else if (nextAccount && (!account || nextAccount.address !== account.address)) {
      loadingMessage = `Switching account to ${nextAccount.address}...`;
    } else if (nextNetwork && (!network || nextNetwork.id !== network.id)) {
      loadingMessage = `Switching network to ${nextNetwork.name} (${nextNetwork.id})...`;
    } else if (!aztecAccount) {
      loadingMessage = 'Logging in to AZTEC account...';
    } else {
      contentNode = (
        <Account
          account={aztecAccount}
          network={network}
        />
      );
    }

    return (
      <Block
        className={styles.app}
        padding="xxl"
      >
        {!!loadingMessage && (
          <Loading
            message={loadingMessage}
          />
        )}
        {contentNode}
      </Block>
    );
  }
}

export default App;
