import buildDividendProof from './dividend';
import buildJoinSplitProof from './joinsplit';
import { Stream, Address } from '../../types/types';

export default async function buildProofs(
  aztec: any,
  streamContractAddress: Address,
  streamObj: Stream,
  withdrawalValue: number,
  changeNoteOwner: Address,
): Promise<{ dividendProof: any; joinSplitProof: any }> {
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
