import React, { useState, useEffect } from "react";
import _ from 'lodash'
import "../styles.css";
import moment from "moment";
import { ProgressBar } from "react-bootstrap";
import { calculateTime } from '../utils/time'

const StreamDisplay = ({stream}) => {
  const timePercentage = calculateTime(
    Number(stream[4]) * 1000,
    Number(stream[5]) * 1000
  );
  return (
    <div>
      <p>Sender: {stream[0]} </p>
      <p>Receiver: {stream[1]} </p>
      <p>
        StartTime:{" "}
        {moment(Number(stream[4]) * 1000).format("DD-MM-YYYY HH:mm:ss")}
      </p>
      <p>
        StopTime:{" "}
        {moment(Number(stream[5]) * 1000).format("DD-MM-YYYY HH:mm:ss")}
      </p>
      <p>CurrentBalance: {stream[3]}</p>
      <p style={{ marginTop: 30 }}>Time passed:</p>
      <ProgressBar now={timePercentage} />
      <p style={{ marginTop: 30 }}>Money withdrawn</p>
      <ProgressBar now={0} />
    </div>
  )
}


const Status = ({
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

  return (
    <>
      {streamContractInstance && (
        <>
          <p>Sender streams</p>
          {senderStreams.map(stream => <StreamDisplay stream={stream}/>)}
          <p>Recipient streams</p>
          {recipientStreams.map(stream => <StreamDisplay stream={stream}/>)}
        </>
      )}
    </>
  );
};

export default Status;
