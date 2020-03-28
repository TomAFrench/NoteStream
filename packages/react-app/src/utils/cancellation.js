import { calculateWithdrawal } from './withdrawal';
import { buildProofs } from './proofs/cancellationProof';


export async function cancelStream(aztec, streamContractInstance, streamId, userAddress) {
  const streamObj = await streamContractInstance.methods.getStream(streamId).call();

  // Calculate what value of the stream is redeemable
  const {
    withdrawalValue,
    withdrawalDuration
  } = await calculateWithdrawal(streamObj, aztec)

  const { proof1, proof2 } = await buildProofs(aztec, streamContractInstance.options.address, streamObj, withdrawalValue);

  console.log("Cancelling stream:", streamId)
  console.log("Proofs:", proof1, proof2);
  const results = await streamContractInstance.methods.cancelStream(
    streamId,
    proof1.encodeABI(),
    proof2.encodeABI(streamObj.tokenAddress),
    withdrawalDuration,
  ).send({ from: userAddress });
  console.log(results);
}