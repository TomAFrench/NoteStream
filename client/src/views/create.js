import React, { useState } from 'react'
import '../styles.css'
import {
  days as daysOption,
  hours as hoursOption,
  minutes as minutesOption
} from '../options'

const Create = ({web3, zkAsset, streamContract}) => {
  const [streamAmount, setStreamAmount] = useState(null)
  const [recipient, setRecipient] = useState(null)
  const [days, setDays] = useState(null)
  const [hours, setHours] = useState(null)
  const [minutes, setMinutes] = useState(null)

  function initialiseStream (
    streamContract,
    payeeAddress,
    noteForStreamContract,
    startTime,
    endTime
  ) {
    console.log(streamContract.methods)
    return streamContract.methods
      .createStream(
        recipient,
        noteForStreamContract.noteHash,
        zkAsset.address,
        startTime,
        endTime
      )
      .call({}, (err, streamID) => {
        if (err) {
          console.log(err)
        } else {
          console.log('Steam ID', streamID)
          return streamID
        }
      })
  }

  async function fundStream (streamContractAddress, payeeAddress, sendAmount, asset) {
    const _sendResp = await asset.send(
      [
        {
          to: streamContractAddress,
          amount: sendAmount,
          aztecAccountNotRequired: true,
          numberOfOutputNotes: 1 // contract has one
        }
      ],
      { userAccess: [payeeAddress] }
    ) // account of user who is streaming
    console.info('sent funds confidentially')
    console.log('_sendResp', _sendResp)
    let noteForStreamContract = null
    _sendResp.outputNotes.forEach(function (outputNote) {
      if (outputNote.owner === streamContractAddress) {
        noteForStreamContract = outputNote
      }
    })
    console.log('noteForStreamContract', noteForStreamContract)
    return noteForStreamContract
  }

  async function createStream(
    sendAmount,
    payeeAddress,
    startTime,
    endTime ) {
      const streamNote = await fundStream(streamContract.address, payeeAddress, sendAmount, zkAsset)
      return initialiseStream (streamContract, payeeAddress, streamNote, startTime, endTime)
  }

  return (
    <>
    <div className='input-wrap'>
      <label>How much do you want to stream?</label>
      <input
        type='text'
        onChange={val => setStreamAmount(val.target.value)}
        value={streamAmount}
        placeholder='0 Dai'
      />
    </div>
    <div className='input-wrap'>
      <label>Who is the recipient?</label>
      <input
        type='text'
        onChange={val => setRecipient(val.target.value)}
        value={recipient}
        placeholder='0xe065D88f41615231e69026040C075d9F9F1bD00A'
      />
    </div>
    <p style={{ marginBottom: 10 }}>
      For how long do you want to stream?
    </p>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignSelf: 'center'
      }}
    >
      <div className='input-wrap select-wrap'>
        <label>Days</label>
        <select
          value={days}
          onChange={val => setDays(val.target.value)}
        >
          {daysOption.map(option => (
            <option key={option.id} value={option.title}>
              {option.title}
            </option>
          ))}
        </select>
      </div>

      <div className='input-wrap select-wrap'>
        <label>Hours</label>
        <select
          value={hours}
          onChange={val => setHours(val.target.value)}
        >
          {hoursOption.map(option => (
            <option key={option.id} value={option.title}>
              {option.title}
            </option>
          ))}
        </select>
      </div>
      <div className='input-wrap select-wrap'>
        <label>Minutes</label>
        <select
          value={minutes}
          onChange={val => setMinutes(val.target.value)}
        >
          {minutesOption.map(option => (
            <option key={option.id} value={option.title}>
              {option.title}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div
      className='backbutton'
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 20
      }}
    >
      <button onClick={() => createStream(web3, streamAmount, Date.now()+20, Date.now()+200)}>Create stream</button>
    </div>
    </>
  )
}

export default Create
