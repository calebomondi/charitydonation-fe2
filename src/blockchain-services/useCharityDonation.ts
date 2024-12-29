import { contractABI, contractADDR } from "./core"; 
import Web3 from "web3";
import { CampaignDataArgs, CreateCampaignArgs } from "../types";

//For Events (Alchemy)
const _provider = new Web3.providers.WebsocketProvider('wss://eth-sepolia.g.alchemy.com/v2/sZ5I9vk5LlS9LZTeLFjkQ8CJ3bAnTthd');
export const _web3 = new Web3(_provider);
export const _contract = new _web3.eth.Contract(contractABI, contractADDR);

//For Transactions (MetaMask)
const getWeb3Provider = () => {
    // Check if MetaMask is installed
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
        console.log('Please install MetaMask!');
        throw new Error('No ethereum provider found');
    }

    // Create Web3 instance with MetaMask
    const web3 = new Web3(ethereum);
    return web3;
}
const getContract = (web3: Web3, contractAddress: string, contractABI: any) => {
    return new web3.eth.Contract(contractABI, contractAddress);
};
const web3 = getWeb3Provider();
const contract = getContract(web3, contractADDR, contractABI);

//connect to wallet
export async function connectWallet() : Promise<string | null> {
    try {
        // Check if MetaMask is installed
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
        const tx = await contract.methods
        .createCampaign(title, description, BigInt(targetWei), BigInt(durationDays))
        .send({ from: account })

        console.log(`txn: ${tx.blockHash}`)

    } catch (error:any) {
        // Handle specific error cases
        if (error.message.includes("Campaign already exists")) {
            throw new Error(`Campaign "${title}" already exists`);
        }
        
        if (error.code === 4001) {
            throw new Error("Transaction rejected by user");
        }
    
        if (error.message.includes("insufficient funds")) {
            throw new Error("Insufficient funds for transaction");
        }
  
        console.error("Failed to create campaign:", error);
        throw new Error("Failed to create campaign: " + error.message);
    }
}

//add admin
export const addAdmin = async (admin:string) => {
    try {
        // Get connected account
        const balanceAndAddress = await getBalanceAndAddress();
        if (!balanceAndAddress) {
            throw new Error('Failed to get balance and address');
        }
        const { account } = balanceAndAddress;

        //create campaign
        const tx = await contract.methods
        .addCampaignAdmin(admin)
        .send({ from: account })

        console.log(`txn-add-admin: ${tx.transactionHash}`)

    } catch (error:any) {
        // Handle specific error cases
        if (error.message.includes("This Address Is Already An Admin!")) {
            throw new Error("This Address Is Already An Admin!");
        }
        
        if (error.code === 4001) {
            throw new Error("Transaction rejected by user");
        }
  
        console.error("Failed to add campaign admin:", error);
        throw new Error("Failed to add campaign admin: " + error.message);
    }
}

//remove admin
export const removeAdmin = async (admin:string) => {
    try {
        // Get connected account
        const balanceAndAddress = await getBalanceAndAddress();
        if (!balanceAndAddress) {
            throw new Error('Failed to get balance and address');
        }
        const { account } = balanceAndAddress;

        //create campaign
        const tx = await contract.methods
        .removeCampaignAdmin(admin)
        .send({ from: account })

        console.log(`txn-remove-admin: ${tx.transactionHash}`)

    } catch (error:any) {
        // Handle specific error cases
        if (error.message.includes("This Address Is Not An Admin!")) {
            throw new Error("This Address Is Already An Admin!");
        }
        
        if (error.code === 4001) {
            throw new Error("Transaction rejected by user");
        }
  
        console.error("Failed to add campaign admin:", error);
        throw new Error("Failed to add campaign admin: " + error.message);
    }
}

//cancel campaign
export const cancelCampaign = async (campaignId:number,campaignAddress:string) => {
    try {
        // Get connected account
        const balanceAndAddress = await getBalanceAndAddress();
        if (!balanceAndAddress) {
            throw new Error('Failed to get balance and address');
        }
        const { account } = balanceAndAddress;

        //cancel campaign
        const tx = await contract.methods
        .cancelCampaign(BigInt(campaignId),campaignAddress)
        .send({ from: account })

        console.log(`txn-cancel-campaign: ${tx.transactionHash}`)

    } catch (error:any) {
        // Handle specific error cases
        if (error.message.includes("This Campaign Has Already Been Completed!")) {
            throw new Error("This Campaign Has Already Been Completed!");
        }

        if (error.message.includes("This Campaign Has Already Raised Funds! Refund First Then Cancel!")) {
            throw new Error("This Campaign Has Already Raised Funds! Refund First Then Cancel!");
        }
        
        if (error.code === 4001) {
            throw new Error("Transaction rejected by user");
        }
  
        console.error("Failed to add campaign admin:", error);
        throw new Error("Failed to add campaign admin: " + error.message);
    }
}

//check if admin is active
const isActiveAdmin = async (admin:string,campaignAddress:string) : Promise<boolean> => {
    try {
        const isActive:boolean = await contract.methods.admins(campaignAddress, admin).call();
        return isActive;
    } catch (error) {
        console.error(`Failed to check admin status for ${admin}:`, error);
        throw error;
    }
};

//get campaign admins
export const getCampaignAdmins = async () : Promise<string[]> => {
    try {
        // Get connected account
        const balanceAndAddress = await getBalanceAndAddress();
        if (!balanceAndAddress) {
            throw new Error('Failed to get balance and address');
        }
        const { account } = balanceAndAddress;

        //get admins
        const result: { withdrwals: any, admins: string[] } = await contract.methods
        .viewWithdrawals(account)
        .call()

        const {
            withdrwals: withdrawalsList,
            admins: adminsList
        } = result

        console.log(`withdrawals -> ${withdrawalsList}`)

        // Check status for all admins in parallel
        const adminStatuses = await Promise.all(
            adminsList.map(async (admin) => ({
                address: admin,
                isActive: await isActiveAdmin(admin,account)
            }))
        );
        
        // Filter only active admins
        const activeAdmins = adminStatuses
            .filter(admin => admin.isActive)
            .map(admin => admin.address);

        return activeAdmins

    } catch (error) {
        console.error("Failed to get campaign admins:", error);
        return [];
    }
}

//View Campaign Details
export const viewCampaignDetails = async (id:number, address:string) : Promise<{details:CampaignDataArgs | {}, number:number, donors:string[]}> => {
    try {
        //get campaign details
        const result: [CampaignDataArgs, string, string[]] = await contract.methods
        .getCampaignDetails(id,address)
        .call()

        return {
            details: result[0] || {},  // Campaign details
            number: Number(result[1]) || 0,  // Convert donor count to number
            donors: result[2] || []  // Donors array
        };
        
    } catch (error) {
        console.error("Failed to fetch campaign details:", error);
        return {
            details:{},
            number:0,
            donors:[]
        }
    }
}