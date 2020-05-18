import { buildDividendProof, buildJoinSplitProof } from './proofs';
import { Address, Stream } from '../../types/types';

export default async function buildProofs(
  aztec: any,
  streamContractAddress: Address,
  streamObj: Stream,
  withdrawalValue: number,
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
    streamContractAddress,
    aztec,
  );

  return {
    dividendProof,
    joinSplitProof,
  };
}
