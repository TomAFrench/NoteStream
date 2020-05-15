import React, {
  Component,
  createContext,
  ReactElement,
  useContext,
} from 'react';
import PropTypes from 'prop-types';
import getZkAssetsForNetwork from 'zkasset-metadata';

import { getContractAddressesForNetwork } from '@notestream/contract-artifacts';
import { zkAssetMap } from '../types/types';

interface Props {
  children: ReactElement | Array<ReactElement>;
}

interface State {
  aztec: any;
  zkAssets: zkAssetMap;
}

export const AztecContext = createContext({} as State);

export function useAztecContext(): State {
  return useContext(AztecContext);
}

// API key for use with GSN for free txs.
const AZTEC_API_KEY = '9HRKN7S-JSZMRJM-KWSDWSY-B2VSRD9';

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
    apiKey: AZTEC_API_KEY,
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

export const useAztec = (): any => {
  const { aztec } = useAztecContext();
  return aztec;
};

export const useZkAssets = (): zkAssetMap => {
  const { zkAssets } = useAztecContext();
  return zkAssets;
};

export default AztecProvider;
