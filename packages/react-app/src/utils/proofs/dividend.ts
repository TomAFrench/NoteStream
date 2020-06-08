import { getFraction, computeRemainderNoteValue } from '../note';
import {
  Stream,
  Address,
  Fraction,
  Dividend,
  AztecSDK,
} from '../../types/types';

const buildDividendProof = async (
  stream: Stream,
  streamContractAddress: Address,
  withdrawalValue: number,
  aztec: AztecSDK,
): Promise<any> => {
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
};

export default buildDividendProof;
