"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getContractAddressesForNetwork = exports.abis = void 0;

var _AztecStreamer = _interopRequireDefault(require("../abis/AztecStreamer.json"));

var _rinkeby = _interopRequireDefault(require("../addresses/rinkeby.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import mainnetAddresses from "./addresses/mainnet";
const abis = {
  AztecStreamer: _AztecStreamer.default
};
/**
 * Used to get addresses of contracts that have been deployed to either the
 * Ethereum mainnet or a supported testnet. Throws if there are no known
 * contracts deployed on the corresponding network.
 * @param networkId The desired networkId.
 * @returns The set of addresses for contracts which have been deployed on the
 * given networkId.
 */

exports.abis = abis;

const getContractAddressesForNetwork = networkId => {
  switch (networkId) {
    // case 1:
    // return mainnetAddresses;
    case 4:
      return _rinkeby.default;

    default:
      throw new Error(`Unknown network id (${networkId}). No known NoteStream contracts have been deployed on this network.`);
  }
};

exports.getContractAddressesForNetwork = getContractAddressesForNetwork;