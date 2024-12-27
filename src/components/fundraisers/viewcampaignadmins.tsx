import { useEffect, useState } from "react"
import { getCampaignAdmins, _contract } from "../../blockchain-services/useCharityDonation"

export default function ViewCampaignAdmins() {
    const [campaignAdmins, setCampaignAdmins] = useState<string[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const admins = await getCampaignAdmins()
            if(admins.length > 0) {
              const uniqueArray = [...new Set(admins)]
              setCampaignAdmins(uniqueArray)
            }
        }
        fetchData()
    },[_contract])

    const copyToClipboard = (address:string) => {
      navigator.clipboard.writeText(address)
      alert('Address Copied')
    }

  return (
    <div className="font-mono text-green-600">
      {
        campaignAdmins.map((admin, index) => (
            <p key={index} className="truncate w-full py-1 flex justify-between">
              <span className="tooltip tooltip-right tooltip-success" data-tip={admin}>{`${index + 1}. ${admin.slice(0,6)}...${admin.slice(-5)}`}</span>
              <div className="badge badge-outline hover:cursor-pointer" onClick={() => copyToClipboard(admin)}>copy</div>
            </p>
        ))
      }
    </div>
  )
}
