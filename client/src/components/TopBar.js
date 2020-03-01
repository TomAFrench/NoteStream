import React, { useState } from 'react'
import { useLocation, useHistory } from "react-router";
import '../styles.css'

const TopBar = () => {
  const history = useHistory()
  const location = useLocation()
  return (
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
        onClick={() => history.push("deposit")}
        style={{
          cursor: 'pointer',
          margin: 0,
          padding: '5px 30px 5px 30px',
          backgroundColor: location.pathname == '/deposit' ? '#0179C4' : null,
          borderRadius: 10,
          opacity: 0.85
        }}
      >
        Deposit
      </p>
      <p
        onClick={() => history.push("create")}
        style={{
          cursor: 'pointer',
          margin: 0,
          padding: '5px 30px 5px 30px',
          backgroundColor: location.pathname == '/create' ? '#0179C4' : null,
          borderRadius: 10,
          opacity: 0.85
        }}
      >
        Create
      </p>
      <p
        onClick={() => history.push("status")}
        style={{
          cursor: 'pointer',
          margin: 0,
          padding: '5px 30px 5px 30px',
          backgroundColor: location.pathname == '/status' ? '#0179C4' : null,
          borderRadius: 10,
          opacity: 0.85
        }}
      >
        Status
      </p>
    </div>
  )
}

export default TopBar
