import React, { useState, useEffect } from "react";
import "../styles.css";
import moment from "moment";
import { ProgressBar } from "react-bootstrap";
import { calculateTime } from '../utils/time'

const StreamDisplay = ({stream, zkNote}) => {
  const [noteValue, setNoteValue] = useState(stream.noteHash)


  useEffect(() => {
    async function decodeNote(noteHash) {
      const note = await zkNote(noteHash)
      setNoteValue(note.value)
    }
    
    decodeNote(stream.currentBalance)
  }, [zkNote, stream.currentBalance])
  
  const timePercentage = calculateTime(
    Number(stream.startTime) * 1000,
    Number(stream.stopTime) * 1000
  );
  return (
    <div>
      <p>Stream: {stream.streamId} </p>
      <p>Sender: {stream.sender} </p>
      <p>Receiver: {stream.recipient} </p>
      <p>
        StartTime:{" "}
        {moment(Number(stream.startTime) * 1000).format("DD-MM-YYYY HH:mm:ss")}
      </p>
      <p>
        StopTime:{" "}
        {moment(Number(stream.stopTime) * 1000).format("DD-MM-YYYY HH:mm:ss")}
      </p>
      <p>CurrentBalance: {noteValue}</p>
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
    
  return Promise.all(events.map(async e => {
    const stream = await streamContractInstance.methods
      .getStream(e.returnValues.streamId)
      .call({
        from: userAddress
      })
    return {
      streamId: e.returnValues.streamId,
      ...stream
      }
    }
  ))

}


const Status = ({
  userAddress,
  streamContractInstance,
  zkNote,
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
  }, [userAddress, streamContractInstance, zkdaiBalance]);

  return (
    <>
      {streamContractInstance && (
        <>
          <p>Sender streams</p>
          {senderStreams.map(stream => <StreamDisplay zkNote={zkNote} stream={stream} key={stream.currentBalance}/>)}
          <p>Recipient streams</p>
          {recipientStreams.map(stream => <StreamDisplay zkNote={zkNote} stream={stream} key={stream.currentBalance}/>)}
        </>
      )}
    </>
  );
};

export default Status;
