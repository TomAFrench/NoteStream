import React, { useState, useEffect } from 'react'

import _ from 'lodash'
import '../App.css'
import '../styles.css'

const { JoinSplitProof, DividendProof, note } = require('aztec.js')
const secp256k1 = require('@aztec/secp256k1')

const streamContract = require("../streamContract.js");

const Status = ({userAddress, web3, aztec, zkAsset, streamContractAddress}) => {
  // const [withdrawAmount, setWithdrawAmount] = useState(null)
  // const [notes, setNotes] = useState(null)

  async function buildProofs(currentTime) {
      // if currentBalance is 0 we have to change this as the ratio is infinite

      if (!web3){
        return false
      }

      const streamContractInstance = new web3.eth.Contract(
        streamContract.abi,
        streamContractAddress
      );

      const events = await streamContractInstance.getPastEvents("allEvents", {filter: {recipient: userAddress}})
      console.log(events)
      const streamId = _.last(events) && _.last(events).returnValues.streamId;


      const computeRemainderNoteValue = (value, za, zb) => {
        const expectedNoteValue = Math.floor(value * (za / zb));
        const remainder = value * za - expectedNoteValue * zb;
      
        return {
          remainder,
          expectedNoteValue,
        };
      };

      function getFraction(value, maxdenom) {
        const best = { numerator: 1, denominator: 1, err: Math.abs(value - 1) };
        if (!maxdenom) maxdenom = 10000;
        for (let denominator = 1; best.err > 0 && denominator <= maxdenom; denominator++) {
          const numerator = Math.round(value * denominator);
          const err = Math.abs(value - numerator / denominator);
          if (err >= best.err) continue;
          best.numerator = numerator;
          best.denominator = denominator;
          best.err = err;
        }
        return best;
      }

      const streamObj = await streamContractInstance.methods.getStream(streamId).call()
      const {sender, recipient, currentBalance, lastWithdrawTime, endTime } = streamObj

      const payer = await aztec.user(sender)
      const payee = await aztec.user(recipient)
      
      const notionalNote = aztec.zkNote(currentBalance)
      const ratio1 = getFraction((currentTime - lastWithdrawTime) / (endTime - lastWithdrawTime) * 10000);
      
      const withdrawPayment = computeRemainderNoteValue(notionalNote.k.toNumber(), ratio1.denominator, ratio1.numerator);
      const remainderNote2 = await aztec.note.create(payer.spendingPublicKey, withdrawPayment.remainder, [{address: payer.address, linkedPublicKey: payer.linkedPublicKey}]);
      const withdrawPaymentNote = await aztec.note.create(payee.spendingPublicKey, withdrawPayment.expectedNoteValue, [{address: payee.address, linkedPublicKey: payee.linkedPublicKey}]);

      const { proofData: proofData1 } = aztec.proof.dividendComputation.encodeDividendComputationTransaction({
        inputNotes: [notionalNote],
        outputNotes: [withdrawPaymentNote, remainderNote2],
        za: ratio1.numerator,
        zb: ratio1.denominator,
        senderAddress: streamContractAddress,
      });

      let changeValue = notionalNote.k.toNumber() - withdrawPayment.expectedNoteValue;
      changeValue = changeValue < 0 ? 0 : changeValue;


      const changeNote = await aztec.note.create(payer.spendingPublicKey, changeValue, [{address: payer.address, linkedPublicKey: payer.linkedPublicKey}], streamContractAddress);
      const { proofData: proofData2 } = aztec.proof.joinSplit.encodeJoinSplitTransaction({
        inputNotes: [notionalNote],
        outputNotes: [withdrawPaymentNote, changeNote],
        inputNoteOwners: [],
        senderAddress: streamContractAddress,
        publicOwner: recipient,
        kPublic: 0,
      });

      return {
        proofs: [proofData1, proofData2],
        notes: {
          changeNote,
          withdrawPaymentNote,
        },
      };
  } 

  return (
    <div>
      <div className="input-wrap">
        <label>Enter deposit/Withdraw amount</label>
        <input
          type="text"
          // onChange={val => setAmount(val.target.value)}
          // value={amount}
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
            // onClick={() => depositZkToken(parseInt(amount))}
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
            // onClick={() => withdrawZkToken(parseInt(amount))}
          >
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}

export default Status
