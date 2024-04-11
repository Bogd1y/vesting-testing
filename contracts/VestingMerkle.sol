// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./Token.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract VestingMerkle is Token(msg.sender) {
  bytes32 claimMerkleRoot;
  mapping (address => bool) addressClaim;
    uint cliffTime = 0;


  struct Leaf {
    address account;
    uint amount;
  }

  constructor(bytes32 _claimMerkleRoot) {
    claimMerkleRoot = _claimMerkleRoot;
    cliffTime = block.timestamp + 60 * 60 * 24 * 730; // 2 years
  }

  function claim(uint amount, bytes32[] memory proof) external {
      require(!addressClaim[msg.sender], "Tokens already claimed");
      require(verifyProof(msg.sender, proof, amount), "Invalid proof");
      
      addressClaim[msg.sender] = true;
      _update(address(0), msg.sender, amount);
    }


  function verifyProof(address account, bytes32[] memory proof, uint amount) internal view returns (bool) {
    bytes32 leafHash = keccak256(abi.encodePacked(account, amount));    

    return MerkleProof.verify(proof, claimMerkleRoot, leafHash);
  } 
}


