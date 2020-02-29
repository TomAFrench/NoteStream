pragma solidity 0.5.11;
// import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";

import "@aztec/protocol/contracts/ACE/ACE.sol";
import "@aztec/protocol/contracts/libs/NoteUtils.sol";
import "./Types.sol";

library StreamUtilities {

  using SafeMath for uint256;
  using SafeMath for uint32;
  using NoteUtils for bytes;
  
  uint256 constant scalingFactor = 1000000000;
  uint24 constant DIVIDEND_PROOF= 66561;
  uint24 constant JOIN_SPLIT_PROOF = 65793;
  uint24 constant MINT_PRO0F = 66049;
  uint24 constant BILATERAL_SWAP_PROOF = 65794;
  uint24 constant PRIVATE_RANGE_PROOF = 66562;
 
  struct Note {
    address owner;
    bytes32 noteHash;
  }
  
  function _noteCoderToStruct(bytes memory note) internal pure returns (Note memory codedNote) {
      (address owner, bytes32 noteHash,) = note.extractNote();
      return Note(owner, noteHash );
  }

  function getRatio(bytes memory _proofData) internal pure returns (uint256 ratio) {
    uint256 za;
    uint256 zb;
    assembly {
      za := mload(add(_proofData, 0x40))
      zb := mload(add(_proofData, 0x60))
    }
    return za.mul(scalingFactor).div(zb);
  }
  

  function onlyLoanDapp(address sender, address loanFactory) external pure {
    require(sender == loanFactory, 'sender is not the loan dapp');
  }
  
  // function onlyBorrower(address sender, address borrower) external pure {
  //   require(sender == borrower, 'sender is not the borrower');
  // }
  
  // function onlyLender(address sender, address lender) internal pure {
  //   // require(sender, 'sender is not the lender');
  // }

  function _validateRatioProof(
    bytes memory _proof1,
    uint256 _withdrawDuration,
    Types.AztecStream storage _stream
  ) internal returns (
    bytes memory _proof1InputNotes, 
    bytes memory _proof1OutputNotes
  ) {
    //PROOF 1

    //NotionalNote * a = WithdrawableInterestNote * b
    uint256 totalTime = _stream.stopTime.sub(_stream.lastWithdrawTime);
    // assert(vars.mathErr == MathError.NO_ERROR);

    uint256 unwithdrawnTime = _withdrawDuration.sub(_stream.lastWithdrawTime);
    // assert(vars.mathErr == MathError.NO_ERROR);

    require(getRatio(_proof1).div(10000) ==
            unwithdrawnTime.mul(scalingFactor).div(totalTime)
           , 'ratios do not match');


    (bytes memory _proof1Outputs) = ACE(_stream.aceContractAddress).validateProof(DIVIDEND_PROOF, address(this), _proof1);
    (_proof1InputNotes, _proof1OutputNotes, ,) = _proof1Outputs.get(0).extractProofOutput();
    require(_noteCoderToStruct(_proof1InputNotes.get(0)).noteHash == _stream.currentBalance, 'incorrect notional note in proof 1');

  }

  function _processWithdrawal(
    bytes calldata _proof2,
    bytes calldata _proof1OutputNotes,
    Types.AztecStream storage _stream
  ) external returns (bytes32 newCurrentInterestBalance) {


    (bytes memory _proof2Outputs) = ACE(_stream.aceContractAddress).validateProof(JOIN_SPLIT_PROOF, address(this),
                                                                                 _proof2);
    (bytes memory _proof2InputNotes, bytes memory _proof2OutputNotes, ,) = _proof2Outputs.get(0).extractProofOutput();

    // Requires that output note respects dividend proof
    require(_noteCoderToStruct(_proof2OutputNotes.get(0)).noteHash ==
            _noteCoderToStruct(_proof1OutputNotes.get(0)).noteHash, 'withdraw note in 2 is not the same as 1');

    // Require send remainder to contract
    require(_noteCoderToStruct(_proof2InputNotes.get(0)).noteHash == _stream.currentBalance, 'interest note in 2 is not correct');

    // approve transfer
    _stream.settlementToken.confidentialApprove(_noteCoderToStruct(_proof2InputNotes.get(0)).noteHash, address(this), true, '');
    
    
    // send transfer
    _stream.settlementToken.confidentialTransferFrom(JOIN_SPLIT_PROOF, _proof2Outputs.get(0));

    // Update new contract note
    newCurrentInterestBalance = _noteCoderToStruct(_proof2OutputNotes.get(1)).noteHash;

  }

    function _processCancelation(
    bytes calldata _proof2,
    bytes calldata _proof1OutputNotes,
    Types.AztecStream storage _stream
  ) external returns (bytes32 newCurrentInterestBalance) {


    (bytes memory _proof2Outputs) = ACE(_stream.aceContractAddress).validateProof(JOIN_SPLIT_PROOF, address(this),
                                                                                 _proof2);
    (bytes memory _proof2InputNotes, bytes memory _proof2OutputNotes, ,) = _proof2Outputs.get(0).extractProofOutput();


    // Requires that output note respects dividend proof
    (_noteCoderToStruct(_proof2OutputNotes.get(0)).noteHash ==
            _noteCoderToStruct(_proof1OutputNotes.get(0)).noteHash, 'withdraw note in 2 is not the same as 1');

    // Must involve the note on the contract
    require(_noteCoderToStruct(_proof2InputNotes.get(0)).noteHash == _stream.currentBalance, 'interest note in 2 is not correct');

    // Send streamed to receiver
    require(_noteCoderToStruct(_proof2OutputNotes.get(0)).owner == _stream.recipient, 'withdraw note in 2 is not the same as 1');
    // send unstreamed to sender
    require(_noteCoderToStruct(_proof2OutputNotes.get(0)).owner == _stream.sender, 'withdraw note in 2 is not the same as 1');


    _stream.settlementToken.confidentialApprove(_noteCoderToStruct(_proof2InputNotes.get(0)).noteHash, address(this), true, '');

    _stream.settlementToken.confidentialTransferFrom(JOIN_SPLIT_PROOF, _proof2Outputs.get(0));
  }    
}