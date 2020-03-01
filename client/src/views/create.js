import React, { useState, useEffect } from 'react'
// import './App.css'
import '../styles.css'
import {
  days as daysOption,
  hours as hoursOption,
  minutes as minutesOption
} from '../options'

const streamContractAddress = '0xf637cfb0c6be07eb0533d1600c7c3fe28df887a3'

const streamContract = require('../streamContract.js')

const Create = ({web3, zkAsset, streamContract}) => {
  const [streamAmount, setStreamAmount] = useState(null)
  const [recipient, setRecipient] = useState(null)
  const [days, setDays] = useState(null)
  const [hours, setHours] = useState(null)
  const [minutes, setMinutes] = useState(null)

  async function createStream (
    _web3,
    noteForStreamContract,
    startTime,
    endTime
  ) {
    console.log(streamContract.methods)
    streamContract.methods
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
        }
      })
  }

  // useEffect(() => {
  //   const init = async () => {
  //     const _web3 = await getWeb3()
  //     const accounts = await _web3.eth.getAccounts()
  //     const _network = await _web3.eth.net.getId()
  //     setNetwork(_network)

  //     /* const _contract = new web3.eth.Contract(
  //      Multisig.abi,
  //       deployedNetwork && deployedNetwork.address,
  //     ); */
  //     console.log('web3', _web3)
  //     console.log('windowaztec', window.aztec)
  //     setWeb3(_web3)
  //     setAccounts(accounts)
  //     // setContract(_contract);
  //     const apiKey = 'test1234'
  //     const result = await window.aztec.enable({ apiKey })
  //     // Fetch the zkAsset

  //     const asset = await window.aztec.zkAsset(zkAssetAddress)
  //     console.log('ASSET:', asset)
  //     await getBalance(asset)
  //     await getAllNotes(asset)

  //     // Send funds
  //     const deposit = true
  //     if (deposit) {
  //       const noteForStreamContract = await depositToStream(10, asset)
  //       createStream(_web3, noteForStreamContract, 0, 10000000)
  //     }
  //   }
  //   init()
  //   /*
  //   window.ethereum.on("accountsChanged", accounts => {
  //     setAccounts(accounts);
  //   });
  //   */
  // }, [])

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
      <button onClick={() => createStream(web3, "noteForStreamContract", Date.now()+20, Date.now()+200)}>Create stream</button>
    </div>
    </>
  )
}

export default Create
