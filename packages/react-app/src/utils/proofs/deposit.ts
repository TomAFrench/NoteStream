import { Address, Proof } from '../../types/types';

function buildDepositProof(
  streamContractAddress: Address,
  asset: any,
  payerAddress: Address,
  payeeAddress: Address,
  sendAmount: number,
): Promise<{ proof: Proof; signature: string }> {
  return asset.send(
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
}

export default buildDepositProof;
