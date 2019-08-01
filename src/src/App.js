import React from 'react';
import {
  Block, 
  Text, 
  Image, 
  Button, 
  FlexBox,
} from '@aztec/guacamole-ui';
import EthIndia from './images/ethindia.png';
import Aztec from './images/aztec.png';
import './App.css';

import ACE from '@aztec/protocol/contracts/ACE/ACE.sol';
import ZkAssetOwnable from '@aztec/protocol/contracts/ERC1724/ZkAssetOwnable.sol';
import ERC20Mintable from '@aztec/protocol/contracts/ERC20/ERC20Mintable.sol';
/* eslint-enable */
import Web3Service from './services/Web3Service';
import depositToERC20 from './utils/depositToERC20';

class App extends React.Component {

  state = {};



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
          <Text text='To get started please follow the steps to install the AZTEC extension:' colour='label' size ='s' weight='light'/>
          <a href='gitbooks.com' target="__blank"> <Text text='Install Extension' color='label' size='s' /> </a>
        </Block>
        <Block padding='xxl' align='left'>

          <Block 
            background='primary-lightest'
            padding='xl'
            borderRadius='s'
          >
            <FlexBox direction='column'>
              <Text text='window.aztec.enable()' weight='bold' size='l' />
              <Text text='This method will register the extension.' />
            </FlexBox>
            <br/>
            <Button text='Enable AZTEC' loading={this.state.enableLoading} onClick={async ()=> {
              if (!window.aztec) {
                alert('Please install the aztec extension');
                return;
              }

              this.setState({enableLoading: true});



              await window.aztec.enable();
              Web3Service.registerContract(ACE);
              Web3Service.registerInterface(ERC20Mintable, {
                  name: 'ERC20',
              });
              Web3Service.registerInterface(ZkAssetOwnable, {
                  name: 'ZkAsset',
              });
              this.setState({enableLoading: false});
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
              <Text text='.asset(assetAddress).deposit(50)' weight='bold' size='l' />
              <Text text='This method will convert ERC20 Tokens into AZTEC notes.' />
            </FlexBox>
            <br/>
              <Button text='Wrap ERC20' />
          </Block>

          <br/>
          <br/>
          <Block 
            background='primary-lightest'
            padding='xl'
            borderRadius='s'
          >
            <FlexBox direction='column'>
              <Text text='.asset.send([{amount, owner}])' weight='bold' size='l' />
              <Text text='This method will send another account AZTEC notes. NOTE, the recipient will need to have the AZTEC extension installed and have registered it on the same chain (ganache)' />
            </FlexBox>
            <br/>
              <Button text='Send AZTEC Notes' />
          </Block>
        </Block>

      </div>
    );
  }
}

export default App;
