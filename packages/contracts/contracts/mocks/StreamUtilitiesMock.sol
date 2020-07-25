pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

import '../StreamUtilities.sol';


contract StreamUtilitiesMock {
    // The provided struct object is stored here as StreamUtilities expects a storage variable.
    Types.AztecStream public stream;
    event ValidateRatioProof(bytes32 withdrawalNoteHash);
    event ValidateJoinSplitProof(bytes32 withdrawalNoteHash);
    event ProcessDeposit(bytes32 streamNoteHash);
    event ProcessWithdrawal(bytes32 newStreamNoteHash);
    event ProcessCancellation(bool cancellationSuccess);

    function getRatio(bytes memory _proofData)
        public
        pure
        returns (uint256 ratio)
    {
        return StreamUtilities.getRatio(_proofData);
    }

    function validateRatioProof(
        address _aceContractAddress,
        bytes memory _proof1,
        uint256 _withdrawDuration,
        Types.AztecStream memory _stream
    ) public returns (bytes32) {
        stream = _stream;
        bytes32 withdrawalNoteHash = StreamUtilities._validateRatioProof(
            _aceContractAddress,
            _proof1,
            _withdrawDuration,
            stream
        );
        emit ValidateRatioProof(withdrawalNoteHash);
    }

    function validateJoinSplitProof(
        address _aceContractAddress,
        bytes memory _proof2,
        bytes32 _withdrawalNoteHash,
        Types.AztecStream memory _stream
    ) public returns (bytes memory) {
        stream = _stream;
        bytes memory proofOutputs =
            StreamUtilities._validateJoinSplitProof(
                _aceContractAddress,
                _proof2,
                _withdrawalNoteHash,
                stream
            );
    }

    function processDeposit(
        bytes memory _proof,
        bytes memory _proofSignature,
        address _aceContractAddress,
        address _sender,
        address _recipient,
        address _tokenAddress
    ) public returns (bytes32) {
        bytes32 newStreamNoteHash = StreamUtilities._processDeposit(
            _proof,
            _proofSignature,
            _aceContractAddress,
            _sender,
            _recipient,
            _tokenAddress
        );
        emit ProcessDeposit(newStreamNoteHash);
    }

    function processWithdrawal(
        address _aceContractAddress,
        bytes memory _proof2,
        bytes32 _withdrawalNoteHash,
        Types.AztecStream memory _stream
    ) public returns (bytes32) {
        stream = _stream;
        bytes32 newStreamNoteHash = StreamUtilities._processWithdrawal(
            _aceContractAddress,
            _proof2,
            _withdrawalNoteHash,
            stream
        );
        emit ProcessWithdrawal(newStreamNoteHash);
    }

    function processCancellation(
        address _aceContractAddress,
        bytes memory _proof2,
        bytes32 _proof1OutputNotes,
        Types.AztecStream memory _stream
    ) public returns (bool) {
        stream = _stream;
        bool cancellationSuccess =
            StreamUtilities._processCancellation(
                _aceContractAddress,
                _proof2,
                _proof1OutputNotes,
                stream
            );
        emit ProcessCancellation(cancellationSuccess);
    }
}
