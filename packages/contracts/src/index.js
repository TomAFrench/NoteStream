const { isUndefined } = require('lodash');

import AztecStreamerABI from "./abis/AztecStreamer";
// import mainnetAddresses from "./addresses/mainnet";
import rinkebyAddresses from "./addresses/rinkeby";

export const abis = {
  AztecStreamer: AztecStreamerABI
}

const networkToAddresses = {
  // '1': {
  //   ...mainnetAddresses,
  // },
  '4': {
      ...rinkebyAddresses,
  },
};

/**
 * Used to get addresses of contracts that have been deployed to either the
 * Ethereum mainnet or a supported testnet. Throws if there are no known
 * contracts deployed on the corresponding network.
 * @param networkId The desired networkId.
 * @returns The set of addresses for contracts which have been deployed on the
 * given networkId.
 */
export const getContractAddressesForNetwork = (networkId) => {
  if (isUndefined(networkToAddresses[networkId])) {
      throw new Error(`Unknown network id (${networkId}). No known AZTEC contracts have been deployed on this network.`);
  }
  return networkToAddresses[networkId];
};
