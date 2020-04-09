import { Address } from '../../types/types';

async function buildDepositProof(
  streamContractAddress: Address,
  asset: any,
  payerAddress: Address,
  payeeAddress: Address,
  sendAmount: number,
): Promise<object> {
  const { proof } = await asset.send(
    [
      {
        to: streamContractAddress,
        amount: sendAmount,
        aztecAccountNotRequired: true, // contract can't have an AZTEC account
        numberOfOutputNotes: 1, // only want to track a single note per stream
      },
    ],
    {
      userAccess: [payerAddress, payeeAddress], // Give view access to sender and recipient
      returnProof: true,
      sender: streamContractAddress, // proof is being submitted by contract rather than directly
    },
  );

  console.log(proof);
  return proof;
}

export default buildDepositProof;
