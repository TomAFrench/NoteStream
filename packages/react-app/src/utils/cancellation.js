import { calculateWithdrawal } from './withdrawal';
import buildProofs from './proofs/cancellationProof';

const BUFFER_SECONDS = 120;

export default async function cancelStream(aztec, streamContractInstance, streamId, userAddress) {
  const streamObj = await streamContractInstance.methods.getStream(streamId).call();

  const note = await aztec.zkNote(streamObj.currentBalance);

  // If stream sender is cancelling the stream then they need to cancel
  // at a timestamp AFTER which the transaction is included in a block.
  // We then add a buffer of 2 minutes to the time which they try to cancel at.
  const bufferSeconds = userAddress === streamObj.sender ? BUFFER_SECONDS : 0;

  // Calculate a valid timestamp to cancel stream at
  const { withdrawalValue, withdrawalDuration } = await calculateWithdrawal(
    note.value,
    streamObj.lastWithdrawTime,
    streamObj.stopTime,
    bufferSeconds,
  );

  const { proof1, proof2 } = await buildProofs(
    aztec,
    streamContractInstance.options.address,
    streamObj,
    withdrawalValue,
  );

  console.log('Cancelling stream:', streamId);
  console.log('Proofs:', proof1, proof2);
  const results = await streamContractInstance.methods
    .cancelStream(streamId, proof1.encodeABI(), proof2.encodeABI(streamObj.tokenAddress), withdrawalDuration)
    .send({ from: userAddress });
  console.log(results);
}
