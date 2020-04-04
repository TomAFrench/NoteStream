<!-- <p align="center"><img src="https://i.imgur.com/" width="280px"/></p> -->

<p align="center">NoteStream is the protocol for private real-time finance on Ethereum using AZTEC Protocol.

<p align="center">
  <a href="https://gitcoin.co/grants/638/quachtli-private-money-streaming">
    <img src="https://img.shields.io/badge/Gitcoin-Grant%20Active-brightgreen" alt="https://img.shields.io/badge/gitcoin%20grant-active-brightgreen">
  </a>
  <a href="https://docs.aztecprotocol.com/">
    <img src="https://img.shields.io/badge/built%20with-AZTEC%20Protocol-3677FF" alt="Built with AZTEC Protocol">
  </a>

  <a href="https://www.gnu.org/licenses/lgpl-3.0">
    <img src="https://img.shields.io/badge/License-LGPL%20v3-008033.svg" alt="License: LGPL v3">
  </a>
</p>

---

## What is NoteStream? :man_shrugging:

The simplest way to sum it up is "[Sablier](https://github.com/sablierhq/sablier) but with privacy (using AZTEC Protocol)".

For those of you not familiar with Sablier, this means that NoteStream is a private realtime finance platform which allows you to stream money over time using the Ethereum network.

This could be applied in many areas but one obvious usecase is that it allows a salary to be paid out every second, making payday a thing of the past. While this is possible using Sablier today, it has the unfortunate sideeffect of telling everyone *exactly* how much you earn as everything is public on the Ethereum blockchain. NoteStream solves this issue by making use of [AZTEC Protocol](https://www.aztecprotocol.com) to encrypt the value of your salary to keep it private while ensuring that you can always withdraw the money you have earned so far.

NoteStream was started at the [2020 ETHLondon Hackathon](https://ethlondon.com/) (under the name Quachtli) by [Tom French](https://github.com/TomAFrench), [Moe Adham](https://github.com/moeadham), [Evgeni Shavkunov](https://github.com/eshavkun) and [György Tamás Klöczl](https://github.com/glodzl). NoteStream was one of six finalists and was chosen as "Best use of AZTEC Protocol".

**Notice:** I learned a lot about how to build on top of Aztec Protocol while creating NoteStream. As AZTEC is still very new, there isn't a lot of documentation out there, to help with this I'm in the process of writing a blog post which explains NoteStream how operates. I'll post a link here when I'm done.

## Packages :package:

NoteStream is maintained as a monorepo with multiple sub packages. Please find a comprehensive list below.

### Javascript Packages

| Package                                                 | Version                                                                                                                                 | Description                                               |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
|                                                         |
| [`@notestream/contract-artifacts`](/packages/react-app) | [![npm](https://img.shields.io/npm/v/@notestream/contract-artifacts.svg)](https://www.npmjs.com/package/@notestream/contract-artifacts) | Contract artifacts and addresses for NoteStream contracts |

### Solidity Packages

| Package                                       | Version                                                                                                               | Description                             |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| [`@notestream/contracts`](/packages/contract) | [![npm](https://img.shields.io/npm/v/@notestream/contracts.svg)](https://www.npmjs.com/package/@notestream/contracts) | AZTEC note streaming protocol contracts |


### Unpublished Packages

| Package                                        | Description                                                             |
| ---------------------------------------------- | ----------------------------------------------------------------------- |
| [`@notestream/react-app`](/packages/react-app) | Example dapp frontend                                                   |
| [`@notestream/subgraph`](/packages/subgraph)   | Subgraph tracking NoteStream stream creations/withdrawals/cancellations |
| [`@notestream/dev-utils`](/packages/dev-utils) | Dev utils to be shared across NoteStream projects and packages          |


## Contracts :memo:

Find the addresses for our smart contracts below. They have not been audited in any way so I don't recommend putting real money into them.

<!-- ### Ethereum Mainnet

| Name          | Description            | Address                           |
| ------------- | ---------------------- | --------------------------------- |
| AztecStreamer | Money streaming engine | [](https://etherscan.io/address/) |

-->




### Ethereum Testnets

NoteStream is deployed on the Rinkeby testnet.


| Name          | Description            | Address                                                                                                                       |
| ------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| AztecStreamer | Money streaming engine | [0x455cD682E2411C0cF9a8c91c4498732B8Dd5B751](https://rinkeby.etherscan.io/address/0x455cD682E2411C0cF9a8c91c4498732B8Dd5B751) |

## Usage :hammer_and_pick:

To check out and compile the smart contracts, install any dependencies and then head to each individual package as presented above. For example, these are the instructions for `@notestream/contracts`:

```bash
$ yarn install
$ cd packages/contracts
$ yarn compile
$ yarn deploy --network rinkeby
```

## Contact us :envelope:

I'd love to hear from anybody wanting to build on top of NoteStream or building something similar. If you have any questions or just want to show off what you've made, ping me on [Twitter](https://twitter.com/tomfrench_eth).

## Contributing :raising_hand_woman:

We use [Yarn](https://yarnpkg.com/) as a dependency manager and [Buidler](https://buidler.dev/)
as a development environment for compiling, testing, and deploying our contracts. The contracts were written in [Solidity](https://github.com/ethereum/solidity).

### Requirements

- yarn >= 1.22.4
- solidity 0.5.11

### Pre Requisites

Make sure you are using Yarn >=1.22.4

To clone this repo and install dependencies run:

```bash
$ git clone https://github.com/TomAFrench/NoteStream.git && cd NoteStream
$ yarn install
```
#### Deploy contracts to Rinkeby

```bash
$ yarn contracts:deploy --network rinkeby
```

#### Start frontend

Start the frontend with the command

```sh
yarn react-app:start
```

The frontend will allow you to convert ERC20 tokens into zkTokens, send these zkTokens streamed around to other Ethereum addresses and withdraw from zkTokens back into ERC20 tokens.
