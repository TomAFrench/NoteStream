# Getting Started
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

# Terminology
## AZTEC Note

AZTEC notes can be thought of as tokens on Ethereum for which all balances are encrypted so only their owners can view them.
This is a gross oversimplification as these notes instead work on UTXO model (similar to Bitcoin) rather than then fungible balance model of ERC20 tokens which are all familiar with.

## ZkAsset

A zero knowledge representation of an ERC20 token. For example: DAI is represented by the zkDAI ZkAsset.

## Stream Note
The AZTEC note held by the NoteStream contract for a given stream. This note represents the total value of the stream at any time.

# How it works
## Where is my money held?

Each stream is made up of an AZTEC note locked on the NoteStream smart contract. The logic of this smart contract is such that only the stream's sender or receiver may interact with this note. 

## How can my streams be private if everything on Ethereum is public?

You're right that everything that happens on the Ethereum network is available for anyone to inspect, however NoteStream uses AZTEC Protocol which allows funds to be transferred as "notes" for which the value is encrypted. Everyone can see that a stream exists but nobody but you will know how much value it contains.

# Interacting with NoteStream
## Can I cancel streams?

Yes. Both the stream sender and recipient can cancel the stream at any time. This will send the appropriate fraction of the stream note's value to each party and then delete the stream.
Can I modify a stream in progress?
No. We're looking at the possibility to allow a stream's sender to modify a stream in progress in certain ways, e.g. extending the stream by topping up the stream note's value.

# Privacy

There are a number of privacy enhancing measures you can take using ZkAssets which are general rather than NoteStream-specific. Please see ["Using Aztec notes"](./using_aztec/README.md) for more information.

## NoteStream-specific public information

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


# Security
## Is NoteStream safe?
Currently there are a number of known security flaws which mean that NoteStream should not be used for any Mainnet funds (as such, there is no current Mainnet deployment.). I'm currently speaking with AZTEC about updates to their SDK in order to fix these.

## How do I know you can't steal my funds?

All Notestream contracts are open source and verified on Etherscan.