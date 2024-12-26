import { contractABI, contractADDR } from "./core"; 
import Web3 from "web3";
import { CampaignDataArgs, CreateCampaignArgs } from "../types";

//connect to provider
const provider = new Web3.providers.HttpProvider('https://eth-sepolia.g.alchemy.com/v2/sZ5I9vk5LlS9LZTeLFjkQ8CJ3bAnTthd');
const web3 = new Web3(provider);
//create contract instance
const contract = new web3.eth.Contract(contractABI, contractADDR);

//connect to wallet
export async function connectWallet() : Promise<string | null> {
    try {
        const ethereum = (window as any).ethereum;

        if (!ethereum) {
            console.log('Please install MetaMask!');
            throw new Error('No ethereum provider found');
        }

        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        return account;
    } catch (error) {
        console.error('Error connecting wallet', error);
        return null;
    }
}

//listen to wallet change
export const listenForWalletEvents = () => {
    const ethereum = (window as any).ethereum;
    ethereum.on('accountsChanged',  (accounts: string[]) => {
        console.log('Account changed', accounts[0]);
    });
    ethereum.on('chainChanged',  (chainId: string) => {
        console.log('Chain changed', chainId);
        window.location.reload();
    })
}

//check if wallet is connected
export const checkIfWalletIsConnected = async () : Promise<boolean> => {
    try {
        const ethereum = (window as any).ethereum;
        if (!ethereum) {
            return false;
        }
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        return accounts.length > 0;
    } catch (error) {
        console.error('Error checking if wallet is connected', error);
        return false;
    }
}

//get connect wallet balance and account
export const getBalanceAndAddress = async () : Promise<{ account:string, balanceEth:string } | null> => {
    try {
        const ethereum = (window as any).ethereum;
        if (!ethereum) {
            return null;
        }
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        const account = accounts[0];
        const balance = await web3.eth.getBalance(account);
        const balanceEth = web3.utils.fromWei(balance,'ether')
        return { account, balanceEth };
    } catch (error) {
        console.error('Error getting balance and address', error);
        return null;
    }
}

//get my campaigns
export const myCampaigns = async () : Promise<CampaignDataArgs[]> => {
    try {
        // Get connected account
        const balanceAndAddress = await getBalanceAndAddress();
        if (!balanceAndAddress) {
            throw new Error('Failed to get balance and address');
        }
        const { account } = balanceAndAddress;
        //get campaigns
        const campaigns:CampaignDataArgs[] = await contract.methods.viewCampaigns().call({from: account});

        return campaigns
    } catch (error) {
        console.log('Error Message', error)
        throw error
    }

}

//create campaign
export const createCampaign = async ({title, description, target, durationDays} : CreateCampaignArgs) => {
    try {
        //validate input data
        if (!title || !description || !target || !durationDays) {
            throw new Error('All fields are required')
        }
        if (isNaN(Number(target)) || Number(target) <= 0) {
            throw new Error('Target must be a number and greater than 0')
        }
        if (isNaN(Number(durationDays)) || Number(durationDays) <= 0) {
            throw new Error('Duration must be a number and greater than 0')
        }
    
        //convert ether to wei
        const targetWei = web3.utils.toWei(target,'ether');

        // Get connected account
        const balanceAndAddress = await getBalanceAndAddress();
        if (!balanceAndAddress) {
            throw new Error('Failed to get balance and address');
        }
        const { account } = balanceAndAddress;

        //create campaign
        await contract.methods.createCampaign(title, description, BigInt(targetWei), BigInt(durationDays)).send({from: account})

        //listen for event
        const campaignCreatedEvent = contract.events.CampaignCreated()
        campaignCreatedEvent.on('data', (event) => {
            console.log(`Created Campaign ${event}`)
            //upload to DB
        })
        

    } catch (error) {
        console.error("Cannot Create Campaign")
        throw error
    }
}

/**
 *  function createCampaign(string memory _title, string memory _description,uint256 _target, uint256 _durationdays) public  {
        //check if campaign already exists
        unchecked {
            for(uint256 i; i < campaigns[msg.sender].length; i++) {
                string storage campaignTitle = campaigns[msg.sender][i].title;
                bool exists = keccak256(abi.encodePacked(campaignTitle)) == keccak256(abi.encodePacked(_title));
                if (exists) {
                    revert(string(abi.encodePacked("Campaign ", _title, " already exists!")));
                }
            }
        }

        //create campaign
        Campaign memory newCampaign =  Campaign(
            {
                campaign_id : campaigns[msg.sender].length + 1,
                title: _title,
                description: _description, 
                campaignAddress: msg.sender,
                targetAmount: _target, 
                raisedAmount  :  0, 
                balance: 0,
                deadline: block.timestamp + (_durationdays * 1 days),
                isCompleted: false,
                isCancelled: false
            }
        );
        campaigns[msg.sender].push(newCampaign);

        //emit event
        emit CampaignCreated(campaigns[msg.sender].length, msg.sender, _title, _target, block.timestamp + (_durationdays * 1 days));
    }
 */