// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./Token.sol";

contract VestingMapping is Token(msg.sender) {

  uint cliffTime = 0;

  mapping (address => uint) private _addressBalances;

  event TokenClaimed(address, uint);

  constructor() {
    cliffTime = block.timestamp + 60 * 60 * 24 * 730; // 2 years
  }

  function addTokenToAddress(address _address, uint _tokens) external onlyOwner {
    _addressBalances[_address] = _tokens;
  }
  
  function claim() external {
    require(block.timestamp > cliffTime, "Cliff man, cliff...");

    uint tokensToClaim = _addressBalances[msg.sender];

    require(tokensToClaim > 0, "No tokens for you man :(");

    _update(address(0), msg.sender, tokensToClaim);

    _addressBalances[msg.sender] = 0;

    emit TokenClaimed(msg.sender, tokensToClaim);
  }
}
