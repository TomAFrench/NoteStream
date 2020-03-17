import { note, DividendProof, JoinSplitProof } from 'aztec.js';
import secp256k1 from "@aztec/secp256k1";
import moment from 'moment';

import { getFraction, computeRemainderNoteValue } from './note';

export async function buildDividendProof(stream, zkNote, user) {
  const {
    recipient, currentBalance, lastWithdrawTime, stopTime,
  } = stream;

  const payee = await user(recipient);

  // Only allow withdrawals up to the stream's end time
  let ratio;
  if (moment().isAfter(moment.unix(stopTime))) {
    ratio = getFraction(1);
  } else {
    ratio = getFraction(
      moment().diff(moment.unix(lastWithdrawTime))
      / moment.unix(stopTime).diff(moment.unix(lastWithdrawTime)),
    );
  }

  const streamZkNote = await zkNote(currentBalance);
  const streamNote = await streamZkNote.export();
  const withdrawPayment = computeRemainderNoteValue(
    streamNote.k.toNumber(),
    ratio.numerator,
    ratio.denominator,
  );

  const withdrawPaymentNote = await note.create(
    payee.spendingPublicKey,
    withdrawPayment.expectedNoteValue,
  );
  
  // We use a disposable public key as only the note value is relevant
  const remainderNote = await note.create(
    secp256k1.generateAccount().publicKey,
    withdrawPayment.remainder,
  );

  console.log(remainderNote);
  console.log(streamNote, remainderNote, withdrawPaymentNote);
  const proofData = new DividendProof(
    streamNote,
    remainderNote,
    withdrawPaymentNote,
    payee.address,
    ratio.numerator,
    ratio.denominator,
  );

  return { proofData, inputNotes: [streamNote], outputNotes: [withdrawPaymentNote, remainderNote] };
}

export async function buildJoinSplitProof(
  stream,
  streamContractAddress,
  streamNote,
  withdrawPaymentNote,
  user,
) {
  const { sender, recipient } = stream;

  const payer = await user(sender);
  const payee = await user(recipient);
  const changeValue = Math.max(streamNote.k.toNumber() - withdrawPaymentNote.k.toNumber(), 0);

  const changeNote = await note.create(
    payer.spendingPublicKey,
    changeValue,
    [{ address: payer.address, linkedPublicKey: payer.linkedPublicKey },
      { address: payee.address, linkedPublicKey: payee.linkedPublicKey }],
    streamContractAddress,
  );

  const proofData = new JoinSplitProof(
    [streamNote],
    [withdrawPaymentNote, changeNote],
    streamContractAddress,
    0, // No transfer from private to public assets or vice versa
    recipient,
  );

  return { proofData, inputNotes: [streamNote], outputNotes: [withdrawPaymentNote, changeNote] };
}
