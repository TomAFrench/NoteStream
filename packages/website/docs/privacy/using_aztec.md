---
title: Using Aztec
---
# Issues associated with depositing/withdrawing ERC20 tokens

An important factor to keep in mind is that the process of depositing ERC20s into a ZkAsset doesn't immediately make them private, i.e. there will be a transaction visible on the blockchain in which a certain amount of DAI is converted into a number of zkDAI notes.
It's impossible to tell what each individual note is worth but the sum of them must equal the number of ERC20s deposited. In the worst case scenario, if all of those notes are then used in a single transaction (such as creation of a NoteStream stream) then it's obvious that the transaction value is equal to that of the ERC20 deposit.

This might sound like it means that it's impossible to have privacy using ZkAssets as anyone can trace your notes back to when they were deposited. However as people send ZkAssets to each other and notes are split and joined, a given deposit may be linked to a huge amount of notes spread over a vast number of people. We're very quickly at a point where we can see that 1000 people all together own the value from a given deposit but it's impossible to work out exactly who owns what fraction.

## Improving privacy of deposits

Even before this mixing behaviour there are steps you can take to improve your privacy. When depositing ERC20s into a ZkAsset its possible to create a number of notes which have zero value attached. This might sound pointless but it allows you then spend your entire deposit without letting anyone know how much you've spent.

An observer will only be able to tell that your stream is worth at most equal to your deposit but it could be anything less than that.
This behaviour is implemented automatically by the AZTEC sdk so you don't need to worry about it.

## Take aways

In order to improve the privacy of your transactions using ZkAssets it is best to

- Have a long history of transactions using this ZkAsset since your last deposit (idealling receiving ZkAsset funds from other people as well)
- Deposit an amount of ERC20 tokens in excess of what you are planning on immediately streaming.