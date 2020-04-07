import moment from 'moment';

import buildProofs from './proofs/withdrawalProof';
import { getFraction } from './note';
import { Address } from '../types/types';

function calculateSafeWithdrawal(
  currentBalance: number,
  remainingStreamLength: number,
  targettedWithdrawDuration: number,
): { withdrawalValue: number; withdrawalDuration: number } {
  // Find time period for single note to be unlocked then multiply by withdrawal
  const timeBetweenNotes = remainingStreamLength / currentBalance;

  // This is often a decimal so we want to get the smallest number of periods to generate a duration of an integer number of seconds
  const safeMultipleOfPeriods = getFraction(timeBetweenNotes).denominator;
  const safeTimeBetweenNotes = timeBetweenNotes * safeMultipleOfPeriods;

  // Calculate the number of complete safe periods which has passed to give number of withdrawable notes
  const withdrawalValue = Math.floor(targettedWithdrawDuration / safeTimeBetweenNotes) * safeMultipleOfPeriods;
  const withdrawalDuration = withdrawalValue * timeBetweenNotes;

  return {
    withdrawalValue,
    withdrawalDuration,
  };
}

export function calculateWithdrawal(
  noteValue: number,
  lastWithdrawTime: number,
  stopTime: number,
  bufferTime = 0,
): { withdrawalValue: number; withdrawalDuration: number } {
  if (noteValue === 0) {
    return {
      withdrawalValue: 0,
      withdrawalDuration: 0,
    };
  }

  const remainingStreamLength = moment.duration(moment.unix(stopTime).diff(moment.unix(lastWithdrawTime))).asSeconds();

  // withdraw up to now or to end of stream
  if (moment().isAfter(moment.unix(stopTime))) {
    return {
      withdrawalValue: noteValue,
      withdrawalDuration: remainingStreamLength,
    };
  }

  const targettedWithdrawDuration = moment
    .duration(moment().startOf('second').diff(moment.unix(lastWithdrawTime)))
    .add(bufferTime, 'seconds')
    .asSeconds();

  const { withdrawalValue, withdrawalDuration } = calculateSafeWithdrawal(
    noteValue,
    remainingStreamLength,
    targettedWithdrawDuration,
  );

  return {
    withdrawalValue,
    withdrawalDuration,
  };
}

export async function withdrawFunds(
  aztec: any,
  streamContractInstance: any,
  streamId: number,
  userAddress: Address,
): Promise<void> {
  const streamObj = await streamContractInstance.methods.getStream(streamId).call();

  const note = await aztec.zkNote(streamObj.currentBalance);

  // Calculate what value of the stream is redeemable
  const { withdrawalValue, withdrawalDuration } = calculateWithdrawal(
    note.value,
    streamObj.lastWithdrawTime,
    streamObj.stopTime,
  );

  const { proof1, proof2 }: { proof1: any; proof2: any } = await buildProofs(
    aztec,
    streamContractInstance.options.address,
    streamObj,
    withdrawalValue,
  );

  console.log('Withdrawing from stream:', streamId);
  console.log('Proofs:', proof1, proof2);
  const results = await streamContractInstance.methods
    .withdrawFromStream(streamId, proof1.encodeABI(), proof2.encodeABI(streamObj.tokenAddress), withdrawalDuration)
    .send({ from: userAddress });
  console.log(results);
}
