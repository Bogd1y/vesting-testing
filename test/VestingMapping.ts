import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

const ONE_YEAR = 365 * 24 * 60 * 60;

describe("VestingMapping", function () {
  async function deployOneYearLockFixture() {

    const [owner, otherAccount] = await hre.ethers.getSigners();
    const signers = await hre.ethers.getSigners();

    const VestingMapping = await hre.ethers.getContractFactory("VestingMapping");
    const VMcontract = await VestingMapping.deploy()

    return { VMcontract, owner, otherAccount, signers };
  }


  describe("Work", function () {
    it("Should be ok", async function () {
      const { VMcontract, otherAccount, signers } = await loadFixture(deployOneYearLockFixture);
      
      const numAdditionalSigners = 100;
      const tokenToAddress = 100;


      for (let i = 0; i < signers.length; i++) {
        await VMcontract.addTokenToAddress(signers[i].address, tokenToAddress);
      }

      await time.increase(ONE_YEAR * 2);

      for (let i = 0; i < signers.length; i++) {

        expect(await VMcontract.connect(signers[i]).claim()).to.emit(VMcontract, "TokenClaimed")
      }
      
      expect(await VMcontract.totalSupply()).to.be.equal(numAdditionalSigners * tokenToAddress);
    });
    it("Should not be ok", async function () {
      const { VMcontract, otherAccount, signers } = await loadFixture(deployOneYearLockFixture);
      
      const numAdditionalSigners = 100;
      const tokenToAddress = 100;


      for (let i = 0; i < signers.length; i++) {
        await VMcontract.addTokenToAddress(signers[i].address, tokenToAddress);
      }

      for (let i = 0; i < signers.length; i++) {

        await expect(VMcontract.connect(signers[i]).claim()).to.be.revertedWith("Cliff man, cliff...")
      }
      
      expect(await VMcontract.totalSupply()).to.be.equal(0);
    });
  });

})