pragma solidity ^0.5.11;

import "@aztec/protocol/contracts/ACE/ACE.sol";
import "@aztec/protocol/contracts/interfaces/IZkAsset.sol";
import "@aztec/protocol/contracts/libs/NoteUtils.sol";
import "./Types.sol";

library StreamUtilities {
    using SafeMath for uint256;
    using SafeMath for uint32;
    using NoteUtils for bytes;

    uint256 constant scalingFactor = 1000000000;
    uint24 constant DIVIDEND_PROOF = 66561;
    uint24 constant JOIN_SPLIT_PROOF = 65793;

    struct Note {
        address owner;
        bytes32 noteHash;
        bytes metaData;
    }

    function _noteCoderToStruct(bytes memory note)
        internal
        pure
        returns (Note memory codedNote)
    {
        (address owner, bytes32 noteHash, bytes memory metaData) = note
            .extractNote();
        return Note(owner, noteHash, metaData);
    }

    function getRatio(bytes memory _proofData)
        internal
        pure
        returns (uint256 ratio)
    {
        uint256 za;
        uint256 zb;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            za := mload(add(_proofData, 0x40))
            zb := mload(add(_proofData, 0x60))
        }

        return za.mul(scalingFactor).div(zb);
    }

    function _validateRatioProof(
        bytes memory _proof1,
        uint256 _withdrawDuration,
        Types.AztecStream storage _stream
    )
        internal
        returns (
            bytes memory _proof1InputNotes,
            bytes memory _proof1OutputNotes
        )
    {
        uint256 totalTime = _stream.stopTime.sub(_stream.lastWithdrawTime);
        require(
            getRatio(_proof1) ==
                _withdrawDuration.mul(scalingFactor).div(totalTime),
            "ratios do not match"
        );

        bytes memory _proof1Outputs = ACE(_stream.aceContractAddress)
            .validateProof(DIVIDEND_PROOF, address(this), _proof1);
        (_proof1InputNotes, _proof1OutputNotes, , ) = _proof1Outputs
            .get(0)
            .extractProofOutput();
        require(
            _noteCoderToStruct(_proof1InputNotes.get(0)).noteHash ==
                _stream.currentBalance,
            "incorrect notional note in proof 1"
        );

    }

    function _processWithdrawal(
        bytes memory _proof2,
        bytes memory _proof1OutputNotes,
        Types.AztecStream storage _stream
    ) internal returns (bytes32 newCurrentInterestBalance) {
        bytes memory _proof2Outputs = ACE(_stream.aceContractAddress)
            .validateProof(JOIN_SPLIT_PROOF, address(this), _proof2);
        (bytes memory _proof2InputNotes, bytes memory _proof2OutputNotes, , ) = _proof2Outputs
            .get(0)
            .extractProofOutput();

        bytes32 inputNoteHash = _noteCoderToStruct(_proof2InputNotes.get(0))
            .noteHash;

        // Requires that output note respects dividend proof
        require(
            inputNoteHash ==
                _noteCoderToStruct(_proof1OutputNotes.get(0)).noteHash,
            "withdraw note in 2 is not the same as 1"
        );

        // Require that input note is stream note
        require(
            inputNoteHash == _stream.currentBalance,
            "stream note in 2 is not correct"
        );

        Note memory newStreamNote = _noteCoderToStruct(
            _proof2OutputNotes.get(1)
        );

        // Require that change note is owned by contract
        require(
            newStreamNote.owner == address(this),
            "change note in 2 is not owned by stream contract"
        );

        // Require that sender and receiver have view access to change note
        // require(extractAddress(newStreamNote.metaData, 0) == _stream.sender, "stream sender can't view new stream note");
        // require(extractAddress(newStreamNote.metaData, 0) == _stream.recipient, "stream recipient can't view new stream note");

        // Approve contract to spend stream note
        IZkAsset(_stream.tokenAddress).confidentialApprove(
            inputNoteHash,
            address(this),
            true,
            ""
        );

        // Send transfer
        IZkAsset(_stream.tokenAddress).confidentialTransferFrom(
            JOIN_SPLIT_PROOF,
            _proof2Outputs.get(0)
        );

        // Update new contract note
        newCurrentInterestBalance = newStreamNote.noteHash;
    }

    function _processCancelation(
        bytes memory _proof2,
        bytes memory _proof1OutputNotes,
        Types.AztecStream storage _stream
    ) internal returns (bool) {
        bytes memory _proof2Outputs = ACE(_stream.aceContractAddress)
            .validateProof(JOIN_SPLIT_PROOF, address(this), _proof2);
        (bytes memory _proof2InputNotes, bytes memory _proof2OutputNotes, , ) = _proof2Outputs
            .get(0)
            .extractProofOutput();

        bytes32 inputNoteHash = _noteCoderToStruct(_proof2InputNotes.get(0))
            .noteHash;

        // Requires that output note respects dividend proof
        require(
            inputNoteHash ==
                _noteCoderToStruct(_proof1OutputNotes.get(0)).noteHash,
            "withdraw note in 2 is not the same as 1"
        );

        // Require that input note is stream note
        require(
            inputNoteHash == _stream.currentBalance,
            "stream note in 2 is not correct"
        );

        // Require that each participant owns an output note
        require(
            _noteCoderToStruct(_proof2OutputNotes.get(0)).owner ==
                _stream.recipient,
            "Stream recipient doesn't own first output note"
        );
        require(
            _noteCoderToStruct(_proof2OutputNotes.get(1)).owner ==
                _stream.sender,
            "Stream sender doesn't own second output note"
        );

        // Approve contract to spend with stream note
        IZkAsset(_stream.tokenAddress).confidentialApprove(
            inputNoteHash,
            address(this),
            true,
            ""
        );

        // Send transfer
        IZkAsset(_stream.tokenAddress).confidentialTransferFrom(
            JOIN_SPLIT_PROOF,
            _proof2Outputs.get(0)
        );

        return true;
    }
}
