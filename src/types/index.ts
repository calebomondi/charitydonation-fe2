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