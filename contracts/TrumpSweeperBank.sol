// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TrumpSweeperBank {
    address public owner;
    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // User deposits funds into the contract
    function deposit() external payable {
        require(msg.value > 0, "Must send ETH to deposit");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    // Owner (backend) initiates a withdrawal to the user
    function withdraw(address user, uint256 amount) external onlyOwner {
        require(balances[user] >= amount, "Insufficient balance");
        balances[user] -= amount;
        payable(user).transfer(amount);
        emit Withdrawal(user, amount);
    }

    // View user's balance
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    // Owner can withdraw contract funds (e.g., house profits)
    function ownerWithdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient contract balance");
        payable(owner).transfer(amount);
    }
}
