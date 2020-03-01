import React, { useState } from "react";
import "../styles.css";

const Status = ({ streamEvents, userAddress }) => {
  const renderRecipientStreams = () => {
    const filtered = streamEvents.filter(
      e => (e.returnValues.recipient == userAddress)
    );
    return filtered.map(e => <p>{e.returnValues.streamId} </p>);
  };
  const renderSenderStreams = () => {
    const filtered = streamEvents.filter(
      e => (e.returnValues.sender == userAddress)
    );
    return filtered.map(e => <p>{e.returnValues.streamId} </p>);
  };
  return (
    <>
      <p>Sender streams</p>
      {renderSenderStreams()}
      <p>Recipient streams</p>
      {renderRecipientStreams()}
    </>
  );
};

export default Status;
