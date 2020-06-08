import { Contract } from 'ethers';
import { calculateWithdrawal } from './withdrawal';
import { buildCancellationProofs } from '../proofs';
import { Address, AztecSDK, Stream, Proof } from '../../types/types';

const BUFFER_SECONDS = 120;

export default async function cancelStream(
  aztec: AztecSDK,
  streamContract: Contract,
  streamId: number,
  userAddress: Address,
): Promise<void> {
  const streamObj: Stream = await streamContract.getStream(streamId);

  const note = await aztec.zkNote(streamObj.noteHash);

  // If stream sender is cancelling the stream then they need to cancel
  // at a timestamp AFTER which the transaction is included in a block.
  // We then add a buffer of 2 minutes to the time which they try to cancel at.
  const bufferSeconds = userAddress === streamObj.sender ? BUFFER_SECONDS : 0;

  // Calculate a valid timestamp to cancel stream at
  const { withdrawalValue, withdrawalDuration } = calculateWithdrawal(
    note.value,
    streamObj.lastWithdrawTime,
    streamObj.stopTime,
    bufferSeconds,
  );

  const {
    dividendProof,
    joinSplitProof,
  }: {
    dividendProof: Proof;
    joinSplitProof: Proof;
  } = await buildCancellationProofs(
    aztec,
    streamContract.address,
    streamObj,
    withdrawalValue,
  );

  console.log('Cancelling stream:', streamId);
  console.log('Proofs:', dividendProof, joinSplitProof);
  return streamContract.cancelStream(
    streamId,
    dividendProof.encodeABI(),
    joinSplitProof.encodeABI(streamObj.tokenAddress),
    withdrawalDuration,
  );
}
