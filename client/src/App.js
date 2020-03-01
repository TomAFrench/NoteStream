import React, { useState, useEffect } from 'react'
import './App.css'
import { getWeb3 } from './utils'
import './styles.css'

import TopBar from './components/TopBar'
import Create from './views/create'
import Deposit from './views/deposit'

import { Route, BrowserRouter as Router, Redirect } from 'react-router-dom'

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
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const init = async () => {
      const _web3 = await getWeb3()
      const _accounts = await _web3.eth.getAccounts()
      const _network = await _web3.eth.net.getId()
      setNetwork(_network)

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
      setZkAsset(_asset)
      console.log('ASSET:', _asset)
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
