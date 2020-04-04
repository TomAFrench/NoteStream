## NoteStream Subgraph

The Graph is a tool that helps dapps index their blockchain data so that users don't have to wait hours or more for the website to load.

This is our subgraph, a collection of schemas and event handlers that parse the data broadcast on the Ethereum blockchain to GraphQL form.

Our smart contracts can be found in the [NoteStream monorepo](https://github.com/TomAFrench/NoteStream).

## Contributing

Before you can build, create and deploy this subgraph, you have to execute the following commands in the terminal:

```bash
$ yarn
$ yarn prepare:mainnet
```

The first command installs all external dependencies, while the latter generates the `subgraph.yaml` file, which is
required by The Graph.

We use [Handlebars](https://github.com/wycats/handlebars.js/) to compile a [template subgraph](./subgraph.template.yaml) and add the parameters specific to each
network (Mainnet, Goerli, Kovan, Rinkeby, Ropsten). The network can be changed via the `NETWORK_NAME` environment
variable or directly by choosing a different "prepare" script. See [package.json](./package.json) for all options.

## Queries

### Querying All Streams

```graphql
{
  streams {
    id
    cancellation {
      recipientBalance
      timestamp
      txhash
    }
    deposit
    lastWithdrawTime
    recipient
    sender
    startTime
    stopTime
    timestamp
    txs {
      id
      block
      event
      from
      timestamp
      to
    }
    withdrawals {
      id
      duration
    }
    zkAsset {
      id
      name
      scalingFactor
      symbol
    }
  }
}
```

### Querying All Transactions

```graphql
{
  transactions {
    id
    block
    event
    from
    stream {
      id
    }
    timestamp
    to
  }
}
```
