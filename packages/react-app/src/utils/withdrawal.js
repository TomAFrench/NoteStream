import moment from 'moment';

import { buildProofs } from './proofs/withdrawalProof';

export async function calculateWithdrawal(stream, aztec) {

  const note = await aztec.zkNote(stream.currentBalance)
  const withdrawalValue = await calculateMaxWithdrawalValue(stream, note.value)
  const withdrawalDuration = await calculateWithdrawalDuration(stream, withdrawalValue, aztec)
  return {
    withdrawalValue,
    withdrawalDuration
  }
}

export async function calculateMaxWithdrawalValue(stream, noteValue) {
  const {
    lastWithdrawTime, stopTime,
  } = stream;

  // withdraw up to now or to end of stream
  if (moment().isAfter(moment.unix(stopTime))){
    return noteValue
  }

  const remainingStreamLength = moment.duration(
    moment.unix(stopTime).diff(moment.unix(lastWithdrawTime))
    ).asSeconds()

  const idealWithdrawDuration = moment.duration(
    moment().startOf('second').diff(moment.unix(lastWithdrawTime))
    ).asSeconds();

  // Get withdrawal amount if notes were infinitely divisible
  // Floor this to get maximum possible withdrawal
  const idealWithdrawalValue = (idealWithdrawDuration / remainingStreamLength) * noteValue
  const withdrawalValue = Math.floor(idealWithdrawalValue)

  return withdrawalValue
}

export async function calculateWithdrawalDuration(stream, withdrawalValue, aztec) {
  const {
    currentBalance, lastWithdrawTime, stopTime,
  } = stream;

  const streamZkNote = await aztec.zkNote(currentBalance);

  const remainingStreamLength = moment.duration(
    moment.unix(stopTime).diff(moment.unix(lastWithdrawTime))
    ).asSeconds()

  // Find time period for single note to be unlocked then multiply by withdrawal
  const timeBetweenNotes = remainingStreamLength / streamZkNote.value
  const withdrawalDuration = withdrawalValue * timeBetweenNotes
  return withdrawalDuration
}

export async function withdrawFunds(aztec, streamContractInstance, streamId, userAddress) {
  const streamObj = await streamContractInstance.methods.getStream(streamId).call();

  // Calculate what value of the stream is redeemable
  const {
    withdrawalValue,
    withdrawalDuration
  } = await calculateWithdrawal(streamObj, aztec)

  const { proof1, proof2 } = await buildProofs(aztec, streamContractInstance.options.address, streamObj, withdrawalValue);

  console.log("Withdrawing from stream:", streamId)
  console.log("Proofs:", proof1, proof2);
  const results = await streamContractInstance.methods.withdrawFromStream(
    streamId,
    proof1.encodeABI(),
    proof2.encodeABI(streamObj.tokenAddress),
    withdrawalDuration,
  ).send({ from: userAddress });
  console.log(results);
}