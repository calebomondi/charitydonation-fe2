import { useSearchParams } from "react-router-dom"

import NavBar from "../navbar/navbar"

import { viewCampaignDetails } from "../../blockchain-services/useCharityDonation"

import { CampaignDataArgs, ImageUrls, CombinedCampaignData } from "../../types"
import React, { useState, useEffect } from "react"

import { _web3, getBalanceAndAddress, refundDonors, cancelCampaign, donateToCampaign } from "../../blockchain-services/useCharityDonation"

import { toast } from "react-toastify"

import { supabase } from "../../supabase/supabaseClient"

export default function CampaignDetails() {
    const [campaignImages, setCampaignImages] = useState<ImageUrls[]>([])
    const [combined,setCombined] = useState<CombinedCampaignData[]>([])
    const [admin, setAdmin] = useState<string>('')
    const [isCancelling,setIsCancelling] = useState<boolean>(false)
    const [isRefunding,setIsRefunding] = useState<boolean>(false)
    const [isGiving,setIsGiving] = useState<boolean>(false)
    const [formValue, setFormValue] = useState<{amount: string}>({amount : ''})

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

    //cancel
    const cancel = async () => {
        setIsCancelling(true)

        const id = Number(combined[0].campaign_id)
        const address = combined[0].campaignAddress

        try {
            await cancelCampaign(id,address)
        } catch (error) {
            console.log(`cancel error=> ${error}`)
        } finally {
            setIsCancelling(false)
        }
    }

    //refund
    const refund = async () => {
        setIsRefunding(true)

        const id = Number(combined[0].campaign_id)
        const address = combined[0].campaignAddress

        try {
            await refundDonors(id,address)
        } catch (error) {
            console.log(`refund error=> ${error}`)
        } finally {
            setIsRefunding(false)
        }
    }

    //handlechange
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormValue((prevValues) => ({
            ...prevValues,
            [name]: value,
        }))
    }

    //handle donate
    const handleDonate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsGiving(true)
        try {
            if(isNaN(Number(formValue.amount))) throw Error("Amount To Donate Should Be A Number!")
            if(Number(formValue.amount) <= 0) throw Error("Amount To Donate Should Be Greater Than Zero!")
                
            const id = Number(combined[0].campaign_id)
            const address = combined[0].campaignAddress
            await donateToCampaign(id,address,Number(formValue.amount))
        } catch (error) {
            console.error(`Error When Donating: ${error}`)
        } finally {
            setFormValue({amount : ''})
            setIsGiving(false)
        }
    }

  return (
    <main className="">
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
                                            <p className="text-center">
                                                <span className="font-semibold text-base">Target: </span><span className="font-mono">{_web3.utils.fromWei(campaign.targetAmount,'ether')}</span> sETH
                                            </p>
                                            <p className="text-center">
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
                                                    {
                                                        !campaign.isCancelled && !campaign.isCompleted ? (
                                                            <div className="">
                                                                <>
                                                                    <button className="btn btn-warning btn-sm mx-1" 
                                                                        onClick={()=>{
                                                                            const modal = document.getElementById('my_modal_5');
                                                                            if (modal) {
                                                                                (modal as HTMLDialogElement).showModal();
                                                                            }
                                                                        }}
                                                                    >
                                                                        {isRefunding ? (<span className="loading loading-ring loading-xs"></span>) : 'Refund'}
                                                                    </button>
                                                                    <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
                                                                        <div className="modal-box">
                                                                            <h3 className="font-semibold text-lg text-red-500">Disclaimer!</h3>
                                                                            <p className="py-4">You Are About To Refund This Fundraiser's Donors, Proceed?</p>
                                                                            <div className="modal-action">
                                                                            <form method="dialog">
                                                                                {/* if there is a button in form, it will close the modal */}
                                                                                <button className="btn btn-sm btn-error m-1" onClick={async () => await refund()}>Yes</button>
                                                                                <button className="btn btn-sm btn-success m-1">No</button>
                                                                            </form>
                                                                        </div>
                                                                    </div>
                                                                    </dialog>
                                                                </>
                                                                <>
                                                                    <button className="btn btn-error btn-sm" 
                                                                        onClick={()=>{
                                                                            const modal = document.getElementById('my_modal_6');
                                                                            if (modal) {
                                                                                (modal as HTMLDialogElement).showModal();
                                                                            }
                                                                        }}
                                                                    >
                                                                        {isCancelling ? (<span className="loading loading-ring loading-xs"></span>) : 'Cancel'}
                                                                    </button>
                                                                    <dialog id="my_modal_6" className="modal modal-bottom sm:modal-middle">
                                                                        <div className="modal-box">
                                                                            <h3 className="font-semibold text-lg text-red-500">Disclaimer!</h3>
                                                                            <p className="py-4">You Are About To Cancel This Fundraiser, Proceed?</p>
                                                                            <div className="modal-action">
                                                                                <form method="dialog">
                                                                                    {/* if there is a button in form, it will close the modal */}
                                                                                    <button className="btn btn-sm btn-error m-1" onClick={async () => await cancel()}>Yes</button>
                                                                                    <button className="btn btn-sm btn-success m-1">No</button>
                                                                                </form>
                                                                            </div>
                                                                        </div>
                                                                    </dialog>
                                                                </>
                                                                {/*
                                                                <button className="btn btn-warning btn-sm mx-1" onClick={async () => await refund()}>{isRefunding ? (<span className="loading loading-ring loading-xs"></span>) : 'Refund'}</button>
                                                                <button className="btn btn-error btn-sm" onClick={async () => await cancel()}>{isCancelling ? (<span className="loading loading-ring loading-xs"></span>) : 'Cancel'}</button>
                                                                    */}
                                                            </div>
                                                        ) : (
                                                            campaign.isCompleted ? (
                                                                <div className="grid place-items-center mt-5">
                                                                    <button className="btn btn-success text-white btn-sm mx-1">Withdraw</button>
                                                                </div>
                                                            ) : (
                                                                <p className="text-center text-base text-red-600">No Action Here As This Fundraiser Was Cancelled!</p>
                                                            )
                                                        )
                                                    }
                                                
                                                </div>
                                            ) : (
                                                <div className="grid place-items-center mt-5">
                                                    <button className="btn btn-success text-white btn-sm mx-1" onClick={()=>{
                                                        const modal = document.getElementById('my_modal_3');
                                                        if (modal) {
                                                            (modal as HTMLDialogElement).showModal();
                                                        }
                                                    }}>Donate</button>
                                                    <dialog id="my_modal_3" className="modal">
                                                        <div className="modal-box">
                                                            <form method="dialog">
                                                            {/* if there is a button in form, it will close the modal */}
                                                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                                                            </form>
                                                            <h3 className="font-semibold text-lg text-green-600 p-2 text-center">Sharing Is Caring</h3>
                                                            <div>
                                                                <form onSubmit={handleDonate} className="flex flex-col justify-center items-center p-1">
                                                                    <label className="input input-bordered w-full flex items-center justify-between gap-2 mb-1 font-semibold text-green-600">
                                                                        Amount
                                                                        <input 
                                                                            type="text" 
                                                                            id="amount"
                                                                            name="amount"
                                                                            value={formValue.amount}
                                                                            onChange={handleChange}
                                                                            className="md:w-5/6 p-2 text-white" 
                                                                            placeholder="In ETH" 
                                                                            required
                                                                        />
                                                                    </label>
                                                                    <div className="mt-2 w-full grid place-items-center">
                                                                        <button className="btn btn-success btn-sm text-base-300 w-1/5" type="submit">
                                                                            {isGiving ? (<span className="loading loading-ring loading-xs"></span>) : 'Give'}
                                                                        </button>
                                                                    </div>
                                                                </form>
                                                            </div>
                                                        </div>
                                                    </dialog>
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
