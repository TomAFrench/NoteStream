import Web3Service from '../services/Web3Service';
import depositToERC20 from './helpers/depositToERC20';

import ACE from '../build/ACE';
import ZkAssetOwnable from '../build/ZkAssetOwnable';
import AZTECAccountRegistry from '../build/AZTECAccountRegistry';
import ERC20Mintable from '../build/ERC20Mintable';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const enable = async () => {

    await Web3Service.init();

    Web3Service.registerContract(ACE);
    Web3Service.registerContract(AZTECAccountRegistry);

    await window.aztec.enable({contractAddresses: {
        ace: Web3Service.contract('ACE').address,
        aztecAccountRegistry: Web3Service.contract('AZTECAccountRegistry').address
    }});
    Web3Service.registerInterface(ERC20Mintable, {
        name: 'ERC20',
    });
    Web3Service.registerContract(ZkAssetOwnable);

}

export const getBalance = async() => {
    
    const { aztec } = window;
    let zkAssetAddress = Web3Service.contract('ZkAssetOwnable').address; // ADD EXISTING ASSET ADDRESS HERE
    const asset = await aztec.asset(zkAssetAddress);
    return {
        balance: await asset.balance(),
        address: zkAssetAddress
    };
}

export const deposit = async ({

    initialERC20Balance = 200,
    scalingFactor = 1,
    depositAmount = 50,
}) => {
    
    const { aztec } = window;

    await enable();

    const {
        address: userAddress,
    } = Web3Service.account;

let zkAssetAddress = Web3Service.contract('ZkAssetOwnable').address; // ADD EXISTING ASSET ADDRESS HERE

    const asset = await aztec.asset(zkAssetAddress);
    if (!asset.isValid()) {
        // TODO
        // wait for data to be processed by graph node
        // this should be handled in background script
        await sleep(2000);
        await asset.refresh();
    }
    if (!asset.isValid()) {
        console.log('Asset is not valid.');
        return;
    }

    console.log(`Asset balance = ${await asset.balance()}`);

    let erc20Balance = await asset.balanceOfLinkedToken();
    if (erc20Balance >= depositAmount) {
        console.log(`ERC20 account balance = ${erc20Balance}`);
    } else {
        console.log(`ERC20 balance (${erc20Balance}) is not enough to make a deposit of ${depositAmount}.`);

        console.log('Sending free token...', {
            userAddress,
            amount: depositAmount,
        });

        await depositToERC20({
            userAddress,
            amount: depositAmount,
            erc20Address: asset.linkedTokenAddress,
        });

        erc20Balance = await asset.balanceOfLinkedToken();
        console.log(`Your new ERC20 account balance is ${erc20Balance}.`);
    }

    console.log('Generating deposit proof...');
    const depositProof = await asset.deposit(depositAmount);
    if (!depositProof) {
        console.log('Failed to generate deposit proof.');
        return;
    }
    console.log('Approving deposit...');
    await depositProof.approve();
    console.log('Approved!');

    console.log('Making deposit...');
    const incomeNotes = await depositProof.send();
    if (!incomeNotes) {
        console.log('Failed to deposit.');
        return;
    }
    console.log(`Successfully deposited ${depositAmount} to asset '${zkAssetAddress}'.`, {
        notes: incomeNotes,
    });

    await sleep(1000);
    console.log(`Asset balance = ${await asset.balance()}`);

}


export const send = async ({
    amount = 20,
    to,
}) => {
    
    const { aztec } = window;


    await enable();
    console.log(Web3Service.contracts);

    let zkAssetAddress = Web3Service.contract('ZkAssetOwnable').address; // ADD EXISTING ASSET ADDRESS HERE

    const asset = await aztec.asset(zkAssetAddress);
    if (!asset.isValid()) {
        // TODO
        // wait for data to be processed by graph node
        // this should be handled in background script
        await sleep(2000);
        await asset.refresh();
    }
    if (!asset.isValid()) {
        console.log('Asset is not valid.');
        return;
    }

    console.log(`Asset balance = ${await asset.balance()}`);
    
    const sendAmount = 1;
    const receiver = '0x0563a36603911daaB46A3367d59253BaDF500bF9';

    console.log('Generating send proof...');
    const sendProof = await asset.send({
        amount,
        to,
        
    }, {
        numberOfOutputNotes: 1,
    });

    console.log('Approving send proof...');
    await sendProof.approve();
    console.log('Approved!');

    console.log('Sending...');
    await sendProof.send();
    console.log(`Successfully sent ${sendAmount} to account '${receiver}'.`);

    await sleep(1000);
    console.log(`Asset balance = ${await asset.balance()}`);

}
