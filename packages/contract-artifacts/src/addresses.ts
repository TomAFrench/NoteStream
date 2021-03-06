// import mainnetAddresses from "../addresses/mainnet.json";
import rinkebyAddresses from '../addresses/rinkeby.json';

export type Address = string;

export interface Deployment {
  ACE: Address;
  NoteStream: Address;
}

/**
 * Used to get addresses of contracts that have been deployed to either the
 * Ethereum mainnet or a supported testnet. Throws if there are no known
 * contracts deployed on the corresponding network.
 * @param networkId The desired networkId.
 * @returns The set of addresses for contracts which have been deployed on the
 * given networkId.
 */
const getContractAddressesForNetwork = (networkId: number): Deployment => {
  switch (networkId) {
    // case 1:
    // return mainnetAddresses;
    case 4:
      return rinkebyAddresses;
    default:
      throw new Error(
        `Unknown network id (${networkId}). No known NoteStream contracts have been deployed on this network.`,
      );
  }
};

export default getContractAddressesForNetwork;
