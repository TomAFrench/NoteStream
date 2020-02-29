import React, { useState, useEffect } from 'react'
import './App.css'
import { getWeb3 } from './utils'
import './styles.css'
import {
  days as daysOption,
  hours as hoursOption,
  minutes as minutesOption
} from './options'
const { JoinSplitProof, DividendProof, note } = require('aztec.js')
const secp256k1 = require('@aztec/secp256k1')
const zkAssetAddress = '0x54Fac13e652702a733464bbcB0Fb403F1c057E1b'
const streamContractAddress = '0x1f52693c618d093cEF45Bc59100C9086B3108a61'
const payeeAddress = '0xC6EBff8Bdb7a8E05A350676f8b662231e87D83a7'

const streamContract = require('./streamContract.js')

const App = () => {
  const [web3, setWeb3] = useState(null)
  const [accounts, setAccounts] = useState(null)
  const [contract, setContract] = useState(null)
  const [network, setNetwork] = useState(undefined)
  const [streamAmount, setStreamAmount] = useState(null)
  const [depositAmount, setDepositAmount] = useState(null)
  const [destinationAddress, setDestinationAddress] = useState(null)
  const [duration, setDuration] = useState(null)
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [route, setRoute] = useState('deposit')
  const [daiBalance, setDaiBalance] = useState(0)
  const [zkdaiBalance, setZkdaiBalance] = useState(0)
  const [notes, setNotes] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [asset, setAsset] = useState(null)

  async function depositZKtoken (depositAmount) {
    console.log('lefut', depositAmount)
    await asset.deposit(
      [{ to: accounts[0], amount: depositAmount }], {})
    setTimeout(() => {
      getBalance(asset)
    }, 15000)
  }
  async function getBalance (asset) {
    const _zkbalance = await asset.balance()
    setZkdaiBalance(_zkbalance)
  }

  async function getAllNotes (asset) {
    // Fetch all notes
    const _notes = await asset.fetchNotesFromBalance()
    setNotes(_notes)
  }

  async function generateDividendProof (originalNote, zA, zB) {
    /// / //// PROOF STUFF here.
    const acts = [secp256k1.generateAccount(), secp256k1.generateAccount()]

    const notionalNote = originalNote// await note.create(acts[0].publicKey, 10) // Original Node
    const targetNote = await note.create(acts[0].publicKey, 5) // Public key you need to get from Metamask of the receiver
    const residualNote = await note.create(acts[1].publicKey, 1, streamContractAddress) // This public key is random and I don't know why

    // notionalNote.value * za = targetNote.value * zb + residualNote.value
    // ex. 10 * 1 = 5 * 2 + 1
    const dividendProof = new DividendProof(notionalNote, residualNote, targetNote, sender, zA, zB)
    const dividendProofABI = dividendProof.encodeABI()

    const sender = acts[0].address // address of transaction sender
    const publicOwner = acts[0].address // address of public token owner

    const inputNotes = [notionalNote]
    const outputNotes = [targetNote, residualNote]
    const publicValue = 0
    const JSsender = accounts[0].address // metamask address of receiver
    const JSproof = new JoinSplitProof(inputNotes, outputNotes, JSsender, publicValue, publicOwner)
    const JSproofABI = JSproof.encodeABI()
    const durationToWithdraw = 1
    const streamId = 3 // I don't know if you can get this from the first callback
    const streamContractInstance = new web3.eth.Contract(
      streamContract.abi,
      streamContractAddress
    )
    streamContractInstance.methods.withdrawFromStream(
      streamId,
      dividendProofABI,
      JSproofABI,
      durationToWithdraw
    ).send({ from: accounts[0] }, (err, something) => {
      if (err) {
        console.log(err)
      } else {
        console.log('Witdraw created', something)
      }
    })
  }

  async function createStream () {
    const noteForStreamContract = await depositToStream(streamAmount)
    const streamContractInstance = new web3.eth.Contract(
      streamContract.abi,
      streamContractAddress
    )
    console.log(streamContractInstance.methods)
    const startTime = Math.floor(Date.now() / 1000)
    console.log('days', days, 'hours', hours, 'minutes', minutes)
    const endTime = startTime + days * 86400 + hours * 3600 + minutes * 60
    console.log(destinationAddress, noteForStreamContract.noteHash, zkAssetAddress, startTime, startTime + 1000)
    console.log('account', accounts[0])
    streamContractInstance.methods.createStream(
      destinationAddress,
      noteForStreamContract.noteHash,
      zkAssetAddress,
      startTime + 30,
      startTime + 1000
    ).send({ from: accounts[0] }, (err, streamID) => {
      if (err) {
        console.log(err)
      } else {
        console.log('Steam ID created', streamID)
      }
    })
    await generateDividendProof(noteForStreamContract, 1, 1)
  }

  async function depositToStream (sendAmount) {
    console.log('_asset', asset)
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

  useEffect(() => {
    const init = async () => {
      const _web3 = await getWeb3()
      const _accounts = await _web3.eth.getAccounts()
      const _network = await _web3.eth.net.getId()
      setNetwork(_network)

      /* const _contract = new web3.eth.Contract(
       Multisig.abi,
        deployedNetwork && deployedNetwork.address,
      ); */
      console.log('web3', _web3)
      console.log('windowaztec', window.aztec)
      setWeb3(_web3)
      setAccounts(_accounts)
      console.log('accounts', _accounts)
      // setContract(_contract);
      const apiKey = 'test1234'
      const result = await window.aztec.enable({ apiKey })
      // Fetch the zkAsset

      const _asset = await window.aztec.zkAsset(zkAssetAddress)
      setAsset(_asset)
      console.log('ASSET:', _asset)
      await getBalance(_asset)
      await getAllNotes(_asset)
      setLoaded(true)
      // Send funds
      const deposit = true
      if (false) {
        //  createStream(_web3, noteForStreamContract, 0, 10000000);
      }
    }
    init()
    /*
    window.ethereum.on("accountsChanged", accounts => {
      setAccounts(accounts);
    });
    */
  }, [])

  useEffect(() => {
    console.log('minutes', minutes)
  }, [minutes])

  return (
    <div className='App'>
      <div style={{ width: 500, margin: 'auto', marginTop: 150 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(8, 8, 8, 0.44)',
            alignItems: 'center',
            marginBottom: 20
          }}
        >
          <p
            onClick={() => loaded && setRoute('deposit')}
            style={{
              cursor: 'pointer',
              margin: 0,
              padding: '5px 30px 5px 30px',
              backgroundColor: route == 'deposit' ? '#0179C4' : null,
              borderRadius: 10,
              opacity: 0.85
            }}
          >
            Deposit
          </p>
          <p
            onClick={() => setRoute('create')}
            style={{
              cursor: 'pointer',
              margin: 0,
              padding: '5px 30px 5px 30px',
              backgroundColor: route == 'create' ? '#0179C4' : null,
              borderRadius: 10,
              opacity: 0.85
            }}
          >
            Create
          </p>
          <p
            onClick={() => setRoute('status')}
            style={{
              cursor: 'pointer',
              margin: 0,
              padding: '5px 30px 5px 30px',
              backgroundColor: route == 'status' ? '#0179C4' : null,
              borderRadius: 10,
              opacity: 0.85
            }}
          >
            Status
          </p>
        </div>

        {route == 'create' ? (
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
              <label>What is the destination address?</label>
              <input
                type='text'
                onChange={val => setDestinationAddress(val.target.value)}
                value={destinationAddress}
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
              <button onClick={() => destinationAddress && createStream()}>
                Create stream
              </button>
            </div>
          </>
        ) : null}
        {route == 'deposit' ? (
          <>
            <p>Your Dai Balance: {daiBalance} Dai</p>
            <p style={{ marginBottom: 20 }}>
              Your zkDai Balance: {zkdaiBalance} ZkDai
            </p>
            <div className='input-wrap'>
              <label>Enter deposit/Withdraw amount</label>
              <input
                type='text'
                onChange={val => setDepositAmount(val.target.value)}
                value={depositAmount}
                placeholder='0 Dai/zkDai'
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div
                className='backbutton'
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: 20
                }}
              >
                <button
                  style={{ width: 200 }}
                  onClick={() => depositZKtoken(depositAmount)}
                >
                  Deposit
                </button>
              </div>
              <div
                className='backbutton'
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: 20
                }}
              >
                <button style={{ width: 200 }} onClick={() => window.close()}>
                  Withdraw
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default App
