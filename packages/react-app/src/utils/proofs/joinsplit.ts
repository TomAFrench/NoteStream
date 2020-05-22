import secp256k1 from '@aztec/secp256k1';
import { Stream, Address, Note } from '../../types/types';

const buildJoinSplitProof = async (
  stream: Stream,
  streamContractAddress: Address,
  streamNote: Note,
  withdrawPaymentNote: Note,
  changeNoteOwner: Address,
  aztec: any,
): Promise<any> => {
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
};

export default buildJoinSplitProof;
