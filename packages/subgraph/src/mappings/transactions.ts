// import { ethereum } from '@graphprotocol/graph-ts';

// import { Transaction } from '../types/schema';

// export function addTransaction(
//   name: string,
//   event: ethereum.Event,
//   streamId: string,
// ): void {
//   const transaction = new Transaction(event.transaction.hash.toHex());
//   transaction.event = name;
//   transaction.block = event.block.number.toI32();
//   transaction.from = event.transaction.from;
//   transaction.stream = streamId;
//   transaction.timestamp = event.block.timestamp;
//   transaction.to = event.transaction.to;
//   transaction.save();
// }
