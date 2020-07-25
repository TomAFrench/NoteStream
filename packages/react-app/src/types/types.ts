/* eslint-disable @typescript-eslint/no-explicit-any */
import BN from 'bn.js';

export type Address = string;

export type Hash = string;

export type AztecSDK = any;

declare global {
  interface Window {
    aztec: AztecSDK;
    ethereum: any;
    web3: any;
  }
}

export interface Stream {
  id: number;
  cancellation: any;
  sender: Address;
  recipient: Address;
  startTime: string;
  lastWithdrawTime: string;
  stopTime: string;
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

export type ZkAsset = {
  address: Address;
  scalingFactor: number;
  balance: Function;
  balanceOfLinkedToken: Function;
  deposit: Function;
  send: Function;
  withdraw: Function;
  linkedTokenAddress: Address;
  token: Token;
  toTokenValue: Function;
  toNoteValue: Function;
};

export type Token = {
  name: string;
  symbol: string;
  decimals: number;
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

export type Proof = {
  blindingFactors: any;
  blindingScalars: any;
  challenge: any;
  challengeHash: { data: string[] };
  data: string[][];
  hash: string;
  inputNotes: Note[];
  m: number;
  notes: Note[];
  output: string;
  outputNotes: Note[];
  outputs: string;
  publicOwner: Address;
  publicValue: BN;
  rollingHash: { data: string[] };
  sender: Address;
  type: string;
  validatedProofHash: string;
  encodeABI: Function;
};
