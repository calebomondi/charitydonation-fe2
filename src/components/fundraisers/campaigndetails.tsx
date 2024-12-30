import { useSearchParams } from "react-router-dom"

import NavBar from "../navbar/navbar"

import { CampaignDataArgs, ImageUrls, CombinedCampaignData, CampaignDonors } from "../../types"
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { _contract, _web3, getBalanceAndAddress, refundDonors, cancelCampaign, donateToCampaign, viewCampaignDetails, withdrawFromCampaign } from "../../blockchain-services/useCharityDonation"
import { ContractLogsSubscription } from "web3-eth-contract"

import { toast } from "react-toastify"

import { supabase } from "../../supabase/supabaseClient"

export default function CampaignDetails() {
    //storage
    const [campaignImages, setCampaignImages] = useState<ImageUrls[]>([])
    const [combined,setCombined] = useState<CombinedCampaignData[]>([])
    const [admin, setAdmin] = useState<string>('')
    const [campaignDonors,setCampaignDonors] = useState<CampaignDonors[]>([])
    //progress
    const [isCancelling,setIsCancelling] = useState<boolean>(false)
    const [isRefunding,setIsRefunding] = useState<boolean>(false)
    const [isGiving,setIsGiving] = useState<boolean>(false)
    const [isSending,setIsSending] = useState<boolean>(false)
    //form values
    const [formValue, setFormValue] = useState<{amount: string}>({amount : ''})
    const [formValueW, setFormValueW] = useState<{recipient:string, amount: string}>({recipient: '', amount : ''})

    const navigate = useNavigate()

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

    useEffect(() => {
        //listen to multiple events
        const subscriptions: ContractLogsSubscription[] = []
    
        //campaign cancelled event
        const campaignCancelled = _contract.events.CampaignCancelled();
        campaignCancelled.on('data', (event) => {
            const id = event.returnValues.campaign_id
            toast.success(`You Have Cancelled Fundraiser of ID ${id?.toString()}`)
            //handle event
            setTimeout(() => {
                navigate("/my-fundraisers")
            },1000)
        });
        campaignCancelled.on('error', console.error);
        subscriptions.push(campaignCancelled)
    
        //donate event
        const donateToCampaign = _contract.events.DonationReceived();
        donateToCampaign.on('data', (event) => {
          const amount = event.returnValues.amount as bigint
          toast.success(`Received Donation of ${_web3.utils.fromWei(amount,'ether')} sETH, Thank You 🙂`)
        });
        donateToCampaign.on('error', console.error);
        subscriptions.push(donateToCampaign)
    
        //withdraw event
        const withdrawFromCampaign = _contract.events.FundsWithdrawn();
        withdrawFromCampaign.on('data', (event) => {
          const amount = event.returnValues.amount as bigint
          const recipeint = event.returnValues.to as string
          toast.success(`${_web3.utils.fromWei(amount,'ether')} Sent To ${recipeint.slice(0,6)}...${recipeint.slice(-4)}`)
        });
        withdrawFromCampaign.on('error', console.error);
        subscriptions.push(withdrawFromCampaign)
    
        //refund donors event
        const refundDonors = _contract.events.RefundCampaignDonors();
        refundDonors.on('data', (event) => {
          const amount = event.returnValues.amount as bigint
          const recipeint = event.returnValues.to as string
          toast.success(`Refunded Donor ${recipeint?.toString().slice(0,6)}...${recipeint?.toString().slice(-4)} Amount ${_web3.utils.fromWei(amount,'ether')} sETH`)
        });
        refundDonors.on('error', console.error);
        subscriptions.push(refundDonors)
    
        //unsubscribe
        return () => {
          subscriptions.forEach(sub => sub.unsubscribe());
        };
    
      },[_contract])

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
            const { donors } = thisCampaign as {donors: CampaignDonors[]}
            setCampaignDonors(donors)
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
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormValue((prevValues) => ({
            ...prevValues,
            [name]: value,
        }))
    }
    const handleWithdrawalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormValueW((prevValues) => ({...prevValues, [name]: value}))
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
            toast.error(`${error}`)
        } finally {
            setFormValue({amount : ''})
            setIsGiving(false)
        }
    }

    //handle withdraw
    const handleWithdrawal = async (e: React.FormEvent) => {
        e.preventDefault()
       
        setIsSending(true)
        try {
            //validate
            if(isNaN(Number(formValueW.amount))) throw Error("Amount To Donate Should Be A Number!")
            if(Number(formValueW.amount) <= 0) throw Error("Amount To Donate Should Be Greater Than Zero!")
            if(!_web3.utils.isAddress(formValueW.recipient)) throw Error("Enter A Valid Ethereum Address!")
            //get id and address
            const id = Number(combined[0].campaign_id)
            const address = combined[0].campaignAddress

            await withdrawFromCampaign(id,address,Number(formValueW.amount),formValueW.recipient)

        } catch (error) {
            console.error(`Error When Donating: ${error}`)
            toast.error(`${error}`)
        } finally {
            setFormValueW({recipient: '', amount : ''})
            setIsSending(false)
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
                                        {
                                            campaign.isCompleted ? (
                                                <p className="text-center">
                                                    <span className="font-semibold text-base">Balance: </span><span>{_web3.utils.fromWei(campaign.balance,'ether')} sETH</span>
                                                </p>
                                            ) : (
                                                <p className="text-center">
                                                    <span className="font-semibold text-base">Deadline: </span><span>{campaign.endDate}</span>
                                                </p>
                                            )
                                        }
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
                                                                    {isRefunding ? (<p className="text-center"><span>Refunding </span><span className="loading loading-ring loading-xs"></span></p>) : 'Refund'}
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
                                                                    {isCancelling ? (<p className="text-center"><span>Cancelling </span><span className="loading loading-ring loading-xs"></span></p>) : 'Cancel'}
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
                                                        </div>
                                                    ) : (
                                                        campaign.isCompleted ? (
                                                            <div className="grid place-items-center mt-5">
                                                                <button 
                                                                    className="btn btn-success text-white btn-sm mx-1" 
                                                                    onClick={()=>{
                                                                        const modal = document.getElementById('my_modal_9');
                                                                        if (modal) {
                                                                            (modal as HTMLDialogElement).showModal();
                                                                        }
                                                                    }}
                                                                >
                                                                    Transact
                                                                </button>
                                                                <dialog id="my_modal_9" className="modal">
                                                                    <div className="modal-box">
                                                                        <form method="dialog">
                                                                        {/* if there is a button in form, it will close the modal */}
                                                                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                                                                        </form>
                                                                        <h3 className="font-semibold text-lg text-green-600 p-2 text-center">Distribute To Benefeciary</h3>
                                                                        <div>
                                                                            <form onSubmit={handleWithdrawal} className="flex flex-col justify-center items-center p-1">
                                                                                <label className="input input-bordered w-full flex items-center justify-between gap-2 mb-1 font-semibold text-green-600">
                                                                                    Recipient
                                                                                    <input 
                                                                                        type="text" 
                                                                                        id="recipient"
                                                                                        name="recipient"
                                                                                        value={formValueW.recipient}
                                                                                        onChange={handleWithdrawalChange}
                                                                                        className="md:w-5/6 p-2 text-white" 
                                                                                        placeholder="Address" 
                                                                                        required
                                                                                    />
                                                                                </label>
                                                                                <label className="input input-bordered w-full flex items-center justify-between gap-2 mb-1 font-semibold text-green-600">
                                                                                    Amount
                                                                                    <input 
                                                                                        type="text" 
                                                                                        id="amount"
                                                                                        name="amount"
                                                                                        value={formValueW.amount}
                                                                                        onChange={handleWithdrawalChange}
                                                                                        className="md:w-5/6 p-2 text-white" 
                                                                                        placeholder="In ETH" 
                                                                                        required
                                                                                    />
                                                                                </label>
                                                                                <div className="mt-2 w-full grid place-items-center">
                                                                                    <button className="btn btn-success btn-sm text-base-300 w-1/5" type="submit">
                                                                                        {isSending ? (<p className="text-center"><span>Sending </span><span className="loading loading-ring loading-xs"></span></p>) : 'Send'}
                                                                                    </button>
                                                                                </div>
                                                                            </form>
                                                                        </div>
                                                                    </div>
                                                                </dialog>
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
                                                                        {isGiving ? (<p className="text-center"><span>Sending </span><span className="loading loading-ring loading-xs"></span></p>) : 'Give'}
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
    <div className="p-1">
        {campaignDonors.length > 0 && (
            <>
            <h2>Fundraiser Donors</h2>
            <p><span>Total: </span><span>{campaignDonors.length}</span></p>
            <div>
                {campaignDonors.map((donor, index) => (
                    <div key={index}>
                        <p>
                            <span>{index + 1}. </span><span>{donor.address.slice(0,6)}...{donor.address.slice(-5)} - {donor.amount.toString()}</span>
                        </p>
                    </div>
                ))}
            </div>
            </>
        )}
    </div>
    </main>
  )
}
