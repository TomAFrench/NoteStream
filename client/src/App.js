import React, { useState, useEffect } from 'react'
import './App.css'
import { getWeb3 } from './utils'
import './styles.css'
import {
  days as daysOption,
  hours as hoursOption,
  minutes as minutesOption
} from './options'
import TopBar from './components/TopBar'
import Create from './views/create'
import Deposit from './views/deposit'

import { Route, BrowserRouter as Router, Redirect } from 'react-router-dom'

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
  const [zkAsset, setZkAsset] = useState()
  const [zkdaiBalance, setZkdaiBalance] = useState(0)
  const [notes, setNotes] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [asset, setAsset] = useState(null)

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

      setAccounts(accounts)
      console.log('accounts', _accounts)

      const streamContractInstance = _web3.eth.Contract(
        streamContract.abi,
        streamContractAddress
      )
      setContract(streamContractInstance);

      const apiKey = 'test1234'
      const result = await window.aztec.enable({ apiKey })
      
      // Fetch the zkAsset
      const _asset = await window.aztec.zkAsset(zkAssetAddress)
      setAsset(_asset)
      console.log('ASSET:', _asset)
      await getBalance(_asset)
      await getAllNotes(_asset)
      setLoaded(true)
    }
    init()
  }, [])

  return (
    <div className='App'>
      <div style={{ width: 500, margin: 'auto', marginTop: 150 }}>
        <Router>
        <TopBar/>

        <Route
          path="/deposit"
          render={() => <Deposit/>}
        />

        <Route
          path="/create"
          render={() =>
            <Create
              web3={web3}
              zkAsset={zkAsset}
              streamContract={contract}
            />}
        />
        <Redirect path="/" to="/deposit" />
       </Router>
      </div>
    </div>
  )
}

export default App
