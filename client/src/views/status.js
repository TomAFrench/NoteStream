import React, { useState, useEffect } from "react";
import _ from 'lodash'
import "../styles.css";
import moment from "moment";
import { ProgressBar } from "react-bootstrap";


const streamContract = require("../streamContract.js");

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

const computeRemainderNoteValue = (value, za, zb) => {
  const expectedNoteValue = Math.floor(value * (za / zb));
  const remainder = value * za - expectedNoteValue * zb;

  return {
    remainder,
    expectedNoteValue,
  };
};

const calculateTime = (startTime, endTime) => {
  if (startTime > Date.now()) {
    return 0;
  } else if (endTime < Date.now()) {
    return 100;
  } else {
    return (Date.now() - startTime) / (endTime - startTime);
  }
};

const Status = ({
  aztec,
  web3,
  streamEvents,
  userAddress,
  streamContractInstance,
  zkdaiBalance
}) => {
  const [senderStreams, setSenderStreams] = useState([]);
  const [recipientStreams, setRecipientStreams] = useState([]);

  useEffect(() => {
    loadRecipientStreams();
    loadSenderStreams();
  }, [streamContractInstance, zkdaiBalance]);

  async function buildProofs() {
    // if currentBalance is 0 we have to change this as the ratio is infinite

    if (!web3){
      return false
    }

    const streamContractInstance = new web3.eth.Contract(
      streamContract.abi,
      streamContractInstance.address
    );

    const events = await streamContractInstance.getPastEvents("allEvents", {filter: {recipient: userAddress}})
    console.log(events)
    const streamId = _.last(events) && _.last(events).returnValues.streamId;

    const streamObj = await streamContractInstance.methods.getStream(streamId).call()

    const {proofData: proofData1, inputNotes, outputNotes} = buildDividendProof(aztec, streamObj)
    const {proofData: proofData2, outputNotes: [withdrawPaymentNote, changeNote] } = buildJoinSplitProof(aztec, streamObj, inputNotes[0], outputNotes[0], streamContractInstance.address)
  
    return {
      proofs: [proofData1, proofData2],
      notes: {
        changeNote,
        withdrawPaymentNote,
      },
    };
  }

  async function buildDividendProof(aztec, stream) {
    const {sender, recipient, currentBalance, lastWithdrawTime, endTime } = stream
  
    const payer = await aztec.user(sender)
    const payee = await aztec.user(recipient)
  
    const ratio1 = getFraction((Date.now() - lastWithdrawTime) / (endTime - lastWithdrawTime) * 10000);
        
    const streamNote = aztec.zkNote(currentBalance)
    const withdrawPayment = computeRemainderNoteValue(streamNote.k.toNumber(), ratio1.denominator, ratio1.numerator);
    const remainderNote2 = await aztec.note.create(payer.spendingPublicKey, withdrawPayment.remainder, [{address: payer.address, linkedPublicKey: payer.linkedPublicKey}]);
    const withdrawPaymentNote = await aztec.note.create(payee.spendingPublicKey, withdrawPayment.expectedNoteValue, [{address: payee.address, linkedPublicKey: payee.linkedPublicKey}]);
  
    const { proofData } = aztec.proof.dividendComputation.encodeDividendComputationTransaction({
      inputNotes: [streamNote],
      outputNotes: [withdrawPaymentNote, remainderNote2],
      za: ratio1.numerator,
      zb: ratio1.denominator,
      senderAddress: streamContractInstance.address,
    });
  
    return {proofData, inputNotes: [streamNote], outputNotes: [withdrawPaymentNote, remainderNote2]}
  }

  async function buildJoinSplitProof(aztec, stream, streamNote, withdrawPaymentNote) {
    const {sender, recipient} = stream
  
    const payer = await aztec.user(sender)
    const payee = await aztec.user(recipient)
    const changeValue = Math.max(streamNote.k.toNumber() - withdrawPaymentNote.k.toNumber(), 0)
  
    const changeNote = await aztec.note.create(
      payer.spendingPublicKey,
      changeValue,
      [{address: payer.address, linkedPublicKey: payer.linkedPublicKey},
       {address: payee.address, linkedPublicKey: payee.linkedPublicKey}],
       streamContractInstance.address
    );
  
    const { proofData } = aztec.proof.joinSplit.encodeJoinSplitTransaction({
      inputNotes: [streamNote],
      outputNotes: [withdrawPaymentNote, changeNote],
      inputNoteOwners: [],
      senderAddress: streamContractInstance.address,
      publicOwner: recipient,
      kPublic: 0, // No transfer from private to public assets or vice versa
    });
  
    return {proofData, inputNotes: [streamNote], outputNotes: [withdrawPaymentNote, changeNote]}
  }



  const loadStream = (streamId, role) => {
    streamContractInstance.methods
      .getStream(streamId)
      .call({
        from: userAddress
      })
      .then(async value => {
        console.log("getstream", value);
        role == "recipient"
          ? setRecipientStreams([...recipientStreams, { ...value }])
          : setSenderStreams([...recipientStreams, { ...value }]);
      });
  };

  const loadRecipientStreams = () => {
    const filtered = recipientStreams.filter(
      e => e.returnValues.recipient == userAddress
    );
    filtered.map(e => {
      loadStream(e.returnValues.streamId, "recipient");
    });
  };
  const loadSenderStreams = () => {
    const filtered = senderStreams.filter(
      e => e.returnValues.sender == userAddress
    );
    filtered.map(e => loadStream(e.returnValues.streamId, "sender"));
    return filtered.map(e => <p>{e.returnValues.streamId} </p>);
  };

  const renderRecipientStreams = () => {
    console.log("recipientStreams", recipientStreams);
    return recipientStreams.map(e => {
      const timePercentage = calculateTime(
        Number(e[4]) * 1000,
        Number(e[5]) * 1000
      );
      console.log("timePercentage", timePercentage);
      return (
        <div>
          <p>Sender: {e[0]} </p>
          <p>Receiver: {e[1]} </p>
          <p>
            StartTime:{" "}
            {moment(Number(e[4]) * 1000).format("DD-MM-YYYY HH:mm:ss")}
          </p>
          <p>
            StopTime:{" "}
            {moment(Number(e[5]) * 1000).format("DD-MM-YYYY HH:mm:ss")}
          </p>
          <p>CurrentBalance: {e[3]}</p>
          <p style={{ marginTop: 30 }}>Time passed:</p>
          <ProgressBar now={timePercentage} />
          <p style={{ marginTop: 30 }}>Money withdrawn</p>
          <ProgressBar now={0} />
        </div>
      );
    });
  };
  const renderSenderStreams = () => {
    console.log("senderStreams", senderStreams);
    return senderStreams.map(e => {
      const timePercentage = calculateTime(
        Number(e[4]) * 1000,
        Number(e[5]) * 1000
      );
      console.log("timePercentage", timePercentage);
      return (
        <div>
          <p>Sender: {e[0]} </p>
          <p>Receiver: {e[1]} </p>
          <p>
            StartTime:{" "}
            {moment(Number(e[4]) * 1000).format("DD-MM-YYYY HH:mm:ss")}
          </p>
          <p>
            StopTime:{" "}
            {moment(Number(e[5]) * 1000).format("DD-MM-YYYY HH:mm:ss")}
          </p>
          <p>CurrentBalance: {e[3]}</p>
          <p style={{ marginTop: 30 }}>Time passed:</p>
          <ProgressBar now={timePercentage} />
          <p style={{ marginTop: 30 }}>Money withdrawn</p>
          <ProgressBar now={0} />
        </div>
      );
    });
  };
  return (
    <>
      {streamContractInstance && (
        <>
          <p>Sender streams</p>
          {renderSenderStreams()}
          <p>Recipient streams</p>
          {renderRecipientStreams()}
        </>
      )}
    </>
  );
};

export default Status;
