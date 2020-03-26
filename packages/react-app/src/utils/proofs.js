// import { note, DividendProof, JoinSplitProof } from 'aztec.js';
import secp256k1 from "@aztec/secp256k1";
import moment from 'moment';

import { getFraction, computeRemainderNoteValue } from './note';

export async function calculateWithdrawal(stream, aztec) {
  const {
    currentBalance, lastWithdrawTime, stopTime,
  } = stream;

  const streamZkNote = await aztec.zkNote(currentBalance);

  const remainingStreamLength = moment.duration(
    moment.unix(stopTime).diff(moment.unix(lastWithdrawTime))
    ).asSeconds()

    // withdraw up to now or to end of stream
  if (moment().isAfter(moment.unix(stopTime))){
    return {
      withdrawalValue: streamZkNote.value,
      withdrawalDuration: remainingStreamLength
    }
  }
  const maxWithdrawDuration = moment.duration(
    moment().startOf('second').diff(moment.unix(lastWithdrawTime))
    ).asSeconds();

  console.log("Fraction unwithdrawn stream elapsed", maxWithdrawDuration / remainingStreamLength)

  // Get withdrawal amount if notes were infinitely divisible
  // Floor this to get maximum possible withdrawal
  const idealWithdrawal = (maxWithdrawDuration / remainingStreamLength) * streamZkNote.value
  const withdrawalValue = Math.floor(idealWithdrawal)

  // Find time period for single note to be unlocked then multiply by withdrawal
  const timeBetweenNotes = remainingStreamLength / streamZkNote.value
  const withdrawalDuration = withdrawalValue * timeBetweenNotes

  console.log("constructed withdrawal")
  console.table({
    withdrawalValue,
    remainingBalance: streamZkNote.value,
    withdrawalDuration,
    remainingStreamLength
  })
  console.table({
    valueFraction: withdrawalValue / streamZkNote.value,
    durationFraction: withdrawalDuration / remainingStreamLength
  })


  return {
    withdrawalValue,
    withdrawalDuration
  }
}


export async function buildDividendProof(stream, streamContractAddress, withdrawalValue, aztec) {
  const { recipient, currentBalance } = stream;

  const payee = await aztec.user(recipient);

  const streamZkNote = await aztec.zkNote(currentBalance);
  const streamNote = await streamZkNote.export();

  const ratio = getFraction(withdrawalValue / streamZkNote.value)

  console.table(ratio)

  const withdrawPayment = computeRemainderNoteValue(
    streamZkNote.value,
    ratio.numerator,
    ratio.denominator,
  );

  const withdrawPaymentNote = await payee.createNote(withdrawPayment.expectedNoteValue, [payee.address]);
  const remainderNote = await payee.createNote(withdrawPayment.remainder);

  const proofData = new aztec.DividendProof(
    streamNote,
    remainderNote,
    withdrawPaymentNote,
    streamContractAddress,
    ratio.denominator,
    ratio.numerator,
  );

  return { proofData, inputNotes: [streamNote], outputNotes: [withdrawPaymentNote, remainderNote] };
}

export async function buildJoinSplitProof(
  stream,
  streamContractAddress,
  streamNote,
  withdrawPaymentNote,
  aztec,
) {
  const { sender, recipient } = stream;

  const payer = await aztec.user(sender);
  const payee = await aztec.user(recipient);
  const changeValue = Math.max(streamNote.k.toNumber() - withdrawPaymentNote.k.toNumber(), 0);

  const changeNote = await aztec.note.create(
    secp256k1.generateAccount().publicKey,
    changeValue,
    [{ address: payer.address, linkedPublicKey: payer.linkedPublicKey },
      { address: payee.address, linkedPublicKey: payee.linkedPublicKey }],
    streamContractAddress,
  );

  const proofData = new aztec.JoinSplitProof(
    [streamNote],
    [withdrawPaymentNote, changeNote],
    streamContractAddress,
    0, // No transfer from private to public assets or vice versa
    recipient,
  );

  return { proofData, inputNotes: [streamNote], outputNotes: [withdrawPaymentNote, changeNote] };
}
