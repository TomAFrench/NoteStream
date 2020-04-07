import { buildDividendProof, buildJoinSplitProof } from './proofs';
import { Address, Stream } from '../../types/types';

export default async function buildProofs(
  aztec: any,
  streamContractAddress: Address,
  streamObj: Stream,
  withdrawalValue: number,
): Promise<{ proof1: any; proof2: any }> {
  const { proofData: proofData1, inputNotes, outputNotes } = await buildDividendProof(
    streamObj,
    streamContractAddress,
    withdrawalValue,
    aztec,
  );

  const { proofData: proofData2 } = await buildJoinSplitProof(
    streamObj,
    streamContractAddress,
    inputNotes[0],
    outputNotes[0],
    streamObj.sender,
    aztec,
  );

  return {
    proof1: proofData1,
    proof2: proofData2,
  };
}
