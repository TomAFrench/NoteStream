import { Contract } from 'ethers';
import { buildDepositProof } from '../proofs';
import { Address, Hash } from '../../types/types';

async function createStream(
  sendAmount: number,
  streamContract: Contract,
  payerAddress: Address,
  payeeAddress: Address,
  zkAsset: any,
  startTime: number,
  endTime: number,
): Promise<Hash> {
  const depositProof = await buildDepositProof(
    streamContract.address,
    zkAsset,
    payerAddress,
    payeeAddress,
    sendAmount,
  );

  return streamContract.createStream(
    payeeAddress,
    depositProof,
    zkAsset.address,
    startTime,
    endTime,
  );
}

export default createStream;
