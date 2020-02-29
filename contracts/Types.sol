pragma solidity 0.5.11;

import "@aztec/protocol/contracts/interfaces/IZkAsset.sol";

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
        IZkAsset tokenAddress;
        address aceContractAddress;
        bool isEntity;
    }
}
