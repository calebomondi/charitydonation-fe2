import { createCampaign } from "../../blockchain-services/useCharityDonation"
import React, { useRef, useState } from "react"
import { CreateCampaignArgs } from "../../types";

import { toast } from "react-toastify";

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

    const TITLE_WORD_LIMIT = 10;
    const DESCRIPTION_WORD_LIMIT = 35;

    const countWords = (text: string): number => {
        return text.trim() ? text.trim().split(/\s+/).length : 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name === 'title') {
            const words = countWords(value);
            if (words <= TITLE_WORD_LIMIT || value.length < formValues.title.length) {
                setFormValues(prev => ({ ...prev, [name]: value }));
            }
        } else if (name === 'description') {
            const words = countWords(value);
            if (words <= DESCRIPTION_WORD_LIMIT || value.length < formValues.description.length) {
                setFormValues(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setFormValues(prev => ({ ...prev, [name]: value }));
        }
    };

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
            //validate input data
            if (isNaN(Number(formValues.target)) || Number(formValues.target) <= 0) {
                throw new Error('Target must be a number and greater than 0')
            }
            if (isNaN(Number(formValues.durationDays)) || Number(formValues.durationDays) <= 0) {
                throw new Error('Duration must be a number and greater than 0')
            }

            await createCampaign(
                {
                    title: formValues.title,
                    description: formValues.description, 
                    target: formValues.target, 
                    durationDays: formValues.durationDays
                }
            );
        } catch (error:any) {
            toast.error(`${error}`)
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

    const remainingTitleWords = TITLE_WORD_LIMIT - countWords(formValues.title);
    const remainingDescriptionWords = DESCRIPTION_WORD_LIMIT - countWords(formValues.description);

  return (
    <div className="flex justify-center items-center">
        <div className="md:w-1/2 m-2 p-2 border border-green-700  flex flex-col justify-center items-center rounded-lg">
            <h2 className="text-center text-lg font-semibold">Create New Fundraiser</h2>
            <form onSubmit={handleSubmit} className="w-full p-1">
                <div className="mb-2">
                    <label className="input input-bordered flex items-center justify-between gap-2 mb-1 font-semibold text-green-600">
                        Title
                        <input 
                            type="text" 
                            id="title"
                            name="title"
                            value={formValues.title}
                            onChange={handleChange}
                            className="md:w-5/6 p-2 darK:text-white text-gray-700" 
                            placeholder="Fundraiser Name" 
                            required
                        />
                    </label>
                    <div className={`text-sm ${remainingTitleWords < 3 ? 'text-red-500' : 'text-gray-500'} text-right`}>
                        {remainingTitleWords} words remaining
                    </div>
                </div>
                <div className="mb-2">
                    <textarea
                        placeholder="Fundraiser description"
                        className="textarea textarea-bordered textarea-sm w-full darK:text-white text-gray-700 text-base"
                        id="description"
                        name="description"
                        value={formValues.description}
                        onChange={handleChange}
                        required
                    />
                    <div className={`text-sm ${remainingDescriptionWords < 10 ? 'text-red-500' : 'text-gray-500'} text-right`}>
                        {remainingDescriptionWords} words remaining
                    </div>
                </div>
                <label className="input input-bordered flex items-center justify-between gap-2 mb-1 font-semibold text-green-600">
                    Target
                    <input 
                        type="text" 
                        id="target"
                        name="target"
                        value={formValues.target}
                        onChange={handleChange}
                        className="darK:text-white text-gray-700 md:w-5/6 p-2" 
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
                        className="md:w-5/6 p-2 darK:text-white text-gray-700" 
                        placeholder="In Days" 
                        required
                    />
                </label>
                <div className="w-full m-1 font-semibold text-green-600">
                    <span>Fundraiser Profile</span>
                </div>
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input file-input-bordered w-full" 
                    required
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
                        className="btn bg-green-700 w-1/2 text-white text-base border border-green-700 hover:bg-green-600"
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
