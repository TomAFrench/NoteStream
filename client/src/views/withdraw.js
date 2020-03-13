import React, { useState } from "react";
import "../styles.css";
import {buildDividendProof, buildJoinSplitProof} from '../utils/proofs'
import moment from "moment";


const Withdraw = ({
  aztec,
  userAddress,
  streamContractInstance,
  zkdaiBalance
}) => {
  const [stream, setStream] = useState(null);

  async function withdrawFunds(streamId) {

    const streamObj = await streamContractInstance.methods.getStream(streamId).call()

    const { proof1, proof2 } = await buildProofs(streamObj)

    // withdraw up to now or to end of stream
    const now = moment.min(moment(), moment.unix(streamObj.stopTime))
    const lastWithdrawal = moment.unix(streamObj.startTime)
    const durationToWithdraw = moment.duration(now.diff(lastWithdrawal)).as("seconds")

    console.log(now, lastWithdrawal, durationToWithdraw)
    console.log(streamId, proof1, proof2, durationToWithdraw)
    const results = await streamContractInstance.methods.withdrawFromStream(
      streamId,
      proof1.encodeABI(),
      proof2.encodeABI(),
      durationToWithdraw
    ).send({from: userAddress})
    console.log(results)
  }

  async function buildProofs(streamObj) {
  
    const { proofData: proofData1, inputNotes, outputNotes } = await buildDividendProof(streamObj, streamContractInstance.options.address, aztec.zkNote, aztec.user)
    const { proofData: proofData2 } = await buildJoinSplitProof(
      streamObj,
      streamContractInstance.options.address,
      inputNotes[0],
      outputNotes[0],
      aztec.zkNote,
      aztec.user
    )

    console.log("DividendProof", proofData1)
    console.log("JoinSplitProof", proofData2)
  
    return {
      proof1: proofData1,
      proof2: proofData2,
    }
  }

  return (
    <div>
      <p style={{ marginBottom: 20 }}>
        Your zkDai Balance: {zkdaiBalance} ZkDai
      </p>
      <div className="input-wrap">
        <label>Enter stream id</label>
        <input
          type="text"
          onChange={e => setStream(e.target.value)}
          value={stream}
          placeholder="Stream ID"
        />
      </div>
      {/* <div className="input-wrap">
        <label>Enter withdraw amount</label>
        <input
          type="text"
          onChange={val => ())}
          value={amount}
          placeholder="0 Dai/zkDai"
        />
      </div> */}
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
          onClick={() => withdrawFunds(stream)}
        >
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default Withdraw;
