import { calculateWithdrawal } from './withdrawal';
import buildProofs from './proofs/cancellationProof';
import { Address, Stream } from '../types/types';

const BUFFER_SECONDS = 120;

export default async function cancelStream(
  aztec: any,
  streamContractInstance: any,
  streamId: number,
  userAddress: Address,
): Promise<void> {
  const streamObj: Stream = await streamContractInstance.getStream(streamId);

  console.log(streamObj);
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

  console.log('building proofs');
  const { proof1, proof2 } = await buildProofs(aztec, streamContractInstance.address, streamObj, withdrawalValue);

  console.log('Cancelling stream:', streamId);
  console.log('Proofs:', proof1, proof2);
  const results = await streamContractInstance.cancelStream(
    streamId,
    proof1.encodeABI(),
    proof2.encodeABI(streamObj.tokenAddress),
    withdrawalDuration,
  );
  console.log(results);
}
