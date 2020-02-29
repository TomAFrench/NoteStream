pragma solidity 0.5.11;

/**
 * @title Sablier Types
 * @author Sablier
 */
library Types {
    struct AztecStream {
        bytes32 currentBalance;
        uint256 startTime;
        uint256 lastWithdrawTime;
        uint256 stopTime;
        address recipient;
        address sender;
        // address tokenAddress;
        address aceContractAddress;
        bool isEntity;
    }
}
