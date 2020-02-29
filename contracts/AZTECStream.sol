pragma solidity 0.5.11;

// import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/ReentrancyGuard.sol";

import "./CarefulMath.sol";
import "./StreamUtilities.sol";

// import "./OwnableWithoutRenounce.sol";
// import "./PausableWithoutRenounce.sol";


import "./Types.sol";

/**
 * @title Sablier's Money Streaming
 * @author Sablier
 */
contract Sablier is CarefulMath, ReentrancyGuard {
   
    /*** Storage Properties ***/

    uint24 constant DIVIDEND_PROOF= 66561;


    address aceContractAddress;
    /**
     * @notice In Exp terms, 1e18 is 1, or 100%
     */
    uint256 constant hundredPercent = 1e18;

    /**
     * @notice In Exp terms, 1e16 is 0.01, or 1%
     */
    uint256 constant onePercent = 1e16;

    /**
     * @notice Counter for new stream ids.
     */
    uint256 public nextStreamId;

    /**
     * @notice The stream objects identifiable by their unsigned integer ids.
     */
    mapping(uint256 => Types.AztecStream) private streams;

    /*** Events ***/
    
    event CreateStream(uint256 streamId, address sender, address recipient);

    event WithdrawFromStream(uint256 streamId, address sender, address recipient);

    event CancelStream(uint256 streamId, address sender, address recipient);


    /*** Modifiers ***/

    /**
     * @dev Throws if the caller is not the sender of the recipient of the stream.
     */
    modifier onlySenderOrRecipient(uint256 streamId) {
        require(
            msg.sender == streams[streamId].sender || msg.sender == streams[streamId].recipient,
            "caller is not the sender or the recipient of the stream"
        );
        _;
    }

    /**
     * @dev Throws if the provided id does not point to a valid stream.
     */
    modifier streamExists(uint256 streamId) {
        require(streams[streamId].isEntity, "stream does not exist");
        _;
    }

    /*** Contract Logic Starts Here */

    constructor(address _aceContractAddress) public {        
        // OwnableWithoutRenounce.initialize(msg.sender);
        // PausableWithoutRenounce.initialize(msg.sender);
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
            bytes32 currentBalance,
            address tokenAddress,
            uint256 startTime,
            uint256 stopTime
        )
    {
        sender = streams[streamId].sender;
        recipient = streams[streamId].recipient;
        currentBalance = streams[streamId].currentBalance;
        tokenAddress = address(streams[streamId].tokenAddress);
        startTime = streams[streamId].startTime;
        stopTime = streams[streamId].stopTime;
    }

    struct withdrawFromStreamLocalVars {
        MathError mathErr;
        uint256 newWithdrawalTime;
    }

    function withdrawFromStream(
        uint256 streamId,
        bytes memory _proof1, // Dividend Proof
        bytes memory _proof2, // Join-Split Proof
        uint256 _streamDurationToWithdraw
      ) public streamExists(streamId) onlySenderOrRecipient(streamId) {
        
        Types.AztecStream storage stream = streams[streamId];
        
        (,bytes memory _proof1OutputNotes) = StreamUtilities._validateRatioProof(_proof1, _streamDurationToWithdraw, stream);

        withdrawFromStreamLocalVars memory vars;
        (vars.mathErr, vars.newWithdrawalTime) = addUInt(_streamDurationToWithdraw, stream.lastWithdrawTime);
        /* `subUInt` can only return MathError.INTEGER_UNDERFLOW but we know `stopTime` is higher than `startTime`. */
        assert(vars.mathErr == MathError.NO_ERROR);
        require(vars.newWithdrawalTime < block.timestamp, 'withdraw is greater than allowed');

        (bytes32 newCurrentBalanceNoteHash) = StreamUtilities._processWithdrawal(_proof2, _proof1OutputNotes, stream);

        stream.currentBalance = newCurrentBalanceNoteHash;
        stream.lastWithdrawTime = vars.newWithdrawalTime;

        emit WithdrawFromStream(streamId, stream.sender, stream.recipient);
      }

    /*** Public Effects & Interactions Functions ***/

    struct CreateStreamLocalVars {
        MathError mathErr;
    }

    /**
     * @notice Creates a new stream funded by `msg.sender` and paid towards `recipient`.
     * @dev Throws if paused.
     *  Throws if the recipient is the zero address, the contract itself or the caller.
     *  Throws if the start time is before `block.timestamp`.
     *  Throws if the stop time is before the start time.
     *  Throws if the duration calculation has a math error.
     *  Throws if the rate calculation has a math error.
     *  Throws if the next stream id calculation has a math error.
     *  Throws if the contract is not allowed to transfer enough tokens.
     *  Throws if there is a token transfer failure.
     * @param recipient The address towards which the money is streamed.
     * @param notehash The note of a zkAsset to be streamed.
     * @param tokenAddress The ERC20 token to use as streaming currency.
     * @param startTime The unix timestamp for when the stream starts.
     * @param stopTime The unix timestamp for when the stream stops.
     * @return The uint256 id of the newly created stream.
     */
    function createStream(address recipient, bytes32 notehash, address tokenAddress, uint256 startTime, uint256 stopTime)
        public
        returns (uint256)
    {
        require(recipient != address(0x00), "stream to the zero address");
        require(recipient != address(this), "stream to the contract itself");
        require(recipient != msg.sender, "stream to the caller");
        require(startTime >= block.timestamp, "start time before block.timestamp");
        require(stopTime > startTime, "stop time before the start time");


        /* Create and store the stream object. */
        uint256 streamId = nextStreamId;
        streams[streamId] = Types.AztecStream({
            currentBalance: notehash,
            sender: msg.sender,
            recipient: recipient,
            startTime: startTime,
            stopTime: stopTime,
            lastWithdrawTime: startTime,
            tokenAddress: tokenAddress,
            aceContractAddress: aceContractAddress,
            isEntity: true
        });
        
        CreateStreamLocalVars memory vars;
        /* Increment the next stream id. */
        (vars.mathErr, nextStreamId) = addUInt(nextStreamId, uint256(1));
        require(vars.mathErr == MathError.NO_ERROR, "next stream id calculation error");

        // require(ZkAsset(tokenAddress).confidentialTransferFrom(_proof, _proofOutput), "ZKAsset transfer failure");
        emit CreateStream(streamId, msg.sender, recipient);
        return streamId;
    }

    struct CancelStreamLocalVars {
        MathError mathErr;
        uint256 cancellationTime;
    }

    /**
     * @notice Cancels the stream and transfers the tokens back on a pro rata basis.
     * @dev Throws if the id does not point to a valid stream.
     *  Throws if the caller is not the sender or the recipient of the stream.
     *  Throws if there is a token transfer failure.
     * @param streamId The id of the stream to cancel.
     * @return bool true=success, otherwise false.
     */
    function cancelStream(
        uint256 streamId,
        bytes calldata _proof1, // Dividend Proof
        bytes calldata _proof2, // Join-Split Proof)
        uint256 _unclaimedTime
        )
        external
        nonReentrant
        streamExists(streamId)
        onlySenderOrRecipient(streamId)
        returns (bool)
    {
        Types.AztecStream storage stream = streams[streamId];

        (,bytes memory _proof1OutputNotes) = StreamUtilities._validateRatioProof(_proof1, _unclaimedTime, stream);

        CancelStreamLocalVars memory vars;
        (vars.mathErr, vars.cancellationTime) = addUInt(_unclaimedTime, stream.lastWithdrawTime);
        /* `subUInt` can only return MathError.INTEGER_UNDERFLOW but we know `stopTime` is higher than `startTime`. */
        assert(vars.mathErr == MathError.NO_ERROR);
        if (msg.sender == stream.sender){
            require(vars.cancellationTime < block.timestamp, 'withdraw is greater than allowed');
        } else if (msg.sender == stream.recipient){
            require(vars.cancellationTime > block.timestamp, 'withdraw is greater than allowed'); 
        } 

        StreamUtilities._processCancelation(_proof2, _proof1OutputNotes, stream);

        delete streams[streamId];
        emit CancelStream(streamId, stream.sender, stream.recipient);
        return true;
    }

    /*** Internal Effects & Interactions Functions ***/

}