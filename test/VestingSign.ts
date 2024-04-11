import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import keccak256 from "keccak256"

const ONE_YEAR = 365 * 24 * 60 * 60;

describe("VestingSigning", function () {
  async function deployOneYearLockFixture() {

    const [owner, otherAccount] = await hre.ethers.getSigners();
    const signers = await hre.ethers.getSigners();

    const VestingSigning = await hre.ethers.getContractFactory("VestingSigning");
    const VScontract = await VestingSigning.deploy()

    return { VScontract, owner, otherAccount, signers };
  }


  describe("Work", function () {
    it("should authorize and claim tokens", async function () {

      const { VScontract, signers } = await loadFixture(deployOneYearLockFixture);

      for (let i = 0; i < signers.length; i++) {

        const message = hre.ethers.solidityPacked(["uint"], [100]);
        const messageK = keccak256(message)
        
        const signature = await signers[i].signMessage(messageK);
                
        await time.increase(ONE_YEAR * 2);

        await expect(VScontract.connect(signers[i]).claim(signature, 100)).to.emit(VScontract, "Transfer");
        
        
        await expect(VScontract.connect(signers[i]).claim(signature, 100)).to.be.revertedWith("You did take your stuff");
      }
      
      expect(await VScontract.totalSupply()).to.be.equal(100*100);
    });
  });

})