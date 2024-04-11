import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
        accounts: {
            count: 100,
            // accountsBalance: 10000000000000000000000, // default value is 10000ETH in wei
        },
    },
  },
};

export default config;
