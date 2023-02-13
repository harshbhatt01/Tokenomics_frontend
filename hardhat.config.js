 require("@nomiclabs/hardhat-ethers");
 require("@nomiclabs/hardhat-waffle");
 require("solidity-coverage");
 require("@nomiclabs/hardhat-web3");
 require("@nomiclabs/hardhat-truffle5");
 module.exports = {
   solidity: "0.8.17",
   networks: {
    goerli: {
      url: `https://goerli.infura.io/v3/cd7739e1d7bd4587bcdd6bf1144b03fb`,
      accounts: ['f6346f3979c9aa7b96e4c9203ff21d994c888a544e265f7f7778629c4e6f8d86']
    }
  }
 };
