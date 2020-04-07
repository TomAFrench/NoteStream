import { EthereumEvent } from "@graphprotocol/graph-ts";

import { Transaction } from "../types/schema";

export default function addTransaction(
  name: string,
  event: EthereumEvent,
  streamId: string
): void {
  const transaction = new Transaction(event.transaction.hash.toHex());
  transaction.event = name;
  transaction.block = event.block.number.toI32();
  transaction.from = event.transaction.from;
  transaction.stream = streamId;
  transaction.timestamp = event.block.timestamp;
  transaction.to = event.transaction.to;
  transaction.save();
}
