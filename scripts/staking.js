const { ethers } = require("hardhat");
const { modules } = require("web3");
const { signMessage } = require('../scripts/sign');

const stackingContract = artifacts.require("contracts/stacking.sol:StakingToken");
const rewardsContract = artifacts.require("contracts/rewards.sol:rewardPool");
const tokenContract = artifacts.require("Volary");
const provider = new ethers.providers.JsonRpcProvider();

const providerJson = { provider }

const deployContracts = async() => {

    

    console.log("provider deployed --- ", provider)
    //Token contract ----------------------------------------------------------------------------
    const _token_contract = await tokenContract.new()


    console.log(
        "Token Address :", _token_contract.address
    );
    
    
    //Staking contract ----------------------------------------------------------------------------
    
    const _staking_contract = await stackingContract.new(_token_contract.address);

    console.log(
        "Staking Contract Address: ", _staking_contract.address
    );
    
    //Reward contract -----------------------------------------------------------------------------
    const _reward_contract = await rewardsContract.new(_token_contract.address,_staking_contract.address,'0x5B38Da6a701c568545dCfcB03FcB875f56beddC4','0x5B38Da6a701c568545dCfcB03FcB875f56beddC4','0x5B38Da6a701c568545dCfcB03FcB875f56beddC4');


    console.log(
        "RewardPool Contract Address: ", _reward_contract.address
    );

    try {

    // const addRewardPoolAddressfunc = await _staking_contract.addRewardPoolAddress(_reward_contract.address)
    // console.log("added reward pool-> ",addRewardPoolAddressfunc);
    // const approvefunc = await _token_contract.approve(_staking_contract.address, 1000000)
    // console.log("approved-> ",approvefunc);

    // await _reward_contract.startPool()

    // const createStakefunc = await _staking_contract.createStake(2,86400)
    // console.log("created stake-> ",createStakefunc);

    // const balanceOfStaker = await _staking_contract.getStakeAmount(0);
    // console.log(balanceOfStaker);

    // const fireEpoch = await _reward_contract.CURRENT_EPOCH()
    // console.log(fireEpoch);

    // let netId = await _reward_contract.getChainId();
    // console.log(netId);
    
    // epochTime = 604800;
    // let stakeOneRewards = "2";
    // const wallets = config.networks.hardhat.accounts;
    // const index = 0; // first wallet, increment for next wallets
    // const wallet1 = ethers.Wallet.fromMnemonic(wallets.mnemonic, wallets.path + `/${index}`);
    // let privateKey = wallet1.privateKey;
    // privateKey = privateKey.slice(2,);
    
    // console.log(privateKey);
    // console.log(netId)

    // accounts = await web3.eth.getAccounts();
    // stakeOneSign = await signMessage(privateKey,netId.toNumber(),_reward_contract.address,stakeOneRewards,0,fireEpoch.toNumber());
    // await hre.ethers.provider.send('evm_increaseTime', [epochTime]);
    // await hre.ethers.provider.send('evm_mine');

    // const Reward = await _reward_contract.rewardOfStake(stakeOneRewards,0,stakeOneSign,{from : accounts[0]})
    // console.log(accounts[0]);
    // console.log("Reward -> ",Reward);

    // balance = await _reward_contract.ACCUMALATED_REWARDS(0);
    // console.log(balance.toString());


    // let RewardfromStakedAmount = balance.toString();
    // console.log("Reward of Staked Amount ->" ,RewardfromStakedAmount);



} catch (e) {
    console.error(e);
}
}


  module.exports = {
      providerJson,
      deployContracts
  }