import React, { useState, useEffect } from "react";
import "./App.css";
import { getWeb3 } from "./utils";
const aztec = require("aztec.js");

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [contract, setContract] = useState(null);
  const [network, setNetwork] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      const _web3 = await getWeb3();
      const accounts = await _web3.eth.getAccounts();
      let _network = await _web3.eth.net.getId();
      setNetwork(_network);

      /*const _contract = new web3.eth.Contract(
       Multisig.abi,
        deployedNetwork && deployedNetwork.address, 
      ); */
      console.log("web3", _web3);
      setWeb3(_web3);
      setAccounts(accounts);
      //setContract(_contract);
    };
    init();
    /*
    window.ethereum.on("accountsChanged", accounts => {
      setAccounts(accounts);
    });
    */
  }, []);

  return (
    <div className="App">
      <p>Hello</p>
    </div>
  );
}

export default App;
