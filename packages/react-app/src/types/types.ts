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
//   zkAsset: any;
// }

export type Note = {
  a: object;
  k: object;
  gamma: object;
  sigma: object;
  noteHash: Hash;
  metadata: string;
  owner: Address;
};

export type Fraction = {
  numerator: number;
  denominator: number;
  err: number;
};

export type Dividend = {
  source: number;
  target: number;
  residual: number;
};
