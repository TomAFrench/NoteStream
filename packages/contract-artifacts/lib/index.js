"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getContractAddressesForNetwork = exports.abis = void 0;

var _AztecStreamer = _interopRequireDefault(require("../abis/AztecStreamer.json"));

var _rinkeby = _interopRequireDefault(require("../addresses/rinkeby.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import mainnetAddresses from "./addresses/mainnet";
const {
  isUndefined
} = require('lodash');

const abis = {
  AztecStreamer: _AztecStreamer.default
};
exports.abis = abis;
const networkToAddresses = {
  // '1': {
  //   ...mainnetAddresses,
  // },
  4: { ..._rinkeby.default
  }
};
/**
 * Used to get addresses of contracts that have been deployed to either the
 * Ethereum mainnet or a supported testnet. Throws if there are no known
 * contracts deployed on the corresponding network.
 * @param networkId The desired networkId.
 * @returns The set of addresses for contracts which have been deployed on the
 * given networkId.
 */

const getContractAddressesForNetwork = networkId => {
  if (isUndefined(networkToAddresses[networkId])) {
    throw new Error(`Unknown network id (${networkId}). No known AZTEC contracts have been deployed on this network.`);
  }

  return networkToAddresses[networkId];
};

exports.getContractAddressesForNetwork = getContractAddressesForNetwork;