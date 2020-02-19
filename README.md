# AZTEC SDK Starter Kit

This repository helps developers deploy AZTEC to Ganache or a testnet and start building a dApp using [AZTEC SDK](https://docs.aztecprotocol.com).

## Get Started

### 1) Clone this repository

```sh
git clone https://github.com/AztecProtocol/sdk-starter-kit.git
cd sdk-starter-kit
yarn install
```

#### (If using Ganache..) Start Ganache and deploy contracts

_Skip this step if you won't be running demo on Ganache._

```sh
yarn start
```

### 2) Run demo

##### Styled dApp built with [create-react-app](https://github.com/facebook/create-react-app) and [guacamole-ui](https://github.com/AztecProtocol/guacamole-ui):

```sh
cd my-dapp
yarn install
yarn start
```

Open `http://localhost:5000` in your web3 enabled browser to view the demo dapp. Make sure you are on the Rinkeby network and have some test eth. 

The Dapp will allow you to convert ERC20 tokens into zkTokens, send these zkTokens around to other Ethereum addresses and withdraw from zkTokens back into ERC20 tokens. 

## Developer Guide

**Checkout the full SDK docs [here](https://docs.aztecprotocol.com/#/SDK/Getting%20started)**
