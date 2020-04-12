---
title: NoteStream-specific issues
---

There are two times at which information about the stream is made visible

### Creating a stream

A stream is made up of the following information:
 - Sender address
 - Recipent address
 - Stream note hash
 - ZkAsset address
 - Start Time
 - Stop Time

An observer will then be able to see who is streaming to whom, what kind of token they are streaming and when this stream occurred. e.g.
> Alice streamed Bob an unknown amount of zkDAI represented by the AZTEC note with hash 0x1a3...cE1 from 9:00am until 5:00pm on 12/4/20

### Withdrawing/cancelling a stream

Withdrawal and cancellation transactions leak the same information. Here we discuss a withdrawal transaction as an example.

Each withdrawal transaction includes information on the fraction of the stream's duration which is being withdrawn. This is required such that the NoteStream contract can ensure that the withdrawal is valid.
An observer may then for example see that the recipient is withdrawing a value corresponding to a certain fraction of the remaining value on the stream note.

However it is important to note that without knowledge of the initial value of the stream note then it is impossible to determine the absolute value being withdrawn. e.g.

> Bob withdrew 50% of the value of the stream at 1:00pm on 12/4/20