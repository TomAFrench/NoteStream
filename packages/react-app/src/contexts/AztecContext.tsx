import React, {
  Component,
  createContext,
  ReactElement,
  useContext,
} from 'react';
import PropTypes from 'prop-types';
import getZkAssetsForNetwork from 'zkasset-metadata';

import { getContractAddressesForNetwork } from '@notestream/contract-artifacts';
import { zkAssetMap, AztecSDK } from '../types/types';

interface Props {
  children: ReactElement | Array<ReactElement>;
}

interface State {
  aztec: AztecSDK;
  zkAssets: zkAssetMap;
}

export const AztecContext = createContext({} as State);

export function useAztecContext(): State {
  return useContext(AztecContext);
}

const NETWORK_ID: number = parseInt(
  process.env.REACT_APP_NETWORK_ID as string,
  10,
);

async function setup(networkId: number): Promise<void> {
  const addresses = getContractAddressesForNetwork(networkId);
  await window.aztec.enable({
    contractAddresses: {
      ACE: addresses.ACE,
    },
    apiKey: process.env.REACT_APP_AZTEC_API_KEY, // API key for use with GSN for free txs.
  });
}

class AztecProvider extends Component<Props, State> {
  state: Readonly<State> = {
    aztec: {},
    zkAssets: {},
  };

  static propTypes = {
    children: PropTypes.any.isRequired,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      ...this.state,
      zkAssets: getZkAssetsForNetwork(NETWORK_ID),
    };
  }

  componentDidMount(): void {
    window.addEventListener('load', () => {
      setup(NETWORK_ID).then(() => {
        this.setState({ aztec: window.aztec });
      });
    });
  }

  render(): ReactElement {
    return (
      <AztecContext.Provider value={this.state}>
        {this.props.children}
      </AztecContext.Provider>
    );
  }
}

export const useAztec = (): AztecSDK => {
  const { aztec } = useAztecContext();
  return aztec;
};

export const useZkAssets = (): zkAssetMap => {
  const { zkAssets } = useAztecContext();
  return zkAssets;
};

export default AztecProvider;
