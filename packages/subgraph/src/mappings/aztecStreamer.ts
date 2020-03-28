import { Cancellation, Stream, Withdrawal } from "../types/schema";
import {
  CreateStream as CreateStreamEvent,
  WithdrawFromStream as WithdrawFromStreamEvent,
  CancelStream as CancelStreamEvent,
} from "../types/AztecStreamer/AztecStreamer";
import { addZkAsset } from "./zkAssets";
import { addTransaction } from "./transactions";

export function handleCreateStream(event: CreateStreamEvent): void {
  /* Create the stream object */
  let streamId = event.params.streamId.toString();
  let stream = new Stream(streamId);
  stream.lastWithdrawTime = event.params.startTime;
  stream.recipient = event.params.recipient;
  stream.sender = event.params.sender;
  stream.startTime = event.params.startTime;
  stream.stopTime = event.params.stopTime;
  stream.timestamp = event.block.timestamp;
  stream.zkAsset = event.params.zkAsset.toHex();
  stream.save();

  /* Create adjacent but important objects */
  addTransaction("CreateStream", event, streamId);
  addZkAsset(event.params.zkAsset.toHex());
}

export function handleWithdrawFromStream(event: WithdrawFromStreamEvent): void {
  let streamId = event.params.streamId.toString();
  let stream = Stream.load(streamId);
  if (stream == null) {
    return;
  }

  let withdrawal = new Withdrawal(event.transaction.hash.toHex());
  withdrawal.stream = streamId;
  withdrawal.duration = event.params.withdrawDuration;
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.zkAsset = stream.zkAsset;
  withdrawal.save();

  addTransaction("WithdrawFromStream", event, streamId);
}

export function handleCancelStream(event: CancelStreamEvent): void {
  let streamId = event.params.streamId.toString();
  let stream = Stream.load(streamId);
  if (stream == null) {
    return;
  }

  let cancellation = new Cancellation(streamId);

  cancellation.duration = event.params.cancelDuration;
  cancellation.timestamp = event.block.timestamp;
  cancellation.txhash = event.transaction.hash.toHex();
  cancellation.zkAsset = stream.zkAsset;
  cancellation.save();

  stream.cancellation = streamId;
  stream.save();

  addTransaction("CancelStream", event, streamId);
}
