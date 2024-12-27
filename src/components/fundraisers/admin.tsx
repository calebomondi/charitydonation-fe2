import { addAdmin, removeAdmin } from "../../blockchain-services/useCharityDonation"
import { useState } from "react"

export default function AdminManagement() {
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [isRemoving, setIsRemoving] = useState<boolean>(false)

  const handleAddAdmin = async () => {
    setIsAdding(true)
    try {
      await addAdmin('0xC099f8A2C5117C81652A506aFfE10a6E77e79808')
      setIsAdding(false)
    } catch (error) {
      console.error(`Error When Adding Admin ${error}`)
    }
  }

  const handleRemoveAdmin = async () => {
    setIsRemoving(true)
    try {
      await removeAdmin('0xC099f8A2C5117C81652A506aFfE10a6E77e79808')
      setIsRemoving(false)
    } catch (error) {
      console.error(`Error When Removing Admin ${error}`)
    }
  }

  return (
    <div className="bg-green-400">
      <button className="btn btn-accent" onClick={handleAddAdmin}>
        {
          isAdding ? 'Adding ...' : 'Add Admin'
        }
      </button>
      <button className="btn btn-success" onClick={handleRemoveAdmin}>
        {
          isRemoving ? 'Removing ...' : 'Remove Admin'
        }
      </button>
    </div>
  )
}
