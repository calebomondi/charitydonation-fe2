import { useSearchParams } from "react-router-dom"

import NavBar from "../navbar/navbar"

import { viewCampaignDetails } from "../../blockchain-services/useCharityDonation"

import { CampaignDataArgs, ImageUrls, CombinedCampaignData } from "../../types"
import { useState, useEffect } from "react"

import { _web3 } from "../../blockchain-services/useCharityDonation"

import { toast } from "react-toastify"

import { supabase } from "../../supabase/supabaseClient"

export default function CampaignDetails() {
    const [campaignImages, setCampaignImages] = useState<ImageUrls[]>([])
    const [combined,setCombined] = useState<CombinedCampaignData[]>([])

    const [searchParams] = useSearchParams();
    //get individual params
    const address = searchParams.get('address');
    const id = searchParams.get('id');

    useEffect(() => {
        const fetchData = async () => {
            //fetch images
            await fetchCampaignImages()
            //fetch campaign details
            setTimeout( async () => {
                const details = await combinedData()
                setCombined(details)
            }, 1000)
        }
        fetchData()
    })

    //get campaign images
    const fetchCampaignImages = async () => {
        //get account
        try {
            //retrieve image urls
            const { data, error } = await supabase
                .from('unduguimages')
                .select('*')
                .ilike('fraddress', address || '')
                .eq('frid', id || null)

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
    <>
      <NavBar />
      <div>
        {
            combined.length > 0 ? (
                <div>
                    {
                        combined.map(campaign => (
                            <div>
                                {campaign.title}
                            </div>
                        ))
                    }
                </div>
            ) : (
                <div className="flex flex-col m-52 p-5">
                    <div className="text-green-600 flex flex-col justify-center items-center">
                        <span className="text-xl font-semibold">Loading Fundaraiser</span>
                        <span className="loading loading-infinity loading-lg"></span>
                    </div>
                </div>
            )
        }
      </div>
    </>
  )
}
