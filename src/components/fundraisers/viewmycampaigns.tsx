import { CampaignDataArgs, CombinedCampaignDataX } from "../../types"
import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { _web3 } from "../../blockchain-services/useCharityDonation"
import { getBalanceAndAddress, myCampaigns, viewCampaignDetails, isActiveAdmin } from "../../blockchain-services/useCharityDonation"
import { toast } from "react-toastify"
import { supabase } from "../../supabase/supabaseClient"

export default function ViewMyCampaigns({ status }: { status: string }) {
    const [isLoading, setIsLoading] = useState(true);
    const [combined, setCombined] = useState<CombinedCampaignDataX[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const handleRedirect = (id: string, address: string) => {
        navigate(`/campaign-details?address=${address}&id=${id}`);
    }

    // Memoized filter function
    const filterCampaigns = useMemo(() => (
        campaigns: CampaignDataArgs[]
    ): CampaignDataArgs[] => {
        switch (status) {
            case 'Active':
                return campaigns.filter(campaign => 
                    !campaign.isCompleted && !campaign.isCancelled
                );
            case 'Completed':
                return campaigns.filter(campaign => 
                    campaign.isCompleted
                );
            case 'Cancelled':
                return campaigns.filter(campaign => 
                    campaign.isCancelled
                );
            default:
                return campaigns;
        }
    }, [status]);

    const filterCampaignsAdmin = useMemo(() => (
        campaigns: CombinedCampaignDataX[]
    ): CombinedCampaignDataX[] => {
        switch (status) {
            case 'Active':
                return campaigns.filter(campaign => 
                    !campaign.isCompleted && !campaign.isCancelled
                );
            case 'Completed':
                return campaigns.filter(campaign => 
                    campaign.isCompleted
                );
            case 'Cancelled':
                return campaigns.filter(campaign => 
                    campaign.isCancelled
                );
            default:
                return campaigns;
        }
    }, [status]);

    // Memoized search function
    const filteredCampaigns = useMemo(() => {
        if (!searchQuery.trim()) return combined;
        
        const query = searchQuery.toLowerCase();
        return combined.filter(campaign => 
            campaign.title.toLowerCase().includes(query) ||
            campaign.campaignAddress.toString().toLowerCase().includes(query)
        );
    }, [combined, searchQuery]);

    // Combined fetch function
    const fetchAllData = async () => {
        try {
            setIsLoading(true);
            const balanceAndAddress = await getBalanceAndAddress();
            if (!balanceAndAddress) {
                throw new Error('Failed to get balance and address');
            }
            const { account } = balanceAndAddress;

            // Fetch owned campaigns
            const [campaigns, { data: imageData, error: imageError }] = await Promise.all([
                myCampaigns(),
                supabase
                    .from('unduguimages')
                    .select('*')
                    .ilike('fraddress', account)
            ]);

            if (imageError) {
                throw new Error(`Error fetching images: ${imageError.message}`);
            }

            const filteredCampaigns = filterCampaigns(campaigns);
            const ownedCampaigns = filteredCampaigns.map((campaign) => {
                const image = imageData?.find(
                    (img) => img.frid === Number(campaign.campaign_id)
                );

                const deadline = new Date(
                    Number(campaign.deadline) * 1000
                ).toLocaleDateString();

                const progress = Math.round(
                    Number(campaign.raisedAmount * BigInt(100) / campaign.targetAmount)
                );

                return {
                    ...campaign,
                    imageUrl: image?.url || null,
                    endDate: deadline,
                    progress: progress.toString(),
                    campaignKey: `${campaign.campaignAddress}-${campaign.campaign_id}` // Add unique key
                };
            });

            // Fetch admin campaigns
            const { data: allImageData } = await supabase.from('unduguimages').select('*');
            const adminCampaignsPromises = allImageData?.map(async (campaign) => {
                try {
                    const amAnAdmin = await isActiveAdmin(account, campaign.fraddress);
                    if (amAnAdmin) {
                        const thisCampaign = await viewCampaignDetails(campaign.frid, campaign.fraddress);
                        const { details } = thisCampaign as { details: CampaignDataArgs };

                        const deadline = new Date(Number(details.deadline) * 1000).toLocaleDateString();
                        const progress = Math.round(
                            Number(details.raisedAmount * BigInt(100) / details.targetAmount)
                        );

                        return {
                            ...details,
                            imageUrl: campaign?.url || null,
                            endDate: deadline,
                            progress: progress.toString(),
                            campaignKey: `${details.campaignAddress}-${details.campaign_id}` // Add unique key
                        };
                    }
                    return null;
                } catch (error) {
                    console.error(`Error fetching campaign ${campaign.frid}:`, error);
                    return null;
                }
            }) || [];

            const adminCampaigns = (await Promise.all(adminCampaignsPromises))
                .filter((campaign): campaign is CombinedCampaignDataX => 
                    campaign !== null && campaign !== undefined
                );

            const filteredAdminCampaigns = filterCampaignsAdmin(adminCampaigns);

            // Combine campaigns using the unique campaignKey
            const campaignMap = new Map<string, CombinedCampaignDataX>();
            
            // Add owned campaigns to map
            ownedCampaigns.forEach(campaign => {
                campaignMap.set(campaign.campaignKey, campaign);
            });

            // Add admin campaigns to map
            filteredAdminCampaigns.forEach(campaign => {
                if (!campaignMap.has(campaign.campaignKey)) {
                    campaignMap.set(campaign.campaignKey, campaign);
                }
            });

            // Convert map values back to array
            const mergedCampaigns = Array.from(campaignMap.values());
            setCombined(mergedCampaigns);

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load campaigns');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [status]);


    if (isLoading) {
        return (
            <div className="text-green-600 p-2 m-2 h-1/3 grid place-items-center">
                <p className="p-1 text-lg font-semibold mt-10 text-center">
                    Loading {status} Fundraisers...
                </p>
                <span className="loading loading-dots loading-lg"></span>
            </div>
        );
    }

    if (!combined.length) {
        return (
            <div className="text-green-600 p-2 m-2 h-1/3 grid place-items-center">
                <p className="p-1 text-lg font-semibold mt-10 text-center">
                    You Have No {status} Fundraisers Yet!
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Search Input */}
            <div className="w-full sticky top-16 z-50">
                <div className="w-full p-2 mt-2 grid place-items-center">
                    <input
                        type="text"
                        placeholder="Search campaigns by title or address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input input-bordered w-full md:w-1/2 shadow-xl border-green-500"
                    />
                </div>
            </div>

            {/* Campaign Cards */}
            <div className="m-1 p-1 flex flex-wrap justify-center items-center">
                {filteredCampaigns.map(campaign => (
                    <>
                        {campaign.imageUrl && (
                            <div 
                                key={`${campaign.campaignAddress}-${campaign.campaign_id}`}
                                className="card card-compact bg-white/10 backdrop-blur-sm overflow-hidden md:w-1/4 w-full md:h-1/2 shadow-lg m-2 border border-green-200 hover:border-green-500 transition duration-300 hover:cursor-pointer"
                                onClick={() => handleRedirect(
                                    campaign.campaign_id.toString(),
                                    campaign.campaignAddress.toString()
                                )}
                            >
                                <figure className="max-h-60">
                                    <img
                                        src={campaign.imageUrl}
                                        alt={campaign.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </figure>
                           
                                <div className="card-body">
                                    <h2 className="text-xl font-semibold w-full line-clamp-2">
                                        {campaign.title}
                                    </h2>
                                    <p className="line-clamp-2 w-full text-base">
                                        {campaign.description}
                                    </p>
                                    <div className="flex justify-between">
                                        <p className="text-center">
                                            <span className="font-semibold text-base">Target: </span>
                                            <span className="font-mono">
                                                {_web3.utils.fromWei(campaign.targetAmount, 'ether')}
                                            </span> sETH
                                        </p>
                                        <p className="text-center">
                                            <span className="font-semibold text-base">Raised: </span>
                                            <span className="font-mono">
                                                {_web3.utils.fromWei(campaign.raisedAmount, 'ether')}
                                            </span> sETH
                                        </p>
                                    </div>
                                    <div>
                                        <progress 
                                            className="progress progress-success w-full"
                                            value={campaign.progress}
                                            max="100"
                                        />
                                    </div>
                                    <p className="text-center">
                                        <span className="font-semibold text-base">Deadline: </span>
                                        <span>{campaign.endDate}</span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                ))}
            </div>

            {/* No Results Message */}
            {filteredCampaigns.length === 0 && searchQuery && (
                <div className="text-green-600 p-2 m-2 text-center">
                    <p className="text-lg">No campaigns found matching "{searchQuery}"</p>
                </div>
            )}
        </div>
    );
}