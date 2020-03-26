// import { note, DividendProof, JoinSplitProof } from 'aztec.js';
import secp256k1 from "@aztec/secp256k1";
import { getFraction, computeRemainderNoteValue } from './note';

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
