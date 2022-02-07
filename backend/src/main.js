import Web3 from 'web3';
import Web3Modal from 'web3modal';

import HopeNobtAbi from '../../contract/HopeNobt.abi.json';
import BroilerPlusAbi from '../../contract/BroilerPlus.abi.json';
import DistributorAbi from '../../contract/Distributor.abi.json';

//Contract address
const HopeNobtContractAddress       = "0xcF51ab7398315DbA6588Aa7fb3Df7c99D3D1F4dD";
const BroilerPlusContractAddress    = "0xeCb4cAc0C9e5cBd42a9Ed36467ce8f96072AD58b";
const DistributorContractAddress    = "0xB2225f2e9a26688D43bC01A8Cf7aD4B179154c47";

const providerOptions = {};

let HopeNobtContract;
let BroilerPlusContract;
let DistributorContract;

let userAccount;

let provider;
let web3Modal;

let hopeNobtUserInfos;
let hopeNobtInvitees  = [];
let hopeNobtReferrals = [];

let balance;
let broilerTokenBalance;

const startApp = async function() {

    web3Modal = new Web3Modal({
        network: "mainnet", //optional
        cacheProvider: "true",    //optional
        providerOptions //required
    });

    provider = await web3Modal.connect();

    web3 = new Web3(provider);

        //Subscribe to Provider events
    // Subscribe to accounts change
        provider.on("accountsChanged", (accounts) =>  {
            console.log(accounts);
        });

    // Subscribe to chainId change
        provider.on("chainChanged", (chainId) => {
            console.log(chainId);
        });

    // Subscribe to provider connection
        provider.on("connect", (info) => {
            console.log(info);
        });

    // Subscribe to provider disconnection
        provider.on("disconnect", (error) => {
            console.log(error);
        });

        //loading contract
    HopeNobtContract    =   web3.eth.Contract(HopeNobtAbi, HopeNobtContractAddress);
    BroilerPlusContract =   web3.eth.Contract(BroilerPlusAbi, BroilerPlusContractAddress);
    DistributorContract =   web3.eth.Contract(DistributorAbi, DistributorAbi);

}

async function loadBalances() {
    balance = await web3.eth.getBalance(userAccount);
    broilerTokenBalance = await BroilerPlusContract.methods.balanceOf(userAccount).call();
}

    //HopeNobt calling functions
async function loadHopeNobtUserInfos() {
    let _getReferralsReturn = await HopeNobtContract.methods.getRefferals(userAccount).call();
    let _getInviteesReturn  = await HopeNobtContract.methods.getInvitees(userAccount).call();
    let _mySquadReturn      = await HopeNobtContract.methods.mySquad(userAccount).call();

    hopeNobtReferrals = [];
    hopeNobtInvitees  = [];
    hopeNobtUserInfos = {};

        //Assign values
    hopeNobtUserInfos = {
        userAddress:    userAccount,
        totalCount:     _mySquadReturn[0],
        totalAmount:    _mySquadReturn[1],
        referrals:      _getReferralsReturn[0],
        invitees:       _getInviteesReturn[0],
    };
    hopeNobtInvitees    = hopeNobtUserInfos.invitees;
    hopeNobtReferrals   = hopeNobtUserInfos.referrals;
}


async function loadAccount() {
    await loadBalances();
    await loadHopeNobtUserInfos();
}

async function displayAccount() {

}

let accountInterval = setInterval(async function () {
        if (web3.eth.accounts[0] != userAccount) {
            userAccount = web3.eth.accounts[0];
            await loadAccount(userAccount)
                .then(displayAccount())
                .catch(error => console.error(error));
        }
    }
    , 100);