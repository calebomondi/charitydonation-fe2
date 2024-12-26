import { useDisconnect, useAccount } from 'wagmi'
import {useNavigate} from 'react-router-dom'
import { Link } from "react-router-dom"
import { useEffect, useState } from 'react'

export default function NavBar() {
    const navigate = useNavigate()
    const account = useAccount()
    const { disconnect } = useDisconnect()

    const [shortAddress, setShortAddress] = useState<string>('')

    useEffect(() => {
        if (account.status === 'disconnected') {
            navigate('/')
        }
        if (account.addresses) {
            setShortAddress(`${account.addresses.toString().slice(0, 6)}...${account.addresses.toString().slice(-4)}`)  
        }
    }, [account.status]);

    //disconnect the user and navigate to the home page
    const handleDisconnect = () => {
        disconnect()
        navigate('/')
    }
    
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
                    <Link to="/donate" className='text-base'>Donate</Link>
                </li>
                <li>
                    <Link to="/my-donations" className='text-base'>My Donations</Link>
                </li>
                <li>
                    <Link to="/fundraisers" className='text-base'>Fundraisers</Link>
                </li>
                <li>
                    <Link to="/my-fundraisers" className='text-base'>My Fundraisers</Link>
                </li>
            </ul>
            </div>
            <a className="btn btn-ghost text-xl">Undugu</a>
        </div>
        <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
                <li>
                    <Link to="/donate" className='text-base'>Donate</Link>
                </li>
                <li>
                    <Link to="/my-donations" className='text-base'>My Donations</Link>
                </li>
                <li>
                    <Link to="/fundraisers" className='text-base'>Fundraisers</Link>
                </li>
                <li>
                    <Link to="/my-fundraisers" className='text-base'>My Fundraisers</Link>
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
                    <li className="h-6 m-1 p-1 flex justify-center items-center text-base">
                        {shortAddress}
                    </li>
                    <li className="h-6 m-1 p-1 flex justify-center items-center">
                        <button className='text-base' onClick={() => handleDisconnect()}>Disconnect</button>
                    </li>
                </ul>
            </div>
        </div>
    </div>
  )
}