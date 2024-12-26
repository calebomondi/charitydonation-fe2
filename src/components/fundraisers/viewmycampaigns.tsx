import { myCampaigns } from "../../blockchain-services/useCharityDonation"
import { CampaignDataArgs } from "../../types"
import { useState, useEffect } from "react"

export default function ViewMyCampaigns() {
    const [campaigns, setCampaigns] = useState<CampaignDataArgs[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const result = await myCampaigns()
            console.log(`result: ${result.length}`)
            setCampaigns(result)
        }
        fetchData()
    }, [])
  return (
    <div>
        <h2 className="text-red-500 font-mono">My Campaigns</h2>
        {
            campaigns.map((campaign : CampaignDataArgs) => (
                <div key={campaign.campaign_id}>
                    <p>{campaign.title}</p>
                </div>
            ))
        }
    </div>
  )
}
