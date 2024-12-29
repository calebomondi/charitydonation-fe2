import NavBar from "../navbar/navbar"
import ViewMyCampaigns from "./viewmycampaigns"
import CreateForm from "./createform"
import AdminManagement from "./admin"

import { _contract, _web3 } from "../../blockchain-services/useCharityDonation"

import { useEffect, useState } from "react"
import { ContractLogsSubscription } from "web3-eth-contract"

import { supabase } from "../../supabase/supabaseClient"

import { toast } from "react-toastify"

export default function MyFundraisers() {
  //campaign creation
  const [creating, setCreating] = useState<boolean>(false)
  //define display states
  const [viewAdmin, setViewAdmin] = useState<boolean>(false)
  const [viewCreate, setViewCreate] = useState<boolean>(false)
  const [viewCompleted, setViewCompleted] = useState<boolean>(false)
  const [viewCancelled, setViewCancelled] = useState<boolean>(false)
  const [viewActive, setViewActive] = useState<boolean>(true)

  useEffect(() => {
    //listen to multiple events
    const subscriptions: ContractLogsSubscription[] = []

    //campaign creation event
    const campaignCreated = _contract.events.CampaignCreated();
    campaignCreated.on('data', async (event) => {
        /*__upload to DB__*/
        // Get stored image data
        const storedImage = localStorage.getItem('pendingCampaignImage');

        if(storedImage) {
          setCreating(true)
          try {
            const imageData = JSON.parse(storedImage);
            // Convert base64 back to file
            const _fetch = await fetch(imageData.data);
            const blob = await _fetch.blob();
            const file = new File([blob], imageData.name, { type: imageData.type });
            
            const campaignId = event.returnValues.campaign_id;
            const campaignAd = event.returnValues.campaignAddress
            const fileExt = file.name.split('.').pop();
            const fileName = `${campaignAd}_${campaignId}.${fileExt}`;

            // Upload to Supabase Storage
            const { error } = await supabase.storage
                .from('undugu')
                .upload(fileName, file);

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('undugu')
                .getPublicUrl(fileName);

            // Store reference in Supabase database
            const { error: dbError } = await supabase
                .from('unduguimages')
                .insert([
                    {
                      fraddress: campaignAd?.toString(),
                      frid: Number(campaignId),
                      url: publicUrl,
                    },
                ]);

            if (dbError) throw dbError;

            // Clear stored image after successful upload
            localStorage.removeItem('pendingCampaignImage');

            setCreating(false)

            //notify creator
            toast.success(`'${event.returnValues.title}' Fundraiser Was Created Successfully!`)

          } catch (error) {
            console.log('Failed To Upload Image: ',error)
            setCreating(false)
          }
        }
    });
    campaignCreated.on('error', console.error);
    subscriptions.push(campaignCreated)

    //campaign cancelled event
    const campaignCancelled = _contract.events.CampaignCancelled();
    campaignCancelled.on('data', (event) => {
        const id = event.returnValues.campaign_id
        toast.success(`You Have Cancelled Fundraiser of ID ${id?.toString()}`)
        //handle event
    });
    campaignCancelled.on('error', console.error);
    subscriptions.push(campaignCancelled)

    //add admin event
    const addAdmin = _contract.events.AddAdmin();
    addAdmin.on('data', (event) => {
      const admin = event.returnValues.admin
      toast.success(`Added ${admin?.toString().slice(0,6)}...${admin?.toString().slice(-4)} As Fundraiser Admin`)
    });
    addAdmin.on('error', console.error);
    subscriptions.push(addAdmin)

    //remove admin event
    const removeAdmin = _contract.events.RemoveAdmin();
    removeAdmin.on('data', (event) => {
      const admin = event.returnValues.admin
      toast.success(`Added ${admin?.toString().slice(0,6)}...${admin?.toString().slice(-4)} As Fundraiser Admin`)
    });
    removeAdmin.on('error', console.error);
    subscriptions.push(removeAdmin)

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

  const manageView = (view:number) => {
    if (view === 1) {
      if (viewCancelled) {
        setViewCancelled(false)
        setViewCompleted(false)
        setViewCreate(false)
        setViewAdmin(false)
        setViewActive(true)
      } else {
        setViewCancelled(true)
        setViewCompleted(false)
        setViewCreate(false)
        setViewAdmin(false)
        setViewActive(false)
      }
    }
    if (view === 2) {
      if (viewCompleted) {
        setViewCancelled(false)
        setViewCompleted(false)
        setViewCreate(false)
        setViewAdmin(false)
        setViewActive(true)
      } else {
        setViewCancelled(false)
        setViewCompleted(true)
        setViewCreate(false)
        setViewAdmin(false)
        setViewActive(false)
      }
    }
    if (view === 3) {
      if (viewCreate) {
        setViewCancelled(false)
        setViewCompleted(false)
        setViewCreate(false)
        setViewAdmin(false)
        setViewActive(true)
      } else {
        setViewCancelled(false)
        setViewCompleted(false)
        setViewCreate(true)
        setViewAdmin(false)
        setViewActive(false)
      }
    }
    if (view === 4) {
      if (viewAdmin) {
        setViewCancelled(false)
        setViewCompleted(false)
        setViewCreate(false)
        setViewAdmin(false)
        setViewActive(true)
      } else {
        setViewCancelled(false)
        setViewCompleted(false)
        setViewCreate(false)
        setViewAdmin(true)
        setViewActive(false)
      }
    }
    if (view === 5) {
      if (!viewActive) {
        setViewCancelled(false)
        setViewCompleted(false)
        setViewCreate(false)
        setViewAdmin(false)
        setViewActive(true)
      }
    }
  }

  return (
    <div>
      <NavBar />   
      <div className="flex justify-center items-center p-2">
        <div className="flex justify-evenly w-full md:w-1/2 p-1">
          <div onClick={() => manageView(1)} className={`font-bold text-green-600 hover:cursor-pointer ${viewCancelled ? 'border-b-green-700 border-b-2' : ''}`}>Cancelled</div>
          <div onClick={() => manageView(2)} className={`font-bold text-green-600 hover:cursor-pointer ${viewCompleted ? 'border-b-green-700 border-b-2' : ''}`}>Completed</div>
          <div onClick={() => manageView(5)} className={`font-bold text-green-600 hover:cursor-pointer ${viewActive ? 'border-b-green-700 border-b-2' : ''}`}>Active</div>
          <div onClick={() => manageView(3)} className={`font-bold text-green-600 hover:cursor-pointer ${viewCreate ? 'border-b-green-700 border-b-2' : ''}`}>Create</div>
          <div onClick={() => manageView(4)} className={`font-bold text-green-600 hover:cursor-pointer ${viewAdmin ? 'border-b-green-700 border-b-2' : ''}`}>Admins</div>
        </div>
      </div>
      {
        viewCreate && (
          <>
            {
              creating ? (
                <div className="w-full bg-green-600 bg-opacity-60 h-dvh grid place-items-center">
                  <div className="flex justify-center items-center flex-col p-1 bg-black bg-opacity-50 rounded-xl">
                    <span className="text-lg font-mono">Working on your fundraiser</span> <span className="loading loading-infinity loading-lg"></span>
                  </div>
                </div>
              ) : (
                <CreateForm />
              )
            }
          </>
        )
      }     
      {
        viewAdmin && (<AdminManagement />)
      }
      {
        viewActive && (<ViewMyCampaigns status="Active" />)
      } 
      {
        viewCompleted && (<ViewMyCampaigns status="Completed" />)
      } 
      {
        viewCancelled && (<ViewMyCampaigns status="Cancelled" />)
      } 
    </div>
  )
}
