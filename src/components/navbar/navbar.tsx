import {useNavigate, useLocation} from 'react-router-dom'
import { Link } from "react-router-dom"
import { useEffect, useState } from 'react'
import { checkIfWalletIsConnected, getBalanceAndAddress } from '../../blockchain-services/useCharityDonation'

export default function NavBar() {
    const navigate = useNavigate()

    const [shortAddress, setShortAddress] = useState<string>('')
    const [balance,setBalance] = useState<string>()

    //get current path
    const location = useLocation()
    console.log(`location: ${location.pathname}`)

    useEffect(() => {
        //check if disconnected
        const redirecteIfNotConnected = async () => {
            const connected = await checkIfWalletIsConnected();
            if (!connected) {
                navigate('/');
            }
        }
        redirecteIfNotConnected();

        //set account address and balance
        const getAccount = async () => {
            const accountData = await getBalanceAndAddress();
            if (accountData) {
                const { account, balanceEth } = accountData;
                setShortAddress(account);
                setBalance(balanceEth);
            }
        }
        getAccount()
    }, [location]);
    
  return (
    <div className="navbar bg-base-100">
        <div className="navbar-start">
            <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
            </div>
            <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
                <li>
                    <Link to="/fundraisers" className={`text-base ${location.pathname === '/fundraisers' && 'text-green-600'}`}>Fundraisers</Link>
                </li>
                <li>
                    <Link to="/my-fundraisers" className={`text-base ${location.pathname === '/my-fundraisers' && 'text-green-600'}`}>My Fundraisers</Link>
                </li>
                <li>
                    <Link to="/my-donations" className={`text-base ${location.pathname === '/my-donations' && 'text-green-600'}`}>My Donations</Link>
                </li>
            </ul>
            </div>
            <a className="btn btn-ghost text-xl">Undugu</a>
        </div>
        <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
                <li>
                    <Link to="/fundraisers" className={`text-base ${location.pathname === '/fundraisers' && 'text-green-600'}`}>Fundraisers</Link>
                </li>
                <li>
                    <Link to="/my-fundraisers" className={`text-base ${location.pathname === '/my-fundraisers' && 'text-green-600'}`}>My Fundraisers</Link>
                </li>
                <li>
                    <Link to="/my-donations" className={`text-base ${location.pathname === '/my-donations' && 'text-green-600'}`}>My Donations</Link>
                </li>
            </ul>
        </div>
        <div className="navbar-end">
            <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                    <div className="w-10 rounded-full">
                    <img
                        alt="Tailwind CSS Navbar component"
                        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                    </div>
                </div>
                <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-4 w-auto p-3 shadow"
                >
                    <li className="h-6 m-1 p-1 flex justify-center items-center text-base text-green-600 font-semibold hover:cursor-pointer">
                        {`${shortAddress.slice(0,6)}....${shortAddress.slice(-4)}`}
                        
                    </li>
                    <li className="h-6 m-1 p-1 flex justify-center items-center text-green-600 font-semibold hover:cursor-pointer">
                        {balance?.slice(0,6)} sETH
                    </li>
                </ul>
            </div>
        </div>
    </div>
  )
}