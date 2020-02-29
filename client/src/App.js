import React, { useState, useEffect } from "react";
import "./App.css";
import { getWeb3 } from "./utils";
import "./styles.css";
import {
  days as daysOption,
  hours as hoursOption,
  minutes as minutesOption
} from "./options";
const aztec = require("aztec.js");

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [contract, setContract] = useState(null);
  const [network, setNetwork] = useState(undefined);
  const [streamAmount, setStreamAmount] = useState(null);
  const [depositAmount, setDepositAmount] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [duration, setDuration] = useState(null);
  const [days, setDays] = useState(null);
  const [hours, setHours] = useState(null);
  const [minutes, setMinutes] = useState(null);
  const [route, setRoute] = useState("deposit");
  const [daiBalance, setDaiBalance] = useState(0);
  const [zkdaiBalance, setZkdaiBalance] = useState(0);

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
      console.log("aztec", aztec);
      console.log("windowaztec", window.aztec);
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

  useEffect(() => {
    console.log("minutes", minutes);
  }, [minutes]);

  return (
    <div className="App">
      <div style={{ width: 500, margin: "auto", marginTop: 150 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: "rgba(8, 8, 8, 0.44)",
            alignItems: "center",
            marginBottom: 20
          }}
        >
          <p
            onClick={() => setRoute("deposit")}
            style={{
              cursor: "pointer",
              margin: 0,
              padding: "5px 30px 5px 30px",
              backgroundColor: route == "deposit" ? "#0179C4" : null,
              borderRadius: 10,
              opacity: 0.85
            }}
          >
            Deposit
          </p>
          <p
            onClick={() => setRoute("create")}
            style={{
              cursor: "pointer",
              margin: 0,
              padding: "5px 30px 5px 30px",
              backgroundColor: route == "create" ? "#0179C4" : null,
              borderRadius: 10,
              opacity: 0.85
            }}
          >
            Create
          </p>
          <p
            onClick={() => setRoute("status")}
            style={{
              cursor: "pointer",
              margin: 0,
              padding: "5px 30px 5px 30px",
              backgroundColor: route == "status" ? "#0179C4" : null,
              borderRadius: 10,
              opacity: 0.85
            }}
          >
            Status
          </p>
        </div>

        {route == "create" ? (
          <>
            <div className="input-wrap">
              <label>How much do you want to stream?</label>
              <input
                type="text"
                onChange={val => setStreamAmount(val.target.value)}
                value={streamAmount}
                placeholder="0 Dai"
              />
            </div>
            <div className="input-wrap">
              <label>Who is the recipient?</label>
              <input
                type="text"
                onChange={val => setRecipient(val.target.value)}
                value={recipient}
                placeholder="0xe065D88f41615231e69026040C075d9F9F1bD00A"
              />
            </div>
            <p style={{ marginBottom: 10 }}>
              For how long do you want to stream?
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignSelf: "center"
              }}
            >
              <div className="input-wrap select-wrap">
                <label>Days</label>
                <select
                  value={days}
                  onChange={val => setDays(val.target.value)}
                >
                  {daysOption.map(option => (
                    <option key={option.id} value={option.title}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-wrap select-wrap">
                <label>Hours</label>
                <select
                  value={hours}
                  onChange={val => setHours(val.target.value)}
                >
                  {hoursOption.map(option => (
                    <option key={option.id} value={option.title}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-wrap select-wrap">
                <label>Minutes</label>
                <select
                  value={minutes}
                  onChange={val => setMinutes(val.target.value)}
                >
                  {minutesOption.map(option => (
                    <option key={option.id} value={option.title}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className="backbutton"
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 20
              }}
            >
              <button onClick={() => window.close()}>Create stream</button>
            </div>
          </>
        ) : null}
        {route == "deposit" ? (
          <>
            <p>
              Your Dai Balance: {daiBalance} Dai
            </p>
            <p style={{ marginBottom: 20 }}>
              Your zkDai Balance: {zkdaiBalance} ZkDai
            </p>
            <div className="input-wrap">
              <label>Enter deposit/Withdraw amount</label>
              <input
                type="text"
                onChange={val => setDepositAmount(val.target.value)}
                value={depositAmount}
                placeholder="0 Dai/zkDai"
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div
                className="backbutton"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 20
                }}
              >
                <button style={{ width: 200 }} onClick={() => window.close()}>
                  Deposit
                </button>
              </div>
              <div
                className="backbutton"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 20
                }}
              >
                <button style={{ width: 200 }} onClick={() => window.close()}>
                  Withdraw
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default App;
