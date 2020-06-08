import { Cancellation, Stream, Withdrawal } from '../types/schema';
import {
  CreateStream as CreateStreamEvent,
  WithdrawFromStream as WithdrawFromStreamEvent,
  CancelStream as CancelStreamEvent,
} from '../types/NoteStream/NoteStream';
import { addZkAsset } from './zkAssets';

export function handleCreateStream(event: CreateStreamEvent): void {
  /* Create adjacent but important object */
  addZkAsset(event.params.zkAsset.toHex());
  /* Create the stream object */
  const streamId = event.params.streamId.toString();
  const stream = new Stream(streamId);
  stream.lastWithdrawTime = event.params.startTime;
  stream.noteHash = event.params.noteHash;
  stream.recipient = event.params.recipient;
  stream.sender = event.params.sender;
  stream.startTime = event.params.startTime;
  stream.stopTime = event.params.stopTime;
  stream.timestamp = event.block.timestamp;
  stream.zkAsset = event.params.zkAsset.toHex();
  stream.save();
}

export function handleWithdrawFromStream(event: WithdrawFromStreamEvent): void {
  const streamId = event.params.streamId.toString();
  const stream = Stream.load(streamId);
  if (stream == null) {
    return;
  }
  stream.noteHash = event.params.noteHash;
  stream.lastWithdrawTime = stream.lastWithdrawTime.plus(
    event.params.withdrawDuration,
  );
  stream.save();

  const withdrawal = new Withdrawal(event.transaction.hash.toHex());
  withdrawal.block = event.block.number.toI32();
  withdrawal.event = 'WithdrawFromStream';
  withdrawal.from = event.transaction.from;
  withdrawal.stream = streamId;
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.to = event.transaction.to;
  withdrawal.duration = event.params.withdrawDuration;
  withdrawal.save();
}

export function handleCancelStream(event: CancelStreamEvent): void {
  const streamId = event.params.streamId.toString();
  const stream = Stream.load(streamId);
  if (stream == null) {
    return;
  }

  const cancellation = new Cancellation(event.transaction.hash.toHex());

  cancellation.block = event.block.number.toI32();
  cancellation.event = 'CancelStream';
  cancellation.from = event.transaction.from;
  cancellation.stream = streamId;
  cancellation.timestamp = event.block.timestamp;
  cancellation.to = event.transaction.to;
  cancellation.duration = event.params.cancelDuration;
  cancellation.save();

  stream.cancellation = event.transaction.hash.toHex();
  stream.save();
}
