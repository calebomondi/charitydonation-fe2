import { myCampaigns } from "../../blockchain-services/useCharityDonation"
import { CampaignDataArgs, ImageUrls, CombinedCampaignData } from "../../types"
import { useState, useEffect } from "react"

import { _web3 } from "../../blockchain-services/useCharityDonation"

import { getBalanceAndAddress } from "../../blockchain-services/useCharityDonation"

import { toast } from "react-toastify"

import { supabase } from "../../supabase/supabaseClient"

export default function ViewMyCampaigns({status}:{status:string}) {
    const [campaignImages, setCampaignImages] = useState<ImageUrls[]>([])
    const [campaigns, setCampaigns] = useState<CampaignDataArgs[]>([])
    const [combined,setCombined] = useState<CombinedCampaignData[]>([])

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

        if (status === 'active') {
            filteredCampaigns = unfilteredCampaigns.filter(campaign => !campaign.isCompleted && !campaign.isCancelled)
        }
        if (status === 'completed') {
            filteredCampaigns = unfilteredCampaigns.filter(campaign => campaign.isCompleted)
        }
        if (status === 'cancelled') {
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
                                        <div className="card card-compact bg-base-100 w-1/4 md:h-1/2 shadow-xl m-1">
                                            <figure className="max-h-60">
                                                <img
                                                src={campaign.imageUrl || ''}
                                                alt="" 
                                                className=""
                                            />
                                            </figure>
                                            <div className="card-body">
                                                <h2 className="text-2xl font-semibold w-full truncate">{campaign.title}</h2>
                                                <p className="truncate w-full text-lg">
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
                                                <div className="card-actions justify-end">
                                                    <div className=" justify-end">
                                                        <button className="btn btn-warning btn-sm mx-1">Refund</button>
                                                        <button className="btn btn-error btn-sm">Cancel</button>
                                                    </div>
                                                </div>
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
                    <p className="p-1 text-lg font-semibold mt-10 text-center">There Are No Campaigns Under This Category!</p>
                    <span className="loading loading-dots loading-lg"></span>
                </div>
            )
        }
    </div>
  )
}
