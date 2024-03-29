import { Link } from 'react-router-dom'
import { useSSX } from '@spruceid/ssx-react'
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useDisconnect } from 'wagmi';

import logo from '../assets/BetCoin.png'
import { useState } from 'react'

function Header() {
    const { open } = useWeb3Modal()
    const { disconnect } = useDisconnect()
    const { ssx } = useSSX();
    const [showModal, setShowModal] = useState(false)

    return (
        <header className='flex justify-between items-center border border-red-500/0 py-2 px-6 w-full'>
            <div>
                <Link to='/' state={{ rerouted: true }}><img src={logo} alt="logo" height={''} width={'150px'} /></Link>
            </div>
            <div className='w-1/4 flex justify-between items-center'>
                <Link to='/nfts' className='text-xl text-white hover:border-b hover:border-white px-2 py-2'>Steal</Link>
                <Link to='/mint' className='text-xl text-white hover:border-b hover:border-white px-2 py-2'>Mint</Link>
                <div className='relative'>
                    <button
                        className='text-xl bg-[#ffff00] hover:bg-yellow-200 text-black px-4 py-2 rounded-lg'
                        onClick={() => ssx?.session() ? setShowModal(!showModal) : open()}
                    >
                        {ssx?.session() ? ssx.address().substring(0, 6) + '...' + + ssx.address().substring(ssx.address().length - 4, ssx.address().length) : 'Sign In'}
                    </button>
                    {
                        showModal ? <div className='bg-white absolute text-black w-full p-2 rounded-lg mt-2'>
                            <div className='text-center'>
                                <Link to='/profile' className='block py-2 border-b border-black'>Profile</Link>
                                <button className='block w-full py-2' onClick={() => disconnect() || setShowModal(false)}>Sign Out</button>
                            </div>
                        </div> : null
                    }
                </div>
            </div>
        </header>
    )
}

export default Header
