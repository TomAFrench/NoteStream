export type Address = string;

export type Hash = string;

declare global {
  interface Window {
    aztec: any;
    ethereum: any;
    web3: any;
  }
}

export type Stream = any;
// export interface Stream {
//   id: number;
//   cancellation: any;
//   sender: Address;
//   recipient: Address;
//   startTime: number;
//   lastWithdrawTime: number;
//   stopTime: number;
//   tokenAddress: Address;
//   noteHash: Hash;
//   currentBalance: Hash;
//   zkAsset: any;
// }
