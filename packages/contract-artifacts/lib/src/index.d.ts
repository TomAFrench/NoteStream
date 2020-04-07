export declare type Address = string;
export interface Deployment {
    ACE: Address;
    AztecStreamer: Address;
}
export declare const abis: object;
/**
 * Used to get addresses of contracts that have been deployed to either the
 * Ethereum mainnet or a supported testnet. Throws if there are no known
 * contracts deployed on the corresponding network.
 * @param networkId The desired networkId.
 * @returns The set of addresses for contracts which have been deployed on the
 * given networkId.
 */
export declare const getContractAddressesForNetwork: (networkId: number) => Deployment;
