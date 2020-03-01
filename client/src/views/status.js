import React, { useState, useEffect } from "react";
import "../styles.css";

const Status = ({ streamEvents, userAddress, streamContractInstance }) => {
  const [senderStreams, setSenderStreams] = useState([]);
  const [recipientStreams, setRecipientStreams] = useState([]);

  useEffect(() => {
    if (streamContractInstance) {
      loadRecipientStreams();
      loadSenderStreams();
    }
  }, [streamContractInstance]);

  const loadStream = (streamId, role) => {
    streamContractInstance.methods
      .getStream(streamId)
      .call({
        from: userAddress
      })
      .then(value => {
        console.log("getstream", value);
        role == "recipient"
          ? setRecipientStreams([...recipientStreams, value])
          : setSenderStreams([...recipientStreams, value]);
      });
  };

  const loadRecipientStreams = () => {
    const filtered = streamEvents.filter(
      e => e.returnValues.recipient == userAddress
    );
    filtered.map(e => loadStream(e.returnValues.streamId, "recipient"));
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
    return recipientStreams.map(e => <p>{e.returnValues.currentBalance} </p>);
  };
  const renderSenderStreams = () => {
    console.log("senderStreams", senderStreams);
    return senderStreams.map(e => <p>{e.returnValues.currentBalance} </p>);
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
