import { addAdmin, removeAdmin } from "../../blockchain-services/useCharityDonation"
import { useState } from "react"

export default function AdminManagement() {
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [isRemoving, setIsRemoving] = useState<boolean>(false)
  const [formValue, setFormValue] = useState<{address: string}>({address : ''})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          const {name, value} = e.target;
          setFormValue((prevValues) => ({
              ...prevValues,
              [name]: value,
          }))
  }

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
    <div className="bg-green-400 flex justify-center items-center p-2">
      <div className="md:w-1/2">
        <div className="join join-vertical w-full">
          <div className="collapse collapse-arrow join-item border-base-300 border">
            <input type="radio" name="my-accordion-4" defaultChecked />
            <div className="collapse-title text-xl font-medium">Fundraiser Admins</div>
            <div className="collapse-content">
              <p>hello</p>
            </div>
          </div>
          <div className="collapse collapse-arrow join-item border-base-300 border">
            <input type="radio" name="my-accordion-4" />
            <div className="collapse-title text-xl font-medium">Add Admin</div>
            <form action="">
              <label className="input input-bordered flex items-center justify-between gap-2 mb-1 font-semibold text-green-600">
                    Title
                    <input 
                        type="text" 
                        id="title"
                        name="title"
                        className="md:w-5/6 p-2 text-white" 
                        placeholder="Fundraiser Name" 
                        required
                    />
                </label>
            </form>
          </div>
          <div className="collapse collapse-arrow join-item border-base-300 border">
            <input type="radio" name="my-accordion-4" />
            <div className="collapse-title text-xl font-medium">Remove Admin</div>
            <div className="collapse-content">
              <p>hello</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/*
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
*/
