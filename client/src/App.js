import React, { useState, useEffect } from "react";
import "./App.css";
import { getWeb3 } from "./utils";
import "./styles.css";

import TopBar from "./components/TopBar";
import Create from "./views/create";
import Deposit from "./views/deposit";

import { Route, BrowserRouter as Router, Redirect } from "react-router-dom";

const zkAssetAddress = "0x54Fac13e652702a733464bbcB0Fb403F1c057E1b";
const streamContractAddress = "0x1f52693c618d093cEF45Bc59100C9086B3108a61";
const streamContract = require("./streamContract.js");

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(undefined);
  const [zkAsset, setZkAsset] = useState();
  const [loaded, setLoaded] = useState(false);
  const [daiBalance, setDaiBalance] = useState(0);
  const [zkdaiBalance, setZkdaiBalance] = useState(0);
  const [streamContractInstance, setStreamContractInstance] = useState(null);

  useEffect(() => {
    const init = async () => {
      const _web3 = await getWeb3();
      const _accounts = await _web3.eth.getAccounts();
      const _network = await _web3.eth.net.getId();
      setNetwork(_network);

      console.log("web3", _web3);
      console.log("windowaztec", window.aztec);
      setWeb3(_web3);

      setAccount(_accounts[0]);
      console.log("accounts", _accounts);

      const apiKey = "test1234";
      const result = await window.aztec.enable({
        // web3Provider: _web3.currentProvider, // change this value to use a different web3 provider
        // contractAddresses: {
        // ACE: '0x5B59B26bdBBA8e32C1C6DD107e3862b5D538fa48', // the address of the ace contract on the local network
        // AccountRegistry: '0x66db0e20a9d619ee3dfa3819513ab8bed1b21a87' // the address of the aztec account registry contract on the local network.
        // },
        apiKey: "7FJF5YK-WV1M90Y-G25V2MW-FG2ZMDV" // API key for use with GSN for free txs.
      });

      // Fetch the zkAsset
      const _asset = await window.aztec.zkAsset(zkAssetAddress);
      setZkAsset(_asset);
      console.log("ASSET:", _asset);
      getBalance(_asset);
      setLoaded(true);

      const _streamContractInstance = new _web3.eth.Contract(
        streamContract.abi,
        streamContractAddress
      );
      setStreamContractInstance(_streamContractInstance);
    };
    init();
  }, []);

  useEffect(() => {
    if (streamContractInstance) {
      //addListeners();
    }
  }, [streamContractInstance]);

  const addListeners = () => {
    /*  streamContractInstance
      .getPastEvents("GameFinished", { fromBlock: 0, toBlock: "latest" })
      .then(function(events) {
        console.log("PastGamesFinished", events);
        setPastgames(events.reverse());
      });
      */
  };

  async function getBalance(asset) {
    const publicBalance = await asset.balanceOfLinkedToken(account);
    const zkBalance = await asset.balance();
    setDaiBalance(publicBalance.toString(10));
    setZkdaiBalance(zkBalance);
  }

  return (
    <div className="App">
      <div style={{ width: 500, margin: "auto", marginTop: 150 }}>
        <Router>
          <TopBar />

          <Route
            path="/deposit"
            render={() => (
              <Deposit
                userAddress={account}
                zkAsset={zkAsset}
                streamContractAddress={streamContractAddress}
                daiBalance={daiBalance}
                zkdaiBalance={zkdaiBalance}
              />
            )}
          />

          <Route
            path="/create"
            render={() => (
              <Create
                web3={web3}
                zkAsset={zkAsset}
                streamContractAddress={streamContractAddress}
                streamContractInstance={streamContractInstance}
                zkdaiBalance={zkdaiBalance}
              />
            )}
          />
          <Redirect path="/" to="/deposit" />
        </Router>
      </div>
    </div>
  );
};

export default App;
