import { createCampaign, listenToCampaignEvents } from "../../blockchain-services/useCharityDonation"
import { useEffect, useState } from "react"

export default function CreateForm() {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Get contract instance and set up listener
        const unsubscribe = listenToCampaignEvents();
        
        // Cleanup listener when component unmounts
        return () => {
            if (unsubscribe) unsubscribe();
        }
    },[])

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
    <div>
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
