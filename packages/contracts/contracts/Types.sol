pragma solidity ^0.5.11;

/**
 * @title Quachtli Types
 * @author Quachtli
 */
library Types {
    struct AztecStream {
        bytes32 currentBalance;
        uint256 startTime;
        uint256 lastWithdrawTime;
        uint256 stopTime;
        address recipient;
        address sender;
        address tokenAddress;
        bool isEntity;
    }
}
