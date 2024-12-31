import { viewCampaignDetails } from "../../blockchain-services/useCharityDonation"
import { CampaignDataArgs, CombinedCampaignData } from "../../types"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { _web3 } from "../../blockchain-services/useCharityDonation"
import { toast } from "react-toastify"
import { supabase } from "../../supabase/supabaseClient"

export default function ViewOtherCampaigns() {
    const [combined, setCombined] = useState<CombinedCampaignData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const handleRedirect = (id: string, address: string) => {
        navigate(`/campaign-details?address=${address}&id=${id}`);
    }

    useEffect(() => {
        fetchAllData();
    }, []);

    // Combine fetch operations
    const fetchAllData = async () => {
        try {
            setIsLoading(true);
            
            // Fetch images
            const { data: imageData, error: imageError } = await supabase
                .from('unduguimages')
                .select('*');

            if (imageError) {
                throw new Error(`Error fetching images: ${imageError.message}`);
            }

            // Fetch all campaign details in parallel
            const combinedData = await Promise.all(
                imageData.map(async (campaign) => {
                    try {
                        const thisCampaign = await viewCampaignDetails(campaign.frid, campaign.fraddress);
                        const { details } = thisCampaign as { details: CampaignDataArgs };

                        // Process campaign data
                        const deadline = new Date(Number(details.deadline) * 1000).toLocaleDateString();
                        const progress = Math.round(
                            Number(details.raisedAmount * BigInt(100) / details.targetAmount)
                        );

                        return {
                            ...details,
                            imageUrl: campaign?.url || null,
                            endDate: deadline,
                            progress: progress.toString()
                        };
                    } catch (error) {
                        console.error(`Error fetching campaign ${campaign.frid}:`, error);
                        return null;
                    }
                })
            );

            // Filter out failed fetches and inactive campaigns
            const filteredData = combinedData
                .filter((campaign): campaign is CombinedCampaignData => 
                    campaign !== null && 
                    !campaign.isCompleted && 
                    !campaign.isCancelled
                );

            setCombined(filteredData);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load campaigns');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-5 grid place-items-center h-screen">
                <div className="text-green-600 flex flex-col justify-center items-center">
                    <span className="text-xl font-semibold">Loading Fundraisers</span>
                    <span className="loading loading-infinity loading-lg"></span>
                </div>
            </div>
        );
    }

    if (combined.length === 0) {
        return (
            <div className="p-5 grid place-items-center h-screen">
                <div className="text-green-600 flex flex-col justify-center items-center">
                    <span className="text-xl">There No Active Fundraisers Yet!</span>
                    <span>......</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="m-1 p-1 flex flex-wrap justify-center items-center">
                {combined.map(campaign => (
                    <div 
                        key={`${campaign.campaignAddress}-${campaign.campaign_id}`}
                        onClick={() => handleRedirect(
                            campaign.campaign_id.toString(),
                            campaign.campaignAddress.toString()
                        )} 
                        className="card card-compact bg-base-100 md:w-1/4 w-full md:h-1/2 shadow-lg m-1 hover:cursor-pointer hover:shadow-green-600 hover:shadow-sm transition duration-300"
                    >
                        <figure className="max-h-60">
                            <img
                                src={campaign.imageUrl || ''}
                                alt={campaign.title} 
                                className=""
                            />
                        </figure>
                        <div className="card-body">
                            <h2 className="text-xl font-semibold w-full line-clamp-2">
                                {campaign.title}
                            </h2>
                            <p className="line-clamp-2 w-full text-base">
                                {campaign.description}
                            </p>
                            <div className="flex">
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
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}