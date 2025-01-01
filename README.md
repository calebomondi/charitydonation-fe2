# Undugu Decentralized Charity Donation Platform

![with-text](https://github.com/user-attachments/assets/b6de3a8c-8c08-426f-ad90-f6ea08c768d5)

## Overview
Undugu is blockchain-based charity donation platform that enables transparent, secure, and decentralized fundraising. The platform allows fundraiser addresses to create and manage multiple campaigns while delegating administrative control to trusted addresses, ensuring flexible management and complete transparency of donations and disbursements.

### Key Features
- Multiple fundraising campaigns per address
- Multi-admin management system
- Transparent donation tracking
- Secure fund disbursement
- Campaign status monitoring
- Donation history tracking
- Automated refund system for failed campaigns

## Technical Stack
- Frontend: React.js + Vite
- UI Components: DaisyUI + Lucide React
- Blockchain Development: Hardhat + Remix
- Blockchain Deployment: Ethereum Sepolia
- Smart Contract: Solidity
- Web3 Integration: Web3.js

## Smart Contracts

### Main Contract Features
- Create and manage fundraising campaigns
- Accept donations in ETH
- Multi-admin support for campaign management
- Secure donation handling and fund management
- Automated campaign completion on target achievement
- Donor tracking and refund mechanism for failed campaigns
- Campaign lifecycle management (active, completed, cancelled)
- Complete transparency with on-chain tracking of donations and withdrawals
- Campaign cancellation protection when funds are raised

### Key Functions

#### Campaign Management
```solidity
function createCampaign(string memory _title, string memory _description, uint256 _target, uint256 _durationdays) public
function cancelCampaign(uint256 _campaignId, address _campaignAddress) external
```

#### Admin Management
```solidity
function addCampaignAdmin(address _admin) public
function removeCampaignAdmin(address _admin) external
```

#### Donation Management
```solidity
function donateToCampaign(address payable _campaignAddress, uint256 _campaignId, uint256 _amount) public payable
```

#### Fund Management
```solidity
function withdrawFunds(uint256 _campaignId, address _campaignAddress, uint256 _amount, address payable _to) external
function refundDonors(uint256 _campaignId, address _campaignAddress) public
```

#### View Management
```solidity
function getCampaignDetails(uint256 _campaignId, address _campaignAddress) public view
function viewCampaigns() public view
function viewDonations() public view
function viewWithdrawals(address _campaignAddress) public view
```

#### Events 
The contract emits the following events for tracking:
```solidity
event CampaignCreated(uint256 campaign_id, address campaignAddress, string title, uint256 targetAmount, uint256 deadline)
event DonationReceived(address donor, uint256 amount, address campaignAddress, uint256 campaign_id)
event FundsWithdrawn(uint256 amount, address by, address to, address from, uint256 campaignId)
event CampaignCompleted(address campaignAddress, uint256 campaign_id)
event CampaignCancelled(address campaignAddress, uint256 campaign_id)
event AddAdmin(address admin)
event RemoveAdmin(address admin)
event RefundCampaignDonors(address campaignAddress, uint256 campaignId, address to, uint256 amount)
```

## Development and Testing

### Prerequisites
- Node.js v14+ and npm
- Ethereum wallet (e.g., MetaMask)
- Infura or Alchemy RPC and API

### Setup

1. Clone this repository
```bash
git clone <repository-url>
cd <repository-folder>
```

2. Install dependencies:
```bash
npm install
```

3. Run:
```bash
npm run dev
```

## Environment Variables
Create a `.env` file with:
```
VITE_SUPABASE_URL=your_supabse_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ALCHEMY_RPC=your_rpc_url
```

## Usage Guide

### Creating a Fundraiser
1. Connect wallet with fundraiser address
2. Navigate to "Create Fundraiser" section
3. Fill in campaign details:
   - Title
   - Description
   - Funding goal
4. Submit transaction to create campaign

![u-create](https://github.com/user-attachments/assets/8d6ac02e-6d8d-43d4-a86c-589928e5fe7a)

### Managing Admins
1. Access fundraiser dashboard
2. Navigate to "Admin Management"
3. Add admin addresses
4. Confirm transaction to grant admin permissions

![u-admin](https://github.com/user-attachments/assets/f3d80f4e-db79-455b-966b-63eb053a4d39)

### Making Donations
1. Connect wallet
2. Browse active campaigns
3. Select desired campaign
4. Enter donation amount
5. Confirm transaction

![u-donate](https://github.com/user-attachments/assets/85a02bf6-c0b9-486d-92b3-ed4767824c86)

### Disbursing Funds
1. Connect with admin wallet
2. Access completed campaigns
3. Select campaign for disbursement
4. Add beneficiary addresses and amounts
5. Confirm disbursement transaction

![u-disburse](https://github.com/user-attachments/assets/b6abd685-aef8-4826-aab3-0fa032b9df19)

### Refund/Cancel Fundraiser
1. Connect with admin wallet
2. Access failed campaigns
3. Refund donors
4. Cancel fundraiser
5. Confirm cancellation

![u-refund1](https://github.com/user-attachments/assets/bafd3c0a-0317-4cd0-be75-ec993e8becba)

![u-refund2](https://github.com/user-attachments/assets/c0000e03-3613-45aa-b5d8-35770054a0bd)

### Campaign Status Tracking
- **Active**: Ongoing campaigns accepting donations
- **Completed**: Campaigns that reached their goals
- **Cancelled**: Failed campaigns eligible for refunds

![u-status](https://github.com/user-attachments/assets/78fc51ea-4f01-4de3-a1ff-33bbbda7f6d3)

## Security Features
- Multi-admin verification system
- Automated fund locking until campaign completion
- Transparent transaction history
- Refund mechanism for cancelled campaigns

## Contributing
We welcome contributions! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Submit pull request

## License
MIT License

## Appendices
1. Smartcontract Repo: [Link](https://github.com/calebomondi/charity-donation-hardhat)
2. Sepolia deployment: [Link](https://sepolia.etherscan.io/address/0x133818926101eEE247B1188fcE4a13f993d9c6E8#code)
3. Undugu Live : [Link](https://undugu-beta.vercel.app/)