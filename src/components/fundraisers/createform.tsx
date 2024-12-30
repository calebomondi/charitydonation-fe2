import { createCampaign } from "../../blockchain-services/useCharityDonation"
import React, { useRef, useState } from "react"
import { CreateCampaignArgs } from "../../types";

export default function CreateForm() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [formValues, setFormValues] = useState<CreateCampaignArgs>({
        title: '',
        description: '',
        target: '',
        durationDays: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }))
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
            // Store file temporarily
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                localStorage.setItem('pendingCampaignImage', JSON.stringify({
                    name: file.name,
                    type: file.type,
                    data: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setIsLoading(true)
        try {
            await createCampaign(
                {
                    title: formValues.title,
                    description: formValues.description, 
                    target: formValues.target, 
                    durationDays: formValues.durationDays
                }
            );
        } catch (error:any) {
            console.error("Failed to create campaign:", error.message);
        } finally {
            setIsLoading(false)
            setFormValues({
                title: '',
                description: '',
                target: '',
                durationDays: ''
            })
            setSelectedImage(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }

  return (
    <div className="flex justify-center items-center">
        <div className="md:w-1/2 m-2 p-2 border border-green-700  flex flex-col justify-center items-center rounded-lg">
            <h2 className="text-center text-lg font-semibold">Create New Fundraiser</h2>
            <form onSubmit={handleSubmit} className="w-full p-1">
                <label className="input input-bordered flex items-center justify-between gap-2 mb-1 font-semibold text-green-600">
                    Title
                    <input 
                        type="text" 
                        id="title"
                        name="title"
                        value={formValues.title}
                        onChange={handleChange}
                        className="md:w-5/6 p-2 text-white" 
                        placeholder="Fundraiser Name" 
                        required
                    />
                </label>
                <textarea
                    placeholder="Fundraiser descritption"
                    className="textarea textarea-bordered textarea-sm w-full"
                    id="description"
                    name="description"
                    value={formValues.description}
                    onChange={handleChange}
                    required
                >
                </textarea>
                <label className="input input-bordered flex items-center justify-between gap-2 mb-1 font-semibold text-green-600">
                    Target
                    <input 
                        type="text" 
                        id="target"
                        name="target"
                        value={formValues.target}
                        onChange={handleChange}
                        className="text-white md:w-5/6 p-2" 
                        placeholder="In ETH" 
                        required
                    />
                </label>
                <label className="input input-bordered flex items-center justify-between gap-2 mb-1 font-semibold text-green-600">
                    Duration
                    <input 
                        type="text" 
                        id="durationDays"
                        name="durationDays"
                        value={formValues.durationDays}
                        onChange={handleChange}
                        className="md:w-5/6 p-2 text-white" 
                        placeholder="In Days" 
                        required
                    />
                </label>
                <div className="w-full m-1 font-semibold text-green-600">
                    <span>Image Upload</span> <span className="italic text-sm">(1000x1000)</span>
                </div>
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input file-input-bordered w-full" 
                />
                {/*Preview Selected Image */}
                {
                    selectedImage && (
                        <div className="w-full p-2 grid place-items-center">
                            <img
                                src={URL.createObjectURL(selectedImage)}
                                alt="Preview"
                                className="w-48 h-48 rounded-lg"
                            />
                        </div>
                    )
                }
                <div className="p-1 flex justify-center mt-2">
                    <button 
                        type="submit" 
                        className="btn bg-green-700 w-1/2 text-white text-base border border-green-700"
                    >
                        {
                            isLoading ? (<span className="loading loading-ring loading-xs"></span>) : 'create'
                        }
                    </button>
                </div>
            </form>
        </div>
    </div>
  )
}
