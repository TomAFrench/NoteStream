pragma solidity ^0.5.11;

import '@openzeppelin/contracts/lifecycle/Pausable.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

import './StreamUtilities.sol';

import './Types.sol';


/**
 * @title NoteStream's Money Streaming
 * @author NoteStream
 */
contract NoteStream is Pausable, ReentrancyGuard {
    using SafeMath for uint256;

    /*** Storage Properties ***/

    address aceContractAddress;

    /**
     * @notice Counter for new stream ids.
     */
    uint256 public nextStreamId;

    /**
     * @notice The stream objects identifiable by their unsigned integer ids.
     */
    mapping(uint256 => Types.AztecStream) private streams;

    /*** Events ***/

    event CreateStream(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        address zkAsset,
        bytes32 noteHash,
        uint256 startTime,
        uint256 stopTime
    );

    event WithdrawFromStream(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        bytes32 noteHash,
        uint256 withdrawDuration
    );

    event CancelStream(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 cancelDuration
    );

    /*** Modifiers ***/

    /**
     * @dev Throws if the caller is not the sender of the recipient of the stream.
     */
    modifier onlySenderOrRecipient(uint256 streamId) {
        require(
            msg.sender == streams[streamId].sender ||
                msg.sender == streams[streamId].recipient,
            'caller is not the sender or the recipient of the stream'
        );
        _;
    }

    /**
     * @dev Throws if the caller is not the recipient of the stream.
     */
    modifier onlyRecipient(uint256 streamId) {
        require(
            msg.sender == streams[streamId].recipient,
            'caller is not the recipient of the stream'
        );
        _;
    }

    /**
     * @dev Throws if the provided id does not point to a valid stream.
     */
    modifier streamExists(uint256 streamId) {
        require(streams[streamId].isEntity, 'stream does not exist');
        _;
    }

    /*** Contract Logic Starts Here */

    constructor(address _aceContractAddress) public {
        require(
            _aceContractAddress != address(0x00),
            'ACE contract is the zero address'
        );
        aceContractAddress = _aceContractAddress;
        nextStreamId = 1;
    }

    /*** View Functions ***/

    /**
     * @notice Returns the compounding stream with all its properties.
     * @dev Throws if the id does not point to a valid stream.
     * @param streamId The id of the stream to query.
     * @return The stream object.
     */
    function getStream(uint256 streamId)
        external
        view
        streamExists(streamId)
        returns (
            address sender,
            address recipient,
            bytes32 noteHash,
            address tokenAddress,
            uint256 startTime,
            uint256 lastWithdrawTime,
            uint256 stopTime
        )
    {
        sender = streams[streamId].sender;
        recipient = streams[streamId].recipient;
        noteHash = streams[streamId].noteHash;
        tokenAddress = address(streams[streamId].tokenAddress);
        startTime = streams[streamId].startTime;
        lastWithdrawTime = streams[streamId].lastWithdrawTime;
        stopTime = streams[streamId].stopTime;
    }

    /*** Public Effects & Interactions Functions ***/

    /**
     * @notice Creates a new stream funded by `msg.sender` and paid towards `recipient`.
     * @dev Throws if paused.
     *  Throws if the recipient is the zero address, the contract itself or the caller.
     *  Throws if the start time is before `block.timestamp`.
     *  Throws if the stop time is before the start time.
     *  Throws if the duration calculation has a math error.
     *  Throws if the next stream id calculation has a math error.
     *  Throws if the contract is not allowed to transfer enough tokens.
     *  Throws if there is a token transfer failure.
     * @param recipient The address towards which the money is streamed.
     * @param proof The JoinSplit proof transfering a zkAsset to be streamed.
     * @param tokenAddress The zkAsset to use as streaming currency.
     * @param startTime The unix timestamp for when the stream starts.
     * @param stopTime The unix timestamp for when the stream stops.
     * @return The uint256 id of the newly created stream.
     */
    function createStream(
        address recipient,
        bytes memory proof,
        bytes memory proofSignature,
        address tokenAddress,
        uint256 startTime,
        uint256 stopTime
    ) public whenNotPaused returns (uint256) {
        require(recipient != address(0x00), 'stream to the zero address');
        require(recipient != address(this), 'stream to the contract itself');
        require(recipient != msg.sender, 'stream to the caller');
        require(
            startTime >= block.timestamp, // solium-disable-line security/no-block-members
            'start time before block.timestamp'
        );
        require(stopTime > startTime, 'Stream duration not greater than zero');

        // Transfer the ZkAsset to the streaming contract
        bytes32 streamNoteHash = StreamUtilities._processDeposit(
            proof,
            proofSignature,
            aceContractAddress,
            msg.sender,
            recipient,
            tokenAddress
        );

        /* Create and store the stream object. */
        uint256 streamId = nextStreamId;
        streams[streamId] = Types.AztecStream({
            noteHash: streamNoteHash,
            sender: msg.sender,
            recipient: recipient,
            startTime: startTime,
            stopTime: stopTime,
            lastWithdrawTime: startTime,
            tokenAddress: tokenAddress,
            isEntity: true
        });

        /* Increment the next stream id. */
        nextStreamId = nextStreamId.add(1);

        emit CreateStream(
            streamId,
            msg.sender,
            recipient,
            tokenAddress,
            streamNoteHash,
            startTime,
            stopTime
        );

        return streamId;
    }

    function withdrawFromStream(
        uint256 streamId,
        bytes memory _proof1, // Dividend Proof
        bytes memory _proof2, // Join-Split Proof
        uint256 _streamDurationToWithdraw
    ) public nonReentrant streamExists(streamId) onlyRecipient(streamId) {
        Types.AztecStream storage stream = streams[streamId];

        // First check that this isn't a zero value withdrawal
        require(_streamDurationToWithdraw > 0, 'zero value withdrawal');

        // Check that fraction to withdraw isn't greater than fraction of time passed
        require(
            stream.lastWithdrawTime.add(_streamDurationToWithdraw) <
                block.timestamp, // solium-disable-line security/no-block-members
            'withdraw is greater than allowed'
        );

        // Check that value of withdrawal matches the fraction given by the above timestamp
        bytes32 withdrawalNoteHash = StreamUtilities._validateRatioProof(
            aceContractAddress,
            _proof1,
            _streamDurationToWithdraw,
            stream
        );

        // Check that withdrawal transaction is valid and perform transfer
        // i.e. change note remains on contract, sender and recipient have view access, etc.
        bytes32 newNoteHash = StreamUtilities._processWithdrawal(
            aceContractAddress,
            _proof2,
            withdrawalNoteHash,
            stream
        );

        // Update stream information
        stream.noteHash = newNoteHash;
        stream.lastWithdrawTime = stream.lastWithdrawTime.add(
            _streamDurationToWithdraw
        );

        emit WithdrawFromStream(
            streamId,
            stream.sender,
            stream.recipient,
            newNoteHash,
            _streamDurationToWithdraw
        );
    }

    /**
     * @notice Cancels the stream and transfers the tokens back on a pro rata basis.
     * @dev Throws if the id does not point to a valid stream.
     *  Throws if the caller is not the sender or the recipient of the stream.
     *  Throws if there is a token transfer failure.
     * @param streamId The id of the stream to cancel.
     * @param _proof1 The Dividend proof where the first output note goes to the stream recipient
     * @param _proof2 The Join-Split proof where the first output note goes to the stream recipient
     * @param _unclaimedTime The amount of time corresponding to the value being sent to the recipient
     * @return bool true=success, otherwise false.
     */
    function cancelStream(
        uint256 streamId,
        bytes calldata _proof1, // Dividend Proof
        bytes calldata _proof2, // Join-Split Proof
        uint256 _unclaimedTime
    )
        external
        nonReentrant
        streamExists(streamId)
        onlySenderOrRecipient(streamId)
        returns (bool)
    {
        Types.AztecStream storage stream = streams[streamId];

        // If the stream has been fully withdrawn then we can skip
        // withdrawing the stream note and just delete the stream
        if (stream.lastWithdrawTime == stream.stopTime) {
            return _cancelStreamInternal(streamId, 0);
        }

        // We require the denominator of ratio proof to be nonzero
        require(_unclaimedTime > 0, 'cancellation with zero unclaimed time');

        // Otherwise check that cancelling party isn't trying to scam the other
        // Each party can only cancel from a timestamp favourable to the other party.
        // This ensure that it is close to the true time.
        if (msg.sender == stream.sender) {
            // Sender can only cancel from a timestamp which hasn't already passed
            // unless giving full value of stream to recipient
            require(
                // solium-disable-next-line security/no-block-members
                stream.lastWithdrawTime.add(_unclaimedTime) > block.timestamp ||
                    stream.lastWithdrawTime.add(_unclaimedTime) ==
                    stream.stopTime,
                'sender receives too much from cancellation'
            );
        } else if (msg.sender == stream.recipient) {
            // Recipient can only cancel from a timestamp which has already passed
            require(
                // solium-disable-next-line security/no-block-members
                stream.lastWithdrawTime.add(_unclaimedTime) < block.timestamp,
                'recipient receives too much from cancellation'
            );
        }

        // Check that value of withdrawal matches the fraction given by the above timestamp
        bytes32 withdrawalNoteHash = StreamUtilities._validateRatioProof(
            aceContractAddress,
            _proof1,
            _unclaimedTime,
            stream
        );

        // Check that cancellation transaction is valid and perform transfer
        // i.e. Each party receives a note of correct value
        StreamUtilities._processCancelation(
            aceContractAddress,
            _proof2,
            withdrawalNoteHash,
            stream
        );

        return _cancelStreamInternal(streamId, _unclaimedTime);
    }

    function _cancelStreamInternal(uint256 _streamId, uint256 _withdrawalTime)
        internal
        returns (bool)
    {
        Types.AztecStream storage stream = streams[_streamId];

        emit CancelStream(
            _streamId,
            stream.sender,
            stream.recipient,
            _withdrawalTime
        );
        delete streams[_streamId];
        return true;
    }
}
