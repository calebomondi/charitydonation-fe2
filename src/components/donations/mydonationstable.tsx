import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { myDonations } from '../../blockchain-services/useCharityDonation';
import { Donation } from '../../types';


const DonationsTable = () => {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate()

    const handleRedirect = (id: string, address: string) => {
        navigate(`/campaign-details?address=${address}&id=${id}`);
    }

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        try {
            setIsLoading(true);
            const donationData = await myDonations();
            setDonations(donationData);
        } catch (err) {
            setError('Failed to fetch donations');
            console.error('Error fetching donations:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Truncate address for display
    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500 font-semibold">{error}</div>
            </div>
        );
    }

    return (
        <div className="w-full bg-base-100 shadow-lg rounded-lg overflow-hidden mt-2">
            <div className="p-3">
                <div className="relative overflow-hidden">
                    {/* Container with fixed height and scrollable content */}
                    <div className="max-h-[calc(100vh-12rem)] overflow-auto">
                        <table className="min-w-full divide-y divide-green-600">
                            {/* Fixed Header */}
                            <thead className="sticky top-0 bg-green-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Fundraiser
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Address
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                                        Amount (ETH)
                                    </th>
                                </tr>
                            </thead>
                            {/* Scrollable Body */}
                            <tbody className="bg-base-200 divide-y divide-green-600">
                                {donations.length > 0 ? (
                                    donations.map((donation, index) => (
                                        <tr 
                                            key={`${donation.campaignAddress}-${donation.campaignId}-${index}`}
                                            className="hover:bg-gray-200 hover:cursor-pointer transition-colors duration-200"
                                            onClick={() => handleRedirect(donation.campaignId.toString(),donation.campaignAddress)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold ">
                                                {donation.title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {donation.campaignId.toString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className="font-mono">
                                                    {truncateAddress(donation.campaignAddress)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 font-medium">
                                                {Number(donation.amount) / 1e18} ETH
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td 
                                            colSpan={4} 
                                            className="px-6 py-4 text-center text-sm text-gray-500"
                                        >
                                            No donations found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonationsTable;