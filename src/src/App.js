import React from 'react';
import {
  Block, 
  Text, 
  Image, 
  Button, 
  FlexBox,
  TextInput,
  Col,
} from '@aztec/guacamole-ui';
import EthIndia from './images/ethindia.png';
import Aztec from './images/aztec.png';
import './App.css';

/* eslint-enable */
import Web3Service from './services/Web3Service';
import depositToERC20 from './utils/depositToERC20';

import {
  enable,
  deposit,
  send,
  getBalance
} from './demo';

class App extends React.Component {

  state = {
    balance: 0,
    address: ''
  };


  _updateToAddress(value) {
    this.setState({ to: value });
  }


  render () {
    return (
      <div className="App">
        <Block 
          background="primary"
          padding="xl"
          layer='3'
          style={{
            background: 'linear-gradient(115deg, #808DFF 0%, #9FC4FF 100%, #7174FF 100%)',
          }}
        >
          <FlexBox direction='row' align='space-around' valign='center' >
            <Image src={Aztec} width={'300'} />
            <Text 
              text='Welcome to ETH India!'
              size = 'xxl' 
              colour='white' 
              weight = 'bold'
            />
            <Image src={EthIndia} width={'300'} />
          </FlexBox>
        </Block>
        <Block padding='l xxl'>
          <br/>
          <br/>
          <br/>
          <FlexBox padding='none' direction='column' align='flex-start'>
          <Text text='To get started please follow the steps to install the AZTEC extension:' colour='label' size ='s' weight='light' textAlign='left'/>
          <a href='https://aztec-protocol.gitbook.io/aztec-documentation/eth-india/aztec.js' target="__blank"> <Text text='Install Extension' color='label' size='s' /> </a>
        </FlexBox>
        </Block>
        <br/>
        <br/>
        <br/>
        <Block padding='xxl'>
          <Col column='6' padding='none'>
            <Block padding='l xxl' background='primary' borderRadius='s'>
              <FlexBox padding='none' direction='column' align='flex-start'>
                <Text text={`ZkAsset Address:${this.state.address}`} colour='white' size ='l' weight='bold' textAlign='left'/>
                <Text text={`ZkAsset Balance:${this.state.balance}`} colour='white' size ='l' weight='bold'  textAlign='left'/>
              </FlexBox>
            </Block>
          </Col>
        </Block>
        <Block padding='xxl' align='left'>

          <Col column='6' padding='none'>
          <Block 
            background='primary-lightest'
            padding='xl'
            borderRadius='s'
            align='left'
          >
            <FlexBox direction='column' >
              <Text text='window.aztec.enable()' weight='bold' size='l'/>
              <br/>
              <br/>
              <Text text='This method will register the extension.' />
            </FlexBox>
            <br/>
            <Button text='Enable AZTEC' isLoading={this.state.enableLoading} onClick={async ()=> {
              if (!window.aztec) {
                alert('Please install the aztec extension');
                return;
              }
              this.setState({enableLoading: true});
              await enable();
              const balance = await getBalance();


              this.setState({enableLoading: false, ...balance});
            }} />
        </Block>

        <br/>
      <br/>
      <Block 
        background='primary-lightest'
        padding='xl'
      borderRadius='s'
    >
      <FlexBox direction='column'>
        <Text text='.asset(assetAddress).deposit(100)' weight='bold' size='l' />
        <br/>
        <br/>
        <Text text='This method will convert ERC20 Tokens into AZTEC notes.' />
      </FlexBox>
      <br/>
      <Button text='Wrap ERC20' isLoading={this.state.depositLoading} onClick={async ()=> {
        if (!window.aztec) {
          alert('Please install the aztec extension');
          return;
        }
        this.setState({depositLoading: true});
        await deposit(100);

        const balance = await getBalance();
        this.setState({depositLoading: false, ...balance});
        }} />
    </Block>

    <br/>
    <br/>
    <Block 
      background='primary-lightest'
      padding='xl'
      borderRadius='s'
    >
      <FlexBox direction='column'>
        <Text text='.asset.send({amount: 25, owner})' weight='bold' size='l' />
        <br/>
        <br/>
        <Text text='This method will send another account AZTEC notes. NOTE, the recipient will need to have the AZTEC extension installed and have registered it on the same chain (ganache)' />
      </FlexBox>
      <br/>
      <br/>
      <TextInput placeholder='Recipient' onChange={(value)=>this._updateToAddress(value)}/>
      <br/>
      <br/>
      <Button text='Send AZTEC Notes' isLoading={this.state.sendLoading} onClick={async ()=> {
        if (!window.aztec) {
          alert('Please install the aztec extension');
          return;
        }
        this.setState({sendLoading: true});
        await send({amount: 25, to: this.state.to});
        const balance = await getBalance();

        this.setState({sendLoading: false, ...balance});
      }} />
  </Block>
      </Col>
</Block>

      </div>
    );
  }
}

export default App;
