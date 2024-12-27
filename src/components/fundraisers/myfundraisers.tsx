import NavBar from "../navbar/navbar"
import ViewMyCampaigns from "./viewmycampaigns"
import CreateForm from "./createform"
import AdminManagement from "./admin"

import { _contract } from "../../blockchain-services/useCharityDonation"

import { useEffect, useState } from "react"
import { ContractLogsSubscription } from "web3-eth-contract"

export default function MyFundraisers() {
  //define display states
  const [viewAdmin, setViewAdmin] = useState<boolean>(false)
  const [viewCreate, setViewCreate] = useState<boolean>(false)
  const [viewCompleted, setViewCompleted] = useState<boolean>(false)
  const [viewCancelled, setViewCancelled] = useState<boolean>(false)
  const [viewActive, setViewActive] = useState<boolean>(true)
  //define event states
  const [campaignCreatedEvent,setCampaignCreatedEvent] = useState<null>()
  const [campaignCancelledEvent,setCampaignCancelledEvent] = useState<null>()
  const [adminAddedEvent,setAdminAddedEvent] = useState<null>()
  const [adminRemovedEvent,setAdminRemovedEvent] = useState<null>()

  useEffect(() => {
    //listen to multiple events
    const subscriptions: ContractLogsSubscription[] = []

    //campaign creation event
    const campaignCreated = _contract.events.CampaignCreated();
    campaignCreated.on('data', (event) => {
        console.log(`Created Campaign ==> ${event.returnValues}`);
        //upload to DB
    });
    campaignCreated.on('error', console.error);
    subscriptions.push(campaignCreated)

    //campaign cancelled event
    const campaignCancelled = _contract.events.CampaignCancelled();
    campaignCancelled.on('data', (event) => {
        console.log(`Campaign Cancelled ==> ${event.returnValues}`);
        //handle event
    });
    campaignCancelled.on('error', console.error);
    subscriptions.push(campaignCancelled)

    //add admin event
    const addAdmin = _contract.events.AddAdmin();
    addAdmin.on('data', (event) => {
        console.log(`Added Admin ==> ${event.returnValues}`);
        //handle event
    });
    addAdmin.on('error', console.error);
    subscriptions.push(addAdmin)

    //add admin event
    const removeAdmin = _contract.events.RemoveAdmin();
    removeAdmin.on('data', (event) => {
        console.log(`Removed Admin ==> ${JSON.stringify(event.returnValues)}`);
        //handle event
    });
    removeAdmin.on('error', console.error);
    subscriptions.push(removeAdmin)

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
        viewCreate && (<CreateForm />)
      }     
      {
        viewAdmin && (<AdminManagement />)
      }
      {
        viewActive && (<ViewMyCampaigns status="active" />)
      } 
      {
        viewCompleted && (<ViewMyCampaigns status="completed" />)
      } 
      {
        viewCancelled && (<ViewMyCampaigns status="cancelled" />)
      } 
    </div>
  )
}
