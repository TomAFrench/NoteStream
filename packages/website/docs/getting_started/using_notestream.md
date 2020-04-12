---
title: Using Notestream
---


## Trade ERC20 tokens for ZkAssets

Many of the tokens which you will want to stream are going to be ERC20 tokens such as DAI. These don't have the privacy features needed for NoteStream to work. Luckily we can wrap these tokens into an ZkAsset before we start streaming them.
To do this click the "Deposit ERC20 tokens for private assets" and enter the number of tokens you want to convert into ZkAssets.

## Deposit a note into a stream

You can create a stream by clicking the "Create a new stream" button and then following the shown instructions.
It is important to note that the stream recipient must have registered for an AZTEC address in order for then to be able to receive a stream. This is done automatically upon first visiting the NoteStream website.

## Withdrawing from a stream

The NoteStream app continually calculates the maximum amount which you can withdraw from the streams you are receiving. If you click the "withdraw" button next to the stream you want to withdraw from then a ZK proof will be generated to withdraw this amount from the stream note to your wallet.

## Converting back into ERC20 tokens

Once you have withdrawn your ZkAssets, you can convert them back into ERC20 tokens in much the same way as converting ERC20s into ZkAssets.
Of course, when you convert ZkAssets back into ERC20 tokens you lose the privacy properties given by AZTEC notes. There is also the possibility to leak information on the value of a stream if you immediately convert a withdrawal back into ERC20 tokens.