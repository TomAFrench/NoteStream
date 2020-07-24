import { Contract } from '@ethersproject/contracts';
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
  const { proof, signature } = await buildDepositProof(
    streamContract.address,
    zkAsset,
    payerAddress,
    payeeAddress,
    sendAmount,
  );

  return streamContract.createStream(
    payeeAddress,
    proof,
    signature,
    zkAsset.address,
    startTime,
    endTime,
  );
}

export default createStream;
