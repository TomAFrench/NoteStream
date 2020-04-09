import buildProofs from './proofs';
import { Stream, Address } from '../../types/types';

export { default as buildDepositProof } from './deposit';
// On a withdrawal the change note remains on the contract
const buildWithdrawalProofs = (
  aztec: any,
  streamContractAddress: Address,
  streamObj: Stream,
  withdrawalValue: number,
): Promise<{ dividendProof: any; joinSplitProof: any }> =>
  buildProofs(
    aztec,
    streamContractAddress,
    streamObj,
    withdrawalValue,
    streamContractAddress,
  );

// On a cancellation the change note is returned to the stream sender
const buildCancellationProofs = (
  aztec: any,
  streamContractAddress: Address,
  streamObj: Stream,
  withdrawalValue: number,
): Promise<{ dividendProof: any; joinSplitProof: any }> =>
  buildProofs(
    aztec,
    streamContractAddress,
    streamObj,
    withdrawalValue,
    streamObj.sender,
  );

export { buildWithdrawalProofs, buildCancellationProofs };
