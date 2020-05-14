// import { note, DividendProof, JoinSplitProof } from 'aztec.js';
import secp256k1 from '@aztec/secp256k1';
import { getFraction, computeRemainderNoteValue } from '../note';
import { Stream, Address, Fraction, Dividend, Note } from '../../types/types';

export async function buildDividendProof(
  stream: Stream,
  streamContractAddress: any,
  withdrawalValue: number,
  aztec: any,
): Promise<any> {
  const { recipient, noteHash } = stream;

  const payee = await aztec.user(recipient);

  const streamZkNote = await aztec.zkNote(noteHash);
  const streamNote = await streamZkNote.export();

  const ratio: Fraction = getFraction(withdrawalValue / streamZkNote.value);

  console.table(ratio);

  const withdrawPayment: Dividend = computeRemainderNoteValue(
    streamZkNote.value,
    ratio.numerator,
    ratio.denominator,
  );

  const withdrawPaymentNote = await payee.createNote(withdrawPayment.target, [
    payee.address,
  ]);
  const remainderNote = await payee.createNote(withdrawPayment.residual);

  // Note: The current dividend proof implementation takes the residual note as an argument before the target note
  // It also has swapped the meanings of z_a and z_b relative to the documentation.
  // This results in the slightly unintuitive argument ordering below
  // see https://github.com/AztecProtocol/AZTEC/blob/develop/packages/aztec.js/src/proof/proofs/UTILITY/epoch0/dividend/index.js
  return new aztec.DividendProof(
    streamNote,
    remainderNote,
    withdrawPaymentNote,
    streamContractAddress,
    ratio.denominator,
    ratio.numerator,
  );
}

export async function buildJoinSplitProof(
  stream: Stream,
  streamContractAddress: Address,
  streamNote: Note,
  withdrawPaymentNote: Note,
  changeNoteOwner: Address,
  aztec: any,
): Promise<any> {
  const { sender, recipient } = stream;

  const payer = await aztec.user(sender);
  const payee = await aztec.user(recipient);
  const changeValue = Math.max(
    streamNote.k.toNumber() - withdrawPaymentNote.k.toNumber(),
    0,
  );

  const changeNote = await aztec.note.create(
    secp256k1.generateAccount().publicKey,
    changeValue,
    [
      { address: payer.address, linkedPublicKey: payer.linkedPublicKey },
      { address: payee.address, linkedPublicKey: payee.linkedPublicKey },
    ],
    changeNoteOwner,
  );

  return new aztec.JoinSplitProof(
    [streamNote],
    [withdrawPaymentNote, changeNote],
    streamContractAddress,
    0, // No transfer from private to public assets or vice versa
    recipient,
  );
}
