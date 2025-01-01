export interface CreateCampaignArgs {
    title: string
    description: string
    target: string
    durationDays: string
}

export interface CampaignCreatedEvent {
    campaign_id: number
    campaignAddress: string
    title: string
    targetAmount: number
    deadline: string
}

export interface CampaignDataArgs {
    campaign_id: bigint;
    title: string;
    description: string;
    campaignAddress: string;
    targetAmount: bigint;
    raisedAmount: bigint;
    balance: bigint;
    deadline: bigint;
    isCompleted: boolean;
    isCancelled: boolean;
}

export interface ImageUrls {
    id: number;
    fraddress: string;
    frid: number;
    url: string;
}

export interface CombinedCampaignData extends CampaignDataArgs {
    imageUrl: string | null;
    endDate: string;
    progress: string;
}

export interface CombinedCampaignDataX extends CampaignDataArgs {
    imageUrl: string | null;
    endDate: string;
    progress: string;
    campaignKey: string;
}

export interface CampaignDonors {
    address: string;
    amount: bigint;
}

export interface Donation {
    campaignAddress: string;
    campaignId: bigint;
    title: string;
    amount: bigint;
}

export interface Withdrawal {
    campaignId: string;
    title: string;
    amount: string;
    by: string;
    to: string;
}

export interface SerializedCampaignData {
    campaign_id: string;
    title: string;
    description: string;
    campaignAddress: string;
    targetAmount: string;
    raisedAmount: string;
    balance: string;
    deadline: string;
    isCompleted: boolean;
    isCancelled: boolean;
    imageUrl: string | null;
    endDate: string;
    progress: string;
}