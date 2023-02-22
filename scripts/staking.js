const { ethers, artifacts } = require("hardhat");
const { modules } = require("web3");
const { signMessage } = require('../scripts/sign');

const stackingContract = artifacts.require("contracts/stacking.sol:StakingToken");
const rewardsContract = artifacts.require("contracts/rewards.sol:rewardPool");
const tokenContract = artifacts.require("Volary");
const lpContract = artifacts.require("contracts/lpContract.sol:lpToken");
const oracleContract = artifacts.require("contracts/oracle.sol:priceFeed");
const provider = new ethers.providers.JsonRpcProvider();

const providerJson = { provider }

const deployContracts = async() => {

    try{

    // console.log("provider deployed --- ", provider)
    //Token contract ----------------------------------------------------------------------------
    const _token_contract = await tokenContract.new()


    console.log(
        "Token Address :", _token_contract.address
    );
     
    //Token contract ----------------------------------------------------------------------------
    const _oracle_contract = await oracleContract.new()


    console.log(
        "Oracle Address :", _oracle_contract.address
    );
    //LP contract ----------------------------------------------------------------------------
    const _lp_contract = await lpContract.new()


    console.log(
        "Lp Token Address :", _lp_contract.address
    );


    
    
    //Staking contract ----------------------------------------------------------------------------
    
    const _staking_contract = await stackingContract.new(_token_contract.address,_lp_contract.address,_oracle_contract.address);

    console.log(
        "Staking Contract Address: ", _staking_contract.address
    );
    
    //Reward contract -----------------------------------------------------------------------------
    const _reward_contract = await rewardsContract.new(_token_contract.address,_staking_contract.address,'0x5B38Da6a701c568545dCfcB03FcB875f56beddC4','0x5B38Da6a701c568545dCfcB03FcB875f56beddC4','0x5B38Da6a701c568545dCfcB03FcB875f56beddC4');


    console.log(
        "RewardPool Contract Address: ", _reward_contract.address
    );
    return {
        VolaryContractAddress : _token_contract.address,
        lpContractAddress : _lp_contract.address,
        StakingContractAddress : _staking_contract.address,
        RewardPoolContractAddress : _reward_contract.address,
        oracleContractAddress : _oracle_contract.address
    }
} catch (e) {
    console.error(e);
}
}


  module.exports = {
      providerJson,
      deployContracts
  }