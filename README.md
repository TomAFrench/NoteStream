### Eth India Starter Kit

#####  **Install**

Clone this repository:

```sh
git clone https://github.com/AztecProtocol/eth-india-starter-kit.git
```

Inside both *`graph/`* and *`src/`* folders, run:

```sh
yarn install
```


#####  **Setup Development Environment**

In *`graph/`*, run:

```sh
yarn start
```

This script will do the following:
 - start Ganache
 - deploy contracts
 - run a Docker image, which contains graph-node
 - copy contracts abis and addresses
 - generate and deploy schemas to graph-node

In *`src/`*, run:

```sh
yarn start
```
