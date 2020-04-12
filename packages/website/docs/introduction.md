---
title: Introduction
---

If you are interested in how to use NoteStream to privately stream Ethereum tokens, then please look at our [Getting Started](/docs/getting_started/using_notestream) page.

## Github

The codebase for the NoteStream contracts and frontend are hosted publicly on [Github](https://github.com/TomAFrench/NoteStream). If you find any aspect of these docs unclear please open an issue there to ask for clarification.

## Networks

As NoteStream is in rapid development, it is currently only deployed on the Rinkeby test network. We hope to deploy to other testnets and subsequently the Ethereum Mainnet in due time.

## Gas Costs

We have not measured the gas costs associated with using NoteStream in detail, however we expect the majority of the cost to be from validating the ZK proof required for all transactions using AZTEC Protocol. Since EIP 1108, this takes in the range of 200,000-300,000 gas which corresponds to roughly 5-6x that of a standard ERC20 token transfer.