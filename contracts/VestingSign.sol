  // SPDX-License-Identifier: UNLICENSED
  pragma solidity ^0.8.24;

  import "./Token.sol";
  import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
  import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

  //! so we don't store signature here only verifying if's valid and giving user what his need
  contract VestingSigning is Token(msg.sender) {

    uint cliffTime = 0;
    mapping(bytes => bool) claimedSignature;

    event TokenClaimed(address, uint);

    constructor() {
      cliffTime = block.timestamp + 60 * 60 * 24 * 730; // 2 years
    }

    function prefixed(bytes32 hash) internal pure returns (bytes32) {
      return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    function claim(bytes calldata signature, uint amount) public {
      // ! only call from trasted address
      require(claimedSignature[signature] == false, "You did take your stuff");
      require(block.timestamp >= cliffTime, "Cliff time!");

      bytes32 messageHash = keccak256(abi.encodePacked(amount));

      require(msg.sender == ECDSA.recover(prefixed(messageHash), signature), "Not valid sign");      
      
      emit TokenClaimed(msg.sender, amount); 

      claimedSignature[signature] = true;
      _update(address(0), msg.sender, amount);
    }

  }