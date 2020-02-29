pragma solidity 0.5.11;

// import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/ReentrancyGuard.sol";

import "./CarefulMath.sol";
import "./StreamUtilities.sol";

// import "./OwnableWithoutRenounce.sol";
// import "./PausableWithoutRenounce.sol";

import "./interfaces/ICERC20.sol";
import "./interfaces/IZkAsset.sol";

import "./Types.sol";

/**
 * @title Sablier's Money Streaming
 * @author Sablier
 */
contract Sablier is CarefulMath, ReentrancyGuard {
   
    /*** Storage Properties ***/

    uint24 constant DIVIDEND_PROOF= 66561;

    /**
     * @notice In Exp terms, 1e18 is 1, or 100%
     */
    uint256 constant hundredPercent = 1e18;

    /**
     * @notice In Exp terms, 1e16 is 0.01, or 1%
     */
    uint256 constant onePercent = 1e16;

    /**
     * @notice The amount of interest has been accrued per token address.
     */
    mapping(address => uint256) private earnings;

    /**
     * @notice Counter for new stream ids.
     */
    uint256 public nextStreamId;

    /**
     * @notice The stream objects identifiable by their unsigned integer ids.
     */
    mapping(uint256 => Types.AztecStream) private streams;

    /*** Events ***/

    event WithdrawFromStream(uint256 streamId, address recipient);

    event CancelStream(uint256 streamId);


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

    constructor() public {        
        // OwnableWithoutRenounce.initialize(msg.sender);
        // PausableWithoutRenounce.initialize(msg.sender);
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
            bytes32 notehash,
            address tokenAddress,
            uint256 startTime,
            uint256 stopTime
        )
    {
        sender = streams[streamId].sender;
        recipient = streams[streamId].recipient;
        notehash = streams[streamId].notehash;
        tokenAddress = streams[streamId].tokenAddress;
        startTime = streams[streamId].startTime;
        stopTime = streams[streamId].stopTime;
    }

    /**
     * @notice Returns either the delta in seconds between `block.timestamp` and `startTime` or
     *  between `stopTime` and `startTime, whichever is smaller. If `block.timestamp` is before
     *  `startTime`, it returns 0.
     * @dev Throws if the id does not point to a valid stream.
     * @param streamId The id of the stream for which to query the delta.
     * @return The time delta in seconds.
     */
    function deltaOf(uint256 streamId) public view streamExists(streamId) returns (uint256 delta) {
        Types.AztecStream memory stream = streams[streamId];
        if (block.timestamp <= stream.startTime) return 0;
        if (block.timestamp < stream.stopTime) return block.timestamp - stream.startTime;
        return stream.stopTime - stream.startTime;
    }

    struct proRataShareLocalVars {
        MathError mathErr;
    }

    function withdrawFromStream(
        uint256 streamId,
        bytes memory _proof1, // Dividend Proof
        bytes memory _proof2, // Join-Split Proof
        uint256 _streamDurationToWithdraw
      ) public streamExists(streamId) onlySenderOrRecipient(streamId) {
        
        Types.AztecStream memory stream = streams[streamId];
        
        (,bytes memory _proof1OutputNotes) = stream._validateRatioProof(_proof1, _streamDurationToWithdraw, stream);

        require(_streamDurationToWithdraw.add(stream.lastWithdrawTime) < block.timestamp, 'withdraw is greater than allowed');

        (bytes32 newCurrentBalanceNoteHash) = stream._processWithdrawal(_proof2, _proof1OutputNotes, stream);

        stream.currentBalance = newCurrentBalanceNoteHash;
        stream.lastWithdrawTime = stream.lastWithdrawTime.add(_streamDurationToWithdraw);

        emit WithdrawFromStream(streamId, stream.recipient);
      }

    /*** Public Effects & Interactions Functions ***/

    struct CreateStreamLocalVars {
        MathError mathErr;
        uint256 duration;
        uint256 ratePerSecond;
    }

    /**
     * @notice Creates a new stream funded by `msg.sender` and paid towards `recipient`.
     * @dev Throws if paused.
     *  Throws if the recipient is the zero address, the contract itself or the caller.
     *  Throws if the deposit is 0.
     *  Throws if the start time is before `block.timestamp`.
     *  Throws if the stop time is before the start time.
     *  Throws if the duration calculation has a math error.
     *  Throws if the deposit is smaller than the duration.
     *  Throws if the deposit is not a multiple of the duration.
     *  Throws if the rate calculation has a math error.
     *  Throws if the next stream id calculation has a math error.
     *  Throws if the contract is not allowed to transfer enough tokens.
     *  Throws if there is a token transfer failure.
     * @param recipient The address towards which the money is streamed.
     * @param deposit The amount of money to be streamed.
     * @param tokenAddress The ERC20 token to use as streaming currency.
     * @param startTime The unix timestamp for when the stream starts.
     * @param stopTime The unix timestamp for when the stream stops.
     * @return The uint256 id of the newly created stream.
     */
    // function createStream(address recipient, bytes32 noteproof, address tokenAddress, uint256 startTime, uint256 stopTime)
    //     public
    //     whenNotPaused
    //     returns (uint256)
    // {
    //     require(recipient != address(0x00), "stream to the zero address");
    //     require(recipient != address(this), "stream to the contract itself");
    //     require(recipient != msg.sender, "stream to the caller");
    //     require(startTime >= block.timestamp, "start time before block.timestamp");
    //     require(stopTime > startTime, "stop time before the start time");

    //     CreateStreamLocalVars memory vars;
    //     (vars.mathErr, vars.duration) = subUInt(stopTime, startTime);
    //     /* `subUInt` can only return MathError.INTEGER_UNDERFLOW but we know `stopTime` is higher than `startTime`. */
    //     assert(vars.mathErr == MathError.NO_ERROR);

    //     /* Create and store the stream object. */
    //     uint256 streamId = nextStreamId;
    //     streams[streamId] = Types.AztecStream({
    //         deposit: deposit,
    //         isEntity: true,
    //         recipient: recipient,
    //         sender: msg.sender,
    //         startTime: startTime,
    //         stopTime: stopTime,
    //         tokenAddress: tokenAddress
    //     });

    //     /* Increment the next stream id. */
    //     (vars.mathErr, nextStreamId) = addUInt(nextStreamId, uint256(1));
    //     require(vars.mathErr == MathError.NO_ERROR, "next stream id calculation error");

    //     require(ZkAsset(tokenAddress).confidentialTransferFrom(_proof, _proofOutput), "ZKAsset transfer failure");
    //     emit CreateStream(streamId, msg.sender, recipient, tokenAddress, startTime, stopTime);
    //     return streamId;
    // }

    // /**
    //  * @notice Cancels the stream and transfers the tokens back on a pro rata basis.
    //  * @dev Throws if the id does not point to a valid stream.
    //  *  Throws if the caller is not the sender or the recipient of the stream.
    //  *  Throws if there is a token transfer failure.
    //  * @param streamId The id of the stream to cancel.
    //  * @return bool true=success, otherwise false.
    //  */
    // function cancelStream(uint256 streamId)
    //     external
    //     nonReentrant
    //     streamExists(streamId)
    //     onlySenderOrRecipient(streamId)
    //     returns (bool)
    // {
    //     cancelStreamInternal(streamId);
    //     return true;
    // }

    /*** Internal Effects & Interactions Functions ***/

    struct WithdrawFromStreamInternalLocalVars {
        MathError mathErr;
    }

    /**
     * @notice Makes the withdrawal to the recipient of the stream.
     * @dev If the stream balance has been depleted to 0, the stream object is deleted
     *  to save gas and optimise contract storage.
     *  Throws if the stream balance calculation has a math error.
     *  Throws if there is a token transfer failure.
     */
    function withdrawFromStreamInternal(uint256 streamId, uint256 amount) internal {
        Types.AztecStream memory stream = streams[streamId];
        WithdrawFromStreamInternalLocalVars memory vars;
        
        emit WithdrawFromStream(streamId, stream.recipient);
    }
   
    /**
     * @notice Cancels the stream and transfers the tokens back on a pro rata basis.
     * @dev The stream and compounding stream vars objects get deleted to save gas
     *  and optimise contract storage.
     *  Throws if there is a token transfer failure.
     */
    function cancelStreamInternal(uint256 streamId) internal {
        Types.AztecStream memory stream = streams[streamId];

        delete streams[streamId];

        emit CancelStream(streamId);
    }
}