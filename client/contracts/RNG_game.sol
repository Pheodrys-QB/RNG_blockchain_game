// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

/**
 * @title RNG_game by HQB
 */
contract RNG_game {
    address payable public owner;
    address[] public playersHistory;
    uint256 private nonce = 0;
    uint256 public playerStake = 0.001 ether;
    uint256 public maxWinningPercent = 50;

    struct Reward {
        uint256 reward1;
        uint256 reward2;
        uint256 reward3;
    }

    constructor() payable {
        console.log("Owner contract deployed by:", msg.sender);
        owner = payable(msg.sender);
        emit OwnerSet(address(0), owner);
    }

    // EVENTS
    event OwnerSet(address indexed oldOwner, address indexed newOwner);
    event CardDrawn(address indexed player, uint256 choice, Reward reward);
    event FundsWithdrawn();
    // MODIFIERS
    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    modifier enoughEth() {
        require(
            address(this).balance >= 0.002 ether,
            "Not enough ETH in contract"
        );
        _;
    }

    // OWNER FUNCTIONS
    function changeOwner(address newOwner) external isOwner {
        emit OwnerSet(owner, newOwner);
        owner = payable(newOwner);
    }

    function withdrawAllFunds() external isOwner {
        (bool isSuccess, ) = owner.call{value: address(this).balance}("");
        require(isSuccess, "Transfer funds to owner fail");
        emit FundsWithdrawn();
    }

    // UTILITIES
    function addPlayer(address player) internal {
        playersHistory.push(player);
    }

    function random(
        uint256 min,
        uint256 max,
        address seed
    ) internal returns (uint256) {
        uint256 randomNumber = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    block.number,
                    block.coinbase,
                    seed,
                    msg.sender,
                    nonce
                )
            )
        );
        nonce++;
        return min + (randomNumber % (max - min + 1));
    }

    function randomReward(address seed) internal returns (Reward memory) {
        uint256 maxWinning = 10 + (maxWinningPercent / 10);
        Reward memory reward = Reward(
            (random(0, maxWinning, seed) * playerStake) / 10,
            (random(0, maxWinning, seed) * playerStake) / 10,
            (random(0, maxWinning, seed) * playerStake) / 10
        );
        return reward;
    }

    receive() external payable { }

    // READ FUNCTIONS

    // PLAYER FUNCTIONS
    function drawCards(uint256 choice) external payable enoughEth {
        require(choice >= 0 && choice < 3, "Invalid choice");
        require(msg.value >= playerStake, "Not enough Eth to draw");
        playersHistory.push(msg.sender);
        address seedAddress = playersHistory[playersHistory.length / 2];
        Reward memory reward = randomReward(seedAddress);

        if (choice == 0) {
            (bool isSuccess, ) = payable(msg.sender).call{
                value: reward.reward1
            }("");
            require(isSuccess, "Transfer winning to player fail");
        } else if (choice == 1) {
            (bool isSuccess, ) = payable(msg.sender).call{
                value: reward.reward2
            }("");
            require(isSuccess, "Transfer winning to player fail");
        } else {
            (bool isSuccess, ) = payable(msg.sender).call{
                value: reward.reward3
            }("");
            require(isSuccess, "Transfer winning to player fail");
        }

        emit CardDrawn(msg.sender, choice, reward);
    }
}
