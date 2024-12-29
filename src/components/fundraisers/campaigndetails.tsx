import { useSearchParams } from "react-router-dom"

import NavBar from "../navbar/navbar"

import { viewCampaignDetails } from "../../blockchain-services/useCharityDonation"

import { CampaignDataArgs, ImageUrls, CombinedCampaignData } from "../../types"
import { useState, useEffect } from "react"

import { _web3, getBalanceAndAddress } from "../../blockchain-services/useCharityDonation"

import { toast } from "react-toastify"

import { supabase } from "../../supabase/supabaseClient"

export default function CampaignDetails() {
    const [campaignImages, setCampaignImages] = useState<ImageUrls[]>([])
    const [combined,setCombined] = useState<CombinedCampaignData[]>([])
    const [admin, setAdmin] = useState<string>('')

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
            //check if admin
            await checkIfAdmin()
        }
        fetchData()
    })

    //check if admin
    const checkIfAdmin = async () => {
        const balanceAndAddress = await getBalanceAndAddress();
        if (!balanceAndAddress) {
            throw new Error('Failed to get balance and address');
        }
        const { account } = balanceAndAddress;
        setAdmin(account)
    }

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
    <main className="h-screen">
      <NavBar />
      <div className="p-1 h-4/5 grid place-items-center">
        {
            combined.length > 0 ? (
                <div className="w-full">
                    {
                        combined.map(campaign => (
                            <div className="flex flex-col md:flex-row h-full m-1 rounded-lg border border-green-600 shadow-xl">
                                <div className="md:w-1/2 grid place-items-center p-1">
                                    <img 
                                        src={campaign?.imageUrl || ''} 
                                        alt="" 
                                        className="md:max-h-96 md:w-3/4 rounded-lg"
                                    />
                                </div>
                                <div className="md:w-1/2 grid place-items-center">
                                    <div className="p-2">
                                        <h2 className="font-semibold text-2xl text-center">{campaign.title}</h2>
                                        <p className="text-lg text-center p-1">{campaign.description}</p>
                                        <div className="flex justify-evenly p-1">
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
                                        <div>
                                            <p className="text-center">
                                                <span className="font-semibold text-base">Deadline: </span><span>{campaign.endDate}</span>
                                            </p>
                                        </div>
                                        {
                                            _web3.utils.toChecksumAddress(admin) === _web3.utils.toChecksumAddress(campaign.campaignAddress) ? (
                                                <div className="grid place-items-center mt-5">
                                                    <div className="">
                                                        <button className="btn btn-warning btn-sm mx-1">Refund</button>
                                                        <button className="btn btn-error btn-sm">Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid place-items-center mt-5">
                                                    <button className="btn btn-success text-white btn-sm mx-1">Donate</button>
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            ) : (
                <div className="p-5 grid place-items-center h-screen">
                    <div className="text-green-600 flex flex-col justify-center items-center">
                        <span className="text-xl font-semibold">Loading Fundaraiser</span>
                        <span className="loading loading-infinity loading-lg"></span>
                    </div>
                </div>
            )
        }
      </div>
    </main>
  )
}
