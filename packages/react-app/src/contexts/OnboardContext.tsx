import React, { Component, createContext, ReactElement, useContext } from 'react';
import PropTypes from 'prop-types';

import Onboard from 'bnc-onboard';

export const OnboardContext = createContext({} as any);

export function useOnboardContext() {
  return useContext(OnboardContext);
}

const walletChecks = [{ checkName: 'connect' }, { checkName: 'network' }];

const wallets: any = [{ walletName: 'metamask', preferred: true }];

// dappid is mandatory so will have throw away id for local usage.
const testid = 'c212885d-e81d-416f-ac37-06d9ad2cf5af';

class OnboardProvider extends Component {
  state = {
    onboard: {} as any,
    address: '' as string,
    balance: '' as string,
    network: 0 as number,
    wallet: {} as any,
  };

  static propTypes = {
    children: PropTypes.any.isRequired,
  };

  constructor(props: any) {
    super(props);

    const initialisation = {
      dappId: testid,
      networkId: 4,
      walletCheck: walletChecks,
      walletSelect: {
        heading: 'Select a wallet to connect to NoteStream',
        description: 'To use NoteStream you need an Ethereum wallet. Please select one from below:',
        wallets,
      },
      subscriptions: {
        address: (address: string): void => {
          this.setState({ address });
        },
        balance: (balance: string): void => {
          this.setState({ balance });
        },
        network: (network: number): void => {
          this.setState({ network });
        },
        wallet: (wallet: any): void => {
          this.setState({ wallet });
        },
      },
    };

    const onboard = Onboard(initialisation);

    this.state = {
      ...this.state,
      onboard,
    };
  }

  componentDidMount(): void {
    this.setup('MetaMask');
  }

  async setup(defaultWallet: string): Promise<void> {
    const { onboard } = this.state;
    try {
      const selected = await onboard.walletSelect(defaultWallet);
      if (selected) {
        const ready = await onboard.walletCheck();
        if (ready) {
          const walletState = onboard.getState();
          this.setState({ ...walletState });
          console.log(walletState);
        } else {
          // Connection to wallet failed
        }
      } else {
        // User aborted set up
      }
    } catch (error) {
      console.log('error onboarding', error);
    }
  }

  setConfig = (config: any): void => this.state.onboard.config(config);

  render(): ReactElement {
    return (
      <OnboardContext.Provider
        value={
          {
            onboard: this.state.onboard,
            address: this.state.address,
            balance: this.state.balance,
            network: this.state.network,
            wallet: this.state.wallet,
          } as any
        }
      >
        {this.props.children}
      </OnboardContext.Provider>
    );
  }
}

export const useOnboard = () => {
  const { onboard } = useOnboardContext();
  return onboard;
};

export const useGetState = () => {
  const [{ onboard }] = useOnboardContext();
  return onboard.getState();
};

export const useAddress = () => {
  const { address } = useOnboardContext();
  return address;
};

export const useWallet = () => {
  const { wallet } = useOnboardContext();
  return wallet;
};

export default OnboardProvider;
