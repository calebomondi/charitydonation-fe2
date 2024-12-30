import { viewCampaignDetails } from "../../blockchain-services/useCharityDonation"

import { useState, useEffect } from "react"

export default function Donors({id, address} : {id: number, address:string}) {
    const [campaignDonors,setCampaignDonors] = useState<string[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const thisCampaign = await viewCampaignDetails(id,address)
            const {donors} = thisCampaign 
            if(donors.length > 0)
                setCampaignDonors(donors)
        }
        fetchData()
    },[])
    console.log(`donors => ${campaignDonors.length}`)
  return (
    <div>
        <h2>Donors For This Campaign</h2>
        <div>
            <div>
                <p><span>Total: </span><span>{campaignDonors.length}</span></p>
            </div>
            <div>
                {
                    campaignDonors.map((donor,index) => (
                        <p key={index}>
                            {donor}
                        </p>
                    ))
                }
            </div>
        </div>
    </div>
  )
}
