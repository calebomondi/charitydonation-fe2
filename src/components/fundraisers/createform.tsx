import { createCampaign } from "../../blockchain-services/useCharityDonation"
import { useState } from "react"

export default function CreateForm() {
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        setIsLoading(true)
        try {
            await createCampaign(
                {
                    title: "test campaign 04",
                    description: "A random campaign", 
                    target: "0.01", 
                    durationDays: "10"
                }
            );
        } catch (error:any) {
            console.error("Failed to create campaign:", error.message);
        } finally {
            setIsLoading(false)
        }
    }

  return (
    <div className="bg-teal-400">
      <button 
        onClick={handleCreate} 
        className="btn btn-warning"
        disabled={isLoading}
    >
        {
            isLoading ? 'creating ...' : 'create campaign'
        }
      </button>
    </div>
  )
}
