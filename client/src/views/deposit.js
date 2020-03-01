import React, { useState, useEffect } from "react";
import "../App.css";
import "../styles.css";

const Deposit = ({ userAddress, zkAsset, zkdaiBalance, daiBalance }) => {
  const [amount, setAmount] = useState(null);

  useEffect(() => {
    if (zkAsset) {
      //getBalance(zkAsset);
    }
  });

  async function depositZkToken(depositAmount) {
    console.log("deposit", depositAmount);
    await zkAsset.deposit([
      { to: userAddress, amount: parseInt(depositAmount) }
    ]);
    //getBalance(zkAsset);
    setAmount(0);
  }

  async function withdrawZkToken(withdrawAmount) {
    console.log("withdraw", withdrawAmount);
    await zkAsset.withdraw(parseInt(withdrawAmount));
    // getBalance(zkAsset);
    setAmount(0);
  }

  return (
    <div>
      <p>Your Dai Balance: {daiBalance} Dai</p>
      <p style={{ marginBottom: 20 }}>
        Your zkDai Balance: {zkdaiBalance} ZkDai
      </p>
      <div className="input-wrap">
        <label>Enter deposit/Withdraw amount</label>
        <input
          type="text"
          onChange={val => setAmount(val.target.value)}
          value={amount}
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
          <button
            style={{ width: 200 }}
            onClick={() => depositZkToken(parseInt(amount))}
          >
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
          <button
            style={{ width: 200 }}
            onClick={() => withdrawZkToken(parseInt(amount))}
          >
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
