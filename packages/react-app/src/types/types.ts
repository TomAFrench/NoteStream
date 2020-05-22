/* eslint-disable @typescript-eslint/no-explicit-any */
import BN from 'bn.js';

export type Address = string;

export type Hash = string;

declare global {
  interface Window {
    aztec: any;
    ethereum: any;
    web3: any;
  }
}

export interface Stream {
  id: number;
  cancellation: any;
  sender: Address;
  recipient: Address;
  startTime: number;
  lastWithdrawTime: number;
  stopTime: number;
  tokenAddress: Address;
  noteHash: Hash;
  zkAsset: any;
}

export type ZkNote = {
  asset: {
    address: Address;
    linkedTokenAddress: Address;
  };
  id: Hash;
  noteHash: Hash;
  owner: {
    address: Address;
  };
  status: 'CREATED' | 'DESTROYED';
  value: number;
  viewingKey: string;
  valid: boolean;
  visible: boolean;
  destroyed: boolean;
};

export type Note = {
  a: BN;
  k: BN;
  gamma: BN;
  sigma: BN;
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

export type zkAssetMetadata = {
  name: string;
  symbol: string;
  scalingFactor: number;
  linkedToken: Address;
};

export type zkAssetMap = {
  [name: string]: zkAssetMetadata;
};
