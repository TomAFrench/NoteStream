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

async function getStreams(streamContractInstance, userAddress, role) {
  const events = await streamContractInstance.getPastEvents(
    "CreateStream",
    { filter: {[role]: userAddress }, fromBlock: 0, toBlock: "latest" }
  )
  
  return Promise.all(events.map(async e =>
    streamContractInstance.methods
      .getStream(e.returnValues.streamId)
      .call({
        from: userAddress
      })
    ))
}


const Status = ({
  userAddress,
  streamContractInstance,
  zkdaiBalance
}) => {
  const [senderStreams, setSenderStreams] = useState([]);
  const [recipientStreams, setRecipientStreams] = useState([]);


  useEffect(() => {
    async function loadStreams(){
      if (!streamContractInstance) return
      const newSenderStreams = await getStreams(streamContractInstance, userAddress, 'sender')
      const newRecipientStreams = await getStreams(streamContractInstance, userAddress, 'recipient')
      console.log(newSenderStreams)
      setSenderStreams(newSenderStreams)
      setRecipientStreams(newRecipientStreams)
    }
    loadStreams()
  }, [streamContractInstance, zkdaiBalance]);

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
