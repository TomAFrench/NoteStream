# Quachtli

## Notice

A couple of people have starred Quachtli so I just want to know that there is some unpushed code in order to (I hope) fix withdrawals from the stream (We got written in between judging sessions with the help of the AZTEC team).

I'm going to merge this into what's on here pretty soon but if you're looking at Quachtli as an example on how to build on AZTEC, it's probably best to hold off for a week or so. I'm also in the process of writing a blog post which explains Quachtli operates which I'll post a link to.

## Get Started

### 1) Clone this repository

```sh
git clone https://github.com/TomAFrench/Quachtli.git
cd client
yarn install
```

#### Switch to network Rinkeby

```sh
yarn start
```


Open `http://localhost:3000` in your web3 enabled browser to view the demo dapp. Make sure you are on the Rinkeby network and have some test eth. 

The Dapp will allow you to convert ERC20 tokens into zkTokens, send these zkTokens streamed around to other Ethereum addresses and withdraw from zkTokens back into ERC20 tokens. 
