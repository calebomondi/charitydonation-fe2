import { contractABI, contractADDR } from "./core"; 
import Web3 from "web3";
import { CampaignDataArgs, CreateCampaignArgs } from "../types";
import { toast } from "react-toastify";

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
        .send(
            { 
                from: account, 
                gas: await contract.methods
                    .createCampaign(title, description, BigInt(targetWei), BigInt(durationDays))
                    .estimateGas({ from: account }).toString()
            }
        )

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
        .send(
            { 
                from: account, 
                gas: await contract.methods
                    .addCampaignAdmin(admin)
                    .estimateGas({ from: account }).toString()
            }
        )

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
        .send(
            { 
                from: account,
                gas: await contract.methods
                    .removeCampaignAdmin(admin)
                    .estimateGas({ from: account }).toString()
            }
        )

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
        .send(
            { 
                from: account,
                gas: await contract.methods
                .cancelCampaign(BigInt(campaignId), campaignAddress)
                .estimateGas({ from: account }).toString()
            }
        )

        console.log(`txn-cancel-campaign: ${tx.transactionHash}`)

    } catch (error:any) {
        // Handle specific error cases
        if (error.message.includes("This Campaign Has Already Been Completed!")) {
            toast.error("This Campaign Has Already Been Completed, Cannot Cancel!")
            throw new Error("This Campaign Has Already Been Completed!");
        }

        if (error.message.includes("This Campaign Has Already Raised Funds! Refund First Then Cancel!")) {
            toast.error("This Campaign Has Already Raised Funds! Refund First Then Cancel!")
            throw new Error("This Campaign Has Already Raised Funds! Refund First Then Cancel!");
        }

        if (error.message.includes("Only Admins Can Perform This Action!")) {
            toast.error("Only Admins Can Perform This Action!")
            throw new Error("Only Admins Can Perform This Action!");
        }
        
        if (error.code === 4001) {
            toast.error("Transanction Failed!")
            throw new Error("Transaction rejected by user");
        }
  
        console.error("Failed To Cancel Campaign:", error);
        toast.error("Failed To Cancel Campaign!")
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

//refund donors
export const refundDonors = async (campaignId:number,campaignAddress:string) => {
    try {
        // Get connected account
        const balanceAndAddress = await getBalanceAndAddress();
        if (!balanceAndAddress) {
            throw new Error('Failed to get balance and address');
        }
        const { account } = balanceAndAddress;

        //cancel campaign
        const tx = await contract.methods
        .refundDonors(BigInt(campaignId),campaignAddress)
        .send(
            { 
                from: account,
                gas: await contract.methods
                .refundDonors(BigInt(campaignId), campaignAddress)
                .estimateGas({ from: account }).toString()
            }
        )

        console.log(`txn-cancel-campaign: ${tx.transactionHash}`)

    } catch (error:any) {
        // Known error cases from smart contract
        const CONTRACT_ERRORS = {
            'This Campaign Is Successful Cannot be Cancelled!': 'Campaign is successful and cannot be cancelled',
            'Insufficient contract balance': 'Contract has insufficient balance for refund',
            'Transfer failed': 'Failed to transfer refund to donor',
            'Refund Was Unsuccessful!': 'Refund process failed to complete',
            "Only Admins Can Perform This Action!":"Only Admins Can Perform This Action!"
        };
    
        // Handle MetaMask/wallet errors
        if (error.code === 4001) {
            toast.error('Transanction failed!')
            throw new Error('Transaction rejected by user');
        }
    
        // Check for known contract errors
        for (const [errorMsg, userMsg] of Object.entries(CONTRACT_ERRORS)) {
            if (error.message.includes(errorMsg)) {
                toast.error(userMsg)
                throw new Error(userMsg);
            }
        }
  
        console.error("Failed To Refund Donors:", error);
        toast.error("Failed To Refund Donors")
        throw new Error("Failed To Refund Donors:" + error.message);
    }
}

//donate to campaign
export const donateToCampaign = async (campaignId:number,campaignAddress:string,amount:number) => {
    try {
        // Get connected account
        const balanceAndAddress = await getBalanceAndAddress();
        if (!balanceAndAddress) {
            throw new Error('Failed to get balance and address');
        }
        const { account, balanceEth } = balanceAndAddress;

        // Check if user has sufficient balance
        const userBalance = parseFloat(balanceEth);
        if (userBalance < amount) {
            toast.error('Insufficient balance in wallet');
            throw new Error('Insufficient balance for donation');
        }

        //convert amount to wei
        const amountInWei = BigInt(amount * 1e18)

        // Estimate gas for the transaction
        const gasEstimate = await contract.methods
        .donateToCampaign(campaignAddress, BigInt(campaignId), amountInWei)
        .estimateGas({ 
            from: account,
            value: amountInWei.toString()
        });

        //cancel campaign
        const tx = await contract.methods
        .donateToCampaign(campaignAddress,BigInt(campaignId),amountInWei)
        .send({ 
            from: account,
            value: amountInWei.toString(),
            gas: Math.floor(Number(gasEstimate) * 1.1).toString() // Add 10% buffer to gas estimate
        });

        console.log(`txn-cancel-campaign: ${tx.transactionHash}`)

    } catch (error:any) {
        // Known error cases from smart contract
        const CONTRACT_ERRORS = {
            "Donation Amount Cannot be Zero": "Donation Amount Cannot be Zero",
            "The Amount And Value Don't Match!": "The Amount And Value Don't Match!"
        };
    
        // Handle MetaMask/wallet errors
        if (error.code === 4001) {
            toast.error('Transaction cancelled');
            throw new Error('Transaction rejected by user');
        }
    
        // Check for known contract errors
        for (const [errorMsg, userMsg] of Object.entries(CONTRACT_ERRORS)) {
            if (error.message.includes(errorMsg)) {
                toast.error(userMsg)
                throw new Error(userMsg);
            }
        }
  
        console.error("Failed To Donate To Fundraiser:", error);
        toast.error("Failed To Donate To Fundraiser")
        throw new Error("Failed To Donate To Fundraiser:" + error.message);
    }
}

//donate to campaign
export const withdrawFromCampaign = async (campaignId:number,campaignAddress:string,amount:number,recipientAddress:string) => {
    try {
        // Get connected account
        const balanceAndAddress = await getBalanceAndAddress();
        if (!balanceAndAddress) {
            throw new Error('Failed to get balance and address');
        }
        const { account } = balanceAndAddress;

        //convert amount to wei
        const amountInWei = BigInt(amount * 1e18)

        // Check campaign status before proceeding
        const campaign: CampaignDataArgs = await contract.methods.campaigns(campaignAddress, campaignId - 1).call();
        if (!campaign.isCompleted) {
            toast.error('Campaign must be completed before withdrawal');
            throw new Error('Campaign is still active');
        }

         // Estimate gas for the transaction
        const gasEstimate = await contract.methods
        .withdrawFunds(
            BigInt(campaignId),
            campaignAddress,
            amountInWei,
            recipientAddress
        )
        .estimateGas({ from: account });

        // Send the withdrawal transaction
        const tx = await contract.methods
        .withdrawFunds(
            BigInt(campaignId),
            campaignAddress,
            amountInWei,
            recipientAddress
        )
        .send({ 
            from: account,
            gas: Math.floor(Number(gasEstimate) * 1.1).toString() // Add 10% buffer to gas estimate
        });

        console.log(`txn-cancel-campaign: ${tx.transactionHash}`)

    } catch (error:any) {
        // Known error cases from smart contract
        const CONTRACT_ERRORS = {
            "You Can't Withdraw Funds from an Active Campaign": 'Campaign must be completed before withdrawal',
            "Insufficient contract balance": 'Not enough funds in the contract',
            "Amount Cannot be Zero Or Exceed The Raised Amount!": 'Invalid withdrawal amount',
            "Transfer failed": 'Failed to transfer funds',
            "Only Admins Can Perform This Action!": "Only Admins Can Perform This Action!"
        };
    
        // Handle MetaMask/wallet errors
        if (error.code === 4001) {
            toast.error('Transaction cancelled');
            throw new Error('Transaction rejected by user');
        }
    
        // Check for known contract errors
        for (const [errorMsg, userMsg] of Object.entries(CONTRACT_ERRORS)) {
            if (error.message.includes(errorMsg)) {
                toast.error(userMsg)
                throw new Error(userMsg);
            }
        }
  
        console.error("Failed To Process Withdrawal:", error);
        toast.error("Failed To Process Withdrawal")
        throw new Error("Failed To Process Withdrawal:" + error.message);
    }
}