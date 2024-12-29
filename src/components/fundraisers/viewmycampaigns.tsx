import {  } from "../../blockchain-services/useCharityDonation"
import { CampaignDataArgs, ImageUrls, CombinedCampaignData } from "../../types"
import { useState, useEffect } from "react"

import { useNavigate } from "react-router-dom"

import { _web3 } from "../../blockchain-services/useCharityDonation"

import { getBalanceAndAddress, myCampaigns } from "../../blockchain-services/useCharityDonation"

import { toast } from "react-toastify"

import { supabase } from "../../supabase/supabaseClient"

export default function ViewMyCampaigns({status}:{status:string}) {
    const [campaignImages, setCampaignImages] = useState<ImageUrls[]>([])
    const [campaigns, setCampaigns] = useState<CampaignDataArgs[]>([])
    const [combined,setCombined] = useState<CombinedCampaignData[]>([])

    const navigate = useNavigate()

    const handleRedirect = (id:string,address:string) => {
        navigate(`/campaign-details?address=${address}&id=${id}`);
    }

    useEffect(() => {
        const fetchData = async () => {
            //get campaign images
            await fetchCampaignImages()
            //get campaigns then filter
            const result = await myCampaigns()
            console.log(`result: ${result.length}`)
            const filtered = filterCampaigns(status,result)
            setCampaigns(filtered)
        }
        fetchData()
        //combine data
    }, [])

    //filter according to campaign status
    const filterCampaigns = (status:string, unfilteredCampaigns: CampaignDataArgs[]): CampaignDataArgs[] => {
        let filteredCampaigns:CampaignDataArgs[] = []

        if (status === 'Active') {
            filteredCampaigns = unfilteredCampaigns.filter(campaign => !campaign.isCompleted && !campaign.isCancelled)
        }
        if (status === 'Completed') {
            filteredCampaigns = unfilteredCampaigns.filter(campaign => campaign.isCompleted)
        }
        if (status === 'Cancelled') {
            filteredCampaigns = unfilteredCampaigns.filter(campaign => campaign.isCancelled)
        }

        return filteredCampaigns
    }

    //get campaign images
    const fetchCampaignImages = async () => {
        //get account
        try {
            const balanceAndAddress = await getBalanceAndAddress();
            if (!balanceAndAddress) {
                throw new Error('Failed to get balance and address');
            }
            const { account } = balanceAndAddress;

            //retrieve image urls
            const { data, error } = await supabase
                .from('unduguimages')
                .select('*')
                .ilike('fraddress', account)

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

    const combinedData = campaigns.map((campaign) => {
        //add image url
        const image = campaignImages.find(
          (img) => img.frid === Number(campaign.campaign_id)
        );

        //add enddate
        const ts = Number(campaign.deadline) * 1000
        const deadline = new Date(ts).toLocaleDateString();

        //add progress
        const find = campaign.raisedAmount / campaign.targetAmount * BigInt(100)
        const progress = Math.round(Number(find))
      
        return {
          ...campaign,
          imageUrl: image?.url || null, // Add imageUrl property
          endDate: deadline,
          progress: progress.toString()
        };
    });

    setTimeout(() =>{
        setCombined(combinedData)
    },1000)

  return (
    <div>
        {
            campaigns.length > 0 ? (
                <div className="m-1 p-1 flex flex-wrap justify-center items-center">
                    {
                        combined.map(campaign => (
                            <>
                                {
                                    campaign.imageUrl && (
                                        <div className="card card-compact bg-base-100 md:w-1/4 w-full md:h-1/2 shadow-lg m-1 hover:shadow-green-600 hover:shadow-sm transition duration-300 hover:cursor-pointer" onClick={() => handleRedirect(campaign.campaign_id.toString(),campaign.campaignAddress.toString())}>
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
                                                <p>
                                                    <span className="font-semibold text-base">Deadline: </span><span>{campaign.endDate}</span>
                                                </p>
                                            </div>
                                        </div>
                                    )
                                }
                            </>
                        ))
                    }
                </div>
            ) : (
                <div className="text-green-400 p-2 m-2 h-1/3 grid place-items-center">
                    <p className="p-1 text-lg font-semibold mt-10 text-center">You Have No {status} Fundraisers Yet!</p>
                    <span className="loading loading-dots loading-lg"></span>
                </div>
            )
        }
    </div>
  )
}
