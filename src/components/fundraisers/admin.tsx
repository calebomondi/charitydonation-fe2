import { addAdmin, removeAdmin } from "../../blockchain-services/useCharityDonation"
import React, { useState } from "react"
import { toast } from "react-toastify"
import { _web3 } from "../../blockchain-services/useCharityDonation"
import ViewCampaignAdmins from "./viewcampaignadmins"

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

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsAdding(true)
    try {
      //validate
      if(!_web3.utils.isAddress(formValue.address)) throw Error("Enter A Valid Ethereum Address!")

      await addAdmin(formValue.address)
      setIsAdding(false)
    } catch (error) {
      console.error(`Error When Adding Admin ${error}`)
      toast.error(`${error}`)
    } finally {
      setFormValue({address: ''})
      setIsAdding(false)
    }
  }

  const handleRemoveAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsRemoving(true)

    try {
      //validate
      if(!_web3.utils.isAddress(formValue.address)) throw Error("Enter A Valid Ethereum Address!")

      await removeAdmin(formValue.address)
      setIsRemoving(false)
    } catch (error) {
      toast.error(`${error}`)
      console.error(`Error When Removing Admin ${error}`)
    } finally {
      setFormValue({address: ''})
      setIsRemoving(false)
    }
  }

  return (
    <div className="flex justify-center items-center p-2">
      <div className="md:w-1/2 m-2 p-2 w-full">
        <div className="join join-vertical w-full">
          <div className="collapse collapse-arrow join-item border-green-700 border">
            <input type="radio" name="my-accordion-4" defaultChecked />
            <div className="collapse-title text-xl font-medium">Fundraiser Admins</div>
            <div className="collapse-content">
              <ViewCampaignAdmins />
            </div>
          </div>
          <div className="collapse collapse-arrow join-item border-green-700 border">
            <input type="radio" name="my-accordion-4" />
            <div className="collapse-title text-xl font-medium">Add Admin</div>
            <div className="collapse-content">
              <form onSubmit={handleAddAdmin}>
                <label className="input input-bordered flex items-center justify-between gap-2 mb-1 font-semibold text-green-600">
                    Address
                    <input 
                        type="text" 
                        id="address"
                        name="address"
                        className="md:w-5/6 p-2 darK:text-white text-gray-700" 
                        value={formValue.address}
                        onChange={handleChange}
                        placeholder="Admin's Address" 
                        required
                    />
                  </label>
                  <div className="p-1 flex justify-center">
                    <button 
                      type="submit" 
                      className="btn bg-green-700 w-1/2 text-white text-base border border-green-700 hover:bg-green-600"
                    >
                      {
                        isAdding ? (<span className="loading loading-ring loading-xs"></span>) : 'Add'
                      }
                    </button>
                  </div>
              </form>
            </div>
          </div>
          <div className="collapse collapse-arrow join-item border-green-700 border">
            <input type="radio" name="my-accordion-4" />
            <div className="collapse-title text-xl font-medium">Remove Admin</div>
            <div className="collapse-content">
              <form onSubmit={handleRemoveAdmin}>
                <label className="input input-bordered flex items-center justify-between gap-2 mb-1 font-semibold text-green-600">
                    Address
                    <input 
                        type="text" 
                        id="address"
                        name="address"
                        className="md:w-5/6 p-2 darK:text-white text-gray-700" 
                        value={formValue.address}
                        onChange={handleChange}
                        placeholder="Admin's Address" 
                        required
                    />
                  </label>
                  <div className="p-1 flex justify-center">
                    <button 
                      type="submit" 
                      className="btn bg-green-700 w-1/2 text-white text-base border border-green-700 hover:bg-green-600"
                    >
                      {
                        isRemoving ? (<span className="loading loading-ring loading-xs"></span>) : 'Remove'
                      }
                    </button>
                  </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
