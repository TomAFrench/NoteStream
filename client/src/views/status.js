import React, { useState, useEffect } from "react";
import "../styles.css";
import moment from "moment";
import { ProgressBar } from "react-bootstrap";

const Status = ({
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

  const calculateTime = (startTime, endTime) => {
    if (startTime > Date.now()) {
      return 0;
    } else if (endTime < Date.now()) {
      return 100;
    } else {
      return (Date.now() - startTime) / (endTime - startTime);
    }
  };

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
    const filtered = streamEvents.filter(
      e => e.returnValues.recipient == userAddress
    );
    filtered.map(e => {
      loadStream(e.returnValues.streamId, "recipient");
    });
  };
  const loadSenderStreams = () => {
    const filtered = streamEvents.filter(
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
