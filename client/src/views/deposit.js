import React, { useState } from 'react'
import '../App.css'
import '../styles.css'

const zkAssetAddress = '0x54Fac13e652702a733464bbcB0Fb403F1c057E1b'
const streamContractAddress = '0xf637cfb0c6be07eb0533d1600c7c3fe28df887a3'
const payeeAddress = '0xC6EBff8Bdb7a8E05A350676f8b662231e87D83a7'

const Deposit = ({zkAsset}) => {
  const [depositAmount, setDepositAmount] = useState(null)
  const [daiBalance, setDaiBalance] = useState(0)
  const [zkdaiBalance, setZkdaiBalance] = useState(0)

  async function getBalance (asset) {
    const _zkbalance = await asset.balance()
    setZkdaiBalance(_zkbalance)
  }

  async function depositToStream (sendAmount, asset) {
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

  return (
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
        <button style={{ width: 200 }} onClick={() => depositToStream(depositAmount, zkAsset)}>
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
  )
}

export default Deposit
