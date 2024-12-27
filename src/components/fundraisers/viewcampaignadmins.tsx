import { useEffect, useState } from "react"
import { getCampaignAdmins, _contract } from "../../blockchain-services/useCharityDonation"

export default function ViewCampaignAdmins() {
    const [campaignAdmins, setCampaignAdmins] = useState<string[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const admins = await getCampaignAdmins()
            
            console.log(`admins -> ${admins}`)
            if(admins.length > 0)
                setCampaignAdmins(admins)
        }
        fetchData()
    },[_contract])

  return (
    <div className="">
        <h2 className="text-red-500 font-mono">Admins</h2>
      {
        campaignAdmins.map((admin, index) => (
            <p key={index}>
                {admin}
            </p>
        ))
      }
    </div>
  )
}
