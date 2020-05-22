import { Contract } from 'ethers';
import { Address, Hash, Note } from '../../types/types';

function initialiseStream(
  streamContractInstance: Contract,
  payeeAddress: Address,
  noteForStreamContract: Note,
  zkAssetAddress: Address,
  startTime: number,
  endTime: number,
): number {
  return streamContractInstance
    .createStream(
      payeeAddress,
      noteForStreamContract.noteHash,
      zkAssetAddress,
      startTime,
      endTime,
    )
    .then((err: any, txHash: Hash) => {
      if (err) {
        console.log(err);
        return null;
      }
      console.log('transaction hash', txHash);
      return txHash;
    });
}

async function fundStream(
  streamContractAddress: Address,
  payerAddress: Address,
  payeeAddress: Address,
  sendAmount: number,
  asset: any,
): Promise<Note> {
  const { outputNotes } = await asset.send(
    [
      {
        to: streamContractAddress,
        amount: sendAmount,
        aztecAccountNotRequired: true,
        numberOfOutputNotes: 1, // contract has one
      },
    ],
    { userAccess: [payerAddress, payeeAddress] }, // Give view access to sender and recipient
  );
  const noteForStreamContract = outputNotes[0];
  console.log('noteForStreamContract', noteForStreamContract);
  return noteForStreamContract;
}

async function createStream(
  sendAmount: number,
  streamContractInstance: Contract,
  payerAddress: Address,
  payeeAddress: Address,
  zkAsset: any,
  startTime: number,
  endTime: number,
): Promise<number> {
  const streamNote = await fundStream(
    streamContractInstance.address,
    payerAddress,
    payeeAddress,
    sendAmount,
    zkAsset,
  );
  return initialiseStream(
    streamContractInstance,
    payeeAddress,
    streamNote,
    zkAsset.address,
    startTime,
    endTime,
  );
}

export default createStream;
