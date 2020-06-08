import buildProofs from './proofs';
import { Stream, Address, AztecSDK } from '../../types/types';

// On a withdrawal the change note remains on the contract
const buildWithdrawalProofs = (
  aztec: AztecSDK,
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
  aztec: AztecSDK,
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
