pragma solidity ^0.5.11;


/**
 * @title NoteStream Types
 * @author NoteStream
 */
library Types {
    struct AztecStream {
        bytes32 noteHash;
        uint256 startTime;
        uint256 lastWithdrawTime;
        uint256 stopTime;
        address recipient;
        address sender;
        address tokenAddress;
        bool isEntity;
    }
}
