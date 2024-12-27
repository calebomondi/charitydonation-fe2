import NavBar from "../navbar/navbar"
import ViewMyCampaigns from "./viewmycampaigns"
import CreateForm from "./createform"
import AdminManagement from "./admin"
import ViewCampaignAdmins from "./viewcampaignadmins"

import { _contract } from "../../blockchain-services/useCharityDonation"

import { useEffect, useState } from "react"
import { ContractLogsSubscription } from "web3-eth-contract"

export default function MyFundraisers() {
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

  return (
    <main>
      <NavBar />   
      <CreateForm />     
      <AdminManagement />
      <ViewMyCampaigns /> 
      <ViewCampaignAdmins />
    </main>
  )
}
