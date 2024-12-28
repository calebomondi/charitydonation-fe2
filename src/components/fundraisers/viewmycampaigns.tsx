import { myCampaigns } from "../../blockchain-services/useCharityDonation"
import { CampaignDataArgs } from "../../types"
import { useState, useEffect } from "react"

export default function ViewMyCampaigns({status}:{status:string}) {
    const [campaigns, setCampaigns] = useState<CampaignDataArgs[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const result = await myCampaigns()
            console.log(`result: ${result.length}`)
            const filtered = filterCampaigns(status,result)
            setCampaigns(filtered)
        }
        fetchData()
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

  return (
    <div>
        {
            campaigns.length > 0 ? (
                campaigns.map((campaign : CampaignDataArgs) => (
                    <div key={campaign.campaign_id}>
                        <p>{campaign.title}</p>
                    </div>
                ))
            ) : (
                <div className="text-green-400 p-2 m-2 h-1/3 grid place-items-center">
                    <p className="p-1 text-lg font-semibold mt-10 text-center">There Are No Campigns Under This Category!</p>
                    <span className="loading loading-dots loading-lg"></span>
                </div>
            )
        }
    </div>
  )
}
