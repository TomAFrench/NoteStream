import { note, DividendProof, JoinSplitProof } from 'aztec.js'
import {getFraction, computeRemainderNoteValue} from '../utils/note'

export async function buildDividendProof(stream, streamContractAddress, zkNote, user) {
  const {sender, recipient, currentBalance, lastWithdrawTime, endTime } = stream

  const payer = await user(sender)
  const payee = await user(recipient)

  // Only allow withdrawals up to the stream's end time
  let ratio
  if (Date.now() > endTime) {
    ratio = getFraction(1)
  } else {
    ratio = getFraction((Date.now() - lastWithdrawTime) / (endTime - lastWithdrawTime));
  }
  
  const streamZkNote = await zkNote(currentBalance)
  const streamNote = await streamZkNote.export()
  console.log(streamNote)
  const withdrawPayment = computeRemainderNoteValue(streamNote.k.toNumber(), ratio.denominator, ratio.numerator);
  
  const remainderNote = await note.create(
    payer.spendingPublicKey,
    withdrawPayment.remainder,
    [{address: payer.address, linkedPublicKey: payer.linkedPublicKey}]
  );
  const withdrawPaymentNote = await note.create(
    payee.spendingPublicKey,
    withdrawPayment.expectedNoteValue, 
    [{address: payee.address, linkedPublicKey: payee.linkedPublicKey}]
  );


  console.log(    streamNote,
    withdrawPaymentNote,
    remainderNote,
    streamContractAddress,
    ratio.numerator,
    ratio.denominator, )
  const proofData = new DividendProof(
    streamNote,
    withdrawPaymentNote,
    remainderNote,
    streamContractAddress,
    ratio.numerator,
    ratio.denominator, 
  );

  return {proofData, inputNotes: [streamNote], outputNotes: [withdrawPaymentNote, remainderNote]}
}

export async function buildJoinSplitProof(stream, streamContractAddress, streamNote, withdrawPaymentNote, zkNote, user) {
  const {sender, recipient} = stream

  const payer = await user(sender)
  const payee = await user(recipient)
  const changeValue = Math.max(streamNote.k.toNumber() - withdrawPaymentNote.k.toNumber(), 0)

  const changeNote = await note.create(
    payer.spendingPublicKey,
    changeValue,
    [{address: payer.address, linkedPublicKey: payer.linkedPublicKey},
     {address: payee.address, linkedPublicKey: payee.linkedPublicKey}],
     streamContractAddress
  );

  const proofData = new JoinSplitProof(
    [streamNote],
    [withdrawPaymentNote, changeNote],
    streamContractAddress,
    0, // No transfer from private to public assets or vice versa
    recipient
  );

  return {proofData, inputNotes: [streamNote], outputNotes: [withdrawPaymentNote, changeNote]}
}