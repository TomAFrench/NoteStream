import buildDividendProof from './dividend';
import buildJoinSplitProof from './joinsplit';
import { Stream, Address, AztecSDK, Proof } from '../../types/types';

export default async function buildProofs(
  aztec: AztecSDK,
  streamContractAddress: Address,
  streamObj: Stream,
  withdrawalValue: number,
  changeNoteOwner: Address,
): Promise<{ dividendProof: Proof; joinSplitProof: Proof }> {
  const dividendProof = await buildDividendProof(
    streamObj,
    streamContractAddress,
    withdrawalValue,
    aztec,
  );

  const [streamNote] = dividendProof.inputNotes;
  const [withdrawalNote] = dividendProof.outputNotes;

  const joinSplitProof = await buildJoinSplitProof(
    streamObj,
    streamContractAddress,
    streamNote,
    withdrawalNote,
    changeNoteOwner,
    aztec,
  );

  return {
    dividendProof,
    joinSplitProof,
  };
}
