const  { ethers , config } = require("hardhat");
const { providerJson, deployContracts }  = require('./staking')
const { rewardPoolABI , stakingABI , volaryABI , lpABI} = require('./abi');
const { signMessage } = require('../scripts/sign');
const express = require("express");
const app = express();
const bodyParser = require("body-parser");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});



let VolaryContractAddress,StakingContractAddress,RewardPoolContractAddress,lpContractAddress;


const provider = providerJson.provider;
let VolaryContract,StakingContract,RewardContract,lpContract 

//console.log(VolaryContract);

// async function main() {
// const addRewardPoolAddressfunc = await StakingContract.addRewardPoolAddress(RewardPoolContractAddress)
//     console.log("added reward pool-> ",addRewardPoolAddressfunc);
// }
// main()
app.get('/deploy',async(req,res)=>{
  try{
    const addresses = await deployContracts();
    VolaryContractAddress = addresses.VolaryContractAddress
    StakingContractAddress = addresses.StakingContractAddress
    RewardPoolContractAddress = addresses.RewardPoolContractAddress
    lpContractAddress = addresses.lpContractAddress;
    VolaryContract = new ethers.Contract(VolaryContractAddress, volaryABI, provider);
    StakingContract = new ethers.Contract(StakingContractAddress, stakingABI, provider);
    RewardContract = new ethers.Contract(RewardPoolContractAddress, rewardPoolABI, provider);
    lpContract = new ethers.Contract(lpContractAddress, lpABI, provider);

    res.send({ status : 200 , message : "contracts deployed"})
  }
  catch(err){

    console.log("error ---",err);
      res.send({ status: 400, message : err.message });

  }
})
app.get("/AddRewardPool", async (req, res) => {
    try{
    const signers = await ethers.getSigners();
    const tx = await StakingContract.connect(signers[0]).addRewardPoolAddress(RewardPoolContractAddress,{ gasLimit : 2100000});
    //console.log("tx is ",tx)
    //const approvefunc = await VolaryContract.approve(StakingContractAddress, 1000000)
    //await RewardContract.startPool()
    res.send({ status : 200 , message : "reward pool added successfully",hash : tx.hash});
  }
    catch(err){
      console.log("error ---",err);
      res.send({ status: 400, message : err.message });
    }
  });

app.get("/volaryFaucet",async(req,res)=>{
  try{
  const index = req.body.index || 1;
  const isLp = req.body.isLp  || false;
  const signers = await ethers.getSigners();
  let tx,balance
  if(isLp){
    tx = await lpContract.connect(signers[0]).getLpTokens(signers[index].address,"100000000000000000000");
    balance = await lpContract.connect(signers[index]).balanceOf(signers[index].address);
  } 
  else{
    tx = await VolaryContract.connect(signers[0]).transfer(signers[index].address,"100000000000000000000");
    balance = await VolaryContract.connect(signers[index]).balanceOf(signers[index].address);
  }  
  //console.log(signers[1].address);
  
  balance = balance * 10 ** -18;
  balance = balance.toString();
  res.send({ status : 200 , message : "faucet transfer successfull", hash : tx.hash , balance })
  }
  catch(err){
    console.log("error ---",err);
    res.send({ status: 400, message : err.message });
  }
})

app.get("/approve",async(req,res)=> {
  try{
    const signers = await ethers.getSigners();
    const index = req.body.index || 1;
    const isLp = req.body.isLp  || false;
    const amount = req.body.amount || "100000000000000000000";
    let tx
    if(isLp) tx = await lpContract.connect(signers[index]).approve(StakingContractAddress,amount);
    else tx = await VolaryContract.connect(signers[index]).approve(StakingContractAddress,amount);
     
    res.send({ status : 200, message : "approval successful", hash : tx.hash})
  }
  catch(err){
    console.log("error ---",err);
    res.send({ status: 400, message : err.message });
  }
  
})

app.post("/CreateStake", async (req,res) =>{
    let stake_amount = req.body.amount  ;
    const isLp = req.body.isLp  || false;
    const signers = await ethers.getSigners();
    const index = req.body.index || 1;
    const duration = req.body.duration;
    const tx = await StakingContract.connect(signers[index]).createStake(stake_amount,duration,isLp);
    res.send({ status : 200 , message : `stake created successfully`, hash : tx.hash})
});

app.get("/getBalanceofStake", async (req,res) =>{
    const signers = await ethers.getSigners();
    const stakeId = req.body.index || 0;
    let balance = await StakingContract.getStakeAmount(stakeId);
    balance = balance * 10 ** -18;
    balance = balance.toString();
    res.send({ status : 200 , message : `stake balance fetched successfully`, balance})
});

app.get("/startPool",async (req,res) => {
  const signers = await ethers.getSigners();
  const tx = await RewardContract.connect(signers[0]).startPool();
  res.send({ status : 200 , message : `reward pool started`, hash : tx.hash})
})



app.get("/SignRewards", async (req,res) => {
    
    const signers = await ethers.getSigners();
    const index = req.body.index || 1;
    const stakeId = req.body.stakeId || 0;
    const currentEpoch = await RewardContract.CURRENT_EPOCH();
    const netId = await RewardContract.getChainId();
    let stakeRewards = req.body.rewards || "5000000000000000000";
    epochTime = 604800;
    const wallets = config.networks.hardhat.accounts;
    const index1 = 0; // first wallet, increment for next wallets
    const wallet1 = ethers.Wallet.fromMnemonic(wallets.mnemonic, wallets.path + `/${index1}`);
    let privateKey = wallet1.privateKey;
    privateKey = privateKey.slice(2,);
    const signature = await signMessage(privateKey,netId.toNumber(),RewardPoolContractAddress,stakeRewards,stakeId,currentEpoch.toNumber());
    await ethers.provider.send('evm_increaseTime', [epochTime]);
    await ethers.provider.send('evm_mine');

    const tx = await RewardContract.connect(signers[index]).rewardOfStake(stakeRewards,stakeId,signature);

  

    res.send({
      status : 200,
      signature,
      rewards : stakeRewards,
      epoch : currentEpoch.toString(),
      hash : tx.hash
    })
});


app.get("/accumulatedrewards", async(req,res) => {
    const stakeId = req.body.stakeId || 0 ;
    let balance = await RewardContract.ACCUMALATED_REWARDS(stakeId);
    balance = balance * 10 ** -18;
    balance = balance.toString();
    res.send({
      status : 200,
      stakeId,
      accumalatedRewards : balance
    })
})

app.get("/removeStake",async(req,res) => {
  const stakeId = req.body.stakeId || 0 ;
  const amount = req.body.amount || "5000000000000000000";
  const signers = await ethers.getSigners();
  const index = req.body.index || 1;
  const tx = await StakingContract.connect(signers[index]).removeStake(stakeId,amount);
  res.send({
    status : 200,
    stakeId,
    removeStake : amount.toString(),
    hash : tx.hash
  })

})




const PORT = process.env.PORT || 4001;
 
app.listen(PORT, console.log(`Server started on port ${PORT}`))