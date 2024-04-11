import { ethers } from "hardhat";
import { expect } from "chai";
import { MerkleTree } from "merkletreejs"
import {
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";

const ONE_YEAR = 365 * 24 * 60 * 60;

describe("VestingMerkle", function () {
  it("should allow claiming with valid proof and not allow dublication withdraws", async function () {
    const [owner, otherAccount] = await ethers.getSigners();
    const signers = await ethers.getSigners();

    const VestingMerkle = await ethers.getContractFactory("VestingMerkle");

    let leaves:{}[] = [];

    signers.forEach(s => {
      const leaf = { account: s.address, amount: 100 };
      const leafH = ethers.solidityPackedKeccak256(['address', 'uint'], [leaf.account, leaf.amount]);
      leaves.push(leafH);
    })

    const tree = new MerkleTree(leaves, ethers.keccak256, {sort: true})

    const root = tree.getRoot()

    const vestingMerkle = await VestingMerkle.deploy(root);

    await time.increase(ONE_YEAR)

    // signers.forEach(async (s) => {
    for (let i = 0; i < signers.length; i++) {

      const leafForOwner = { account: signers[i].address, amount: 100 };
      const leafForOwnerH = ethers.solidityPackedKeccak256(['address', 'uint'], [leafForOwner.account, leafForOwner.amount]);
    
      const proof = tree.getProof(leafForOwnerH)
      const proofBytes = proof.map(p => p.data);
  
      await vestingMerkle.connect(signers[i]).claim(100, proofBytes );
  
      expect(await vestingMerkle.balanceOf(owner)).to.be.equal(100)
      
      await expect (vestingMerkle.connect(owner).claim(100, [proof[0].data])).to.be.revertedWith("Tokens already claimed");
    }

  });
});
