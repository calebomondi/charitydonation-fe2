import { addAdmin, removeAdmin } from "../../blockchain-services/useCharityDonation"
import React, { useState } from "react"

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
      await addAdmin(formValue.address)
      setIsAdding(false)
    } catch (error) {
      console.error(`Error When Adding Admin ${error}`)
    } finally {
      setFormValue({address: ''})
      setIsAdding(false)
    }
  }

  const handleRemoveAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsRemoving(true)
    try {
      await removeAdmin('0xC099f8A2C5117C81652A506aFfE10a6E77e79808')
      setIsRemoving(false)
    } catch (error) {
      console.error(`Error When Removing Admin ${error}`)
    } finally {
      setFormValue({address: ''})
      setIsRemoving(false)
    }
  }

  return (
    <div className="flex justify-center items-center p-2">
      <div className="md:w-1/2">
        <div className="join join-vertical w-full">
          <div className="collapse collapse-arrow join-item border-green-700 border">
            <input type="radio" name="my-accordion-4" defaultChecked />
            <div className="collapse-title text-xl font-medium">Fundraiser Admins</div>
            <div className="collapse-content">
              <p>hello</p>
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
                        className="md:w-5/6 p-2 text-white" 
                        value={formValue.address}
                        onChange={handleChange}
                        placeholder="Admin's Address" 
                        required
                    />
                  </label>
                  <div className="p-1 flex justify-center">
                    <button 
                      type="submit" 
                      className="btn bg-green-700 w-1/2 text-white text-base border border-green-700"
                    >
                      {
                        isAdding ? 'Adding ...' : 'Add'
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
                        className="md:w-5/6 p-2 text-white" 
                        value={formValue.address}
                        onChange={handleChange}
                        placeholder="Admin's Address" 
                        required
                    />
                  </label>
                  <div className="p-1 flex justify-center">
                    <button 
                      type="submit" 
                      className="btn bg-green-700 w-1/2 text-white text-base border border-green-700"
                    >
                      {
                        isRemoving ? 'Removing ...' : 'Remove'
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
