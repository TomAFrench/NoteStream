import { buildDividendProof, buildJoinSplitProof } from './proofs';


export async function buildProofs(aztec, streamContractAddress, streamObj, withdrawalValue) {
  const {
    proofData: proofData1,
    inputNotes, outputNotes,
  } = await buildDividendProof(streamObj, streamContractAddress, withdrawalValue, aztec);

  const { proofData: proofData2 } = await buildJoinSplitProof(
    streamObj,
    streamContractAddress,
    inputNotes[0],
    outputNotes[0],
    aztec,
  );

  return {
    proof1: proofData1,
    proof2: proofData2,
  };
}