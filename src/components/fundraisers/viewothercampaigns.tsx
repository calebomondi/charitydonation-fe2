import { viewCampaignDetails } from "../../blockchain-services/useCharityDonation"

import { CampaignDataArgs, ImageUrls, CombinedCampaignData } from "../../types"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { _web3 } from "../../blockchain-services/useCharityDonation"

import { toast } from "react-toastify"

import { supabase } from "../../supabase/supabaseClient"

export default function ViewOtherCampaigns() {
    const [campaignImages, setCampaignImages] = useState<ImageUrls[]>([])
    const [combined,setCombined] = useState<CombinedCampaignData[]>([])

    const navigate = useNavigate()

    const handleRedirect = (id:string,address:string) => {
        navigate(`/campaign-details?address=${address}&id=${id}`);
    }

    useEffect(() => {
        const fetchData = async () => {
            //fetch images
            await fetchCampaignImages()
            //fetch campaign details
            setTimeout( async () => {
                const details = filterCampaigns(await combinedData())
                setCombined(details)
            }, 1000)
        }
        fetchData()
    })

    //filter campaigns only get active one 
    const filterCampaigns = (unfilteredCampaigns: CombinedCampaignData[]): CombinedCampaignData[] => {
        let filteredCampaigns = unfilteredCampaigns.filter(
            campaign => !campaign.isCompleted && !campaign.isCancelled
        )
        return filteredCampaigns
    }

    //get campaign images
    const fetchCampaignImages = async () => {
        //get account
        try {
            //retrieve image urls
            const { data, error } = await supabase
                .from('unduguimages')
                .select('*')

            if (error) {
                console.error('Error fetching images:', error);
                return;
            }

            setCampaignImages(data)

        } catch (error) {
            console.log(`Could Not Load Images From DataBase: ${error}`)
            toast.error(`Could Not Load Images From DataBase!`)
        }
    };

    //combine db and sm data
    const combinedData = async () : Promise<CombinedCampaignData[]> => {
        const data = await Promise.all(campaignImages.map(async (campaign) => {
            //get campaign data
            const thisCampaign = await viewCampaignDetails(campaign.frid,campaign.fraddress)

            //destructure
            const { details } = thisCampaign as { details: CampaignDataArgs }
            console.log(`url: ${campaign.url}`)
            console.log(`details: ${details.title}`)
            //add enddate
            const ts = Number(details.deadline) * 1000
            const deadline = new Date(ts).toLocaleDateString();

            //add progress
            const find = details.raisedAmount / details.targetAmount * BigInt(100)
            const progress = Math.round(Number(find))
        
            return {
            ...details,
            imageUrl: campaign?.url || null,
            endDate: deadline,
            progress: progress.toString()
            };
        }));

        return data
    }

  return (
    <div>
        {
            combined.length > 0 ? (
                <div className="m-1 p-1 flex flex-wrap justify-center items-center">
                    {
                        combined.map(campaign => (
                            <div onClick={() => handleRedirect(campaign.campaign_id.toString(),campaign.campaignAddress.toString())} className="card card-compact bg-base-100 md:w-1/4 w-full md:h-1/2 shadow-lg m-1 hover:cursor-pointer hover:shadow-green-600 hover:shadow-sm transition duration-300">
                                <figure className="max-h-60">
                                    <img
                                    src={campaign.imageUrl || ''}
                                    alt="" 
                                    className=""
                                />
                                </figure>
                                <div className="card-body">
                                    <h2 className="text-xl font-semibold w-full line-clamp-2">{campaign.title}</h2>
                                    <p className="line-clamp-2 w-full text-base">
                                        {campaign.description}
                                    </p>
                                    <div className="flex">
                                        <p className="">
                                            <span className="font-semibold text-base">Target: </span><span className="font-mono">{_web3.utils.fromWei(campaign.targetAmount,'ether')}</span> sETH
                                        </p>
                                        <p className="">
                                            <span className="font-semibold text-base">Raised: </span><span className="font-mono">{_web3.utils.fromWei(campaign.raisedAmount,'ether')}</span> sETH
                                        </p>
                                    </div>
                                    <div>
                                        <progress className="progress progress-success w-full" value={campaign.progress} max="100"></progress>
                                    </div>                                    
                                </div>
                            </div>
                        ))
                    }
                </div>
            ) : (
                <div className="p-5 grid place-items-center h-screen">
                    <div className="text-green-600 flex flex-col justify-center items-center">
                        <span className="text-xl font-semibold">Loading Fundaraisers</span>
                        <span className="loading loading-infinity loading-lg"></span>
                    </div>
                </div>
            )
        }
    </div>
  )
}
