import { useSSX } from "@spruceid/ssx-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWeb3Modal } from "@web3modal/wagmi/react";

import Header from "../Header";
import { useEffect, useState } from "react";

function HomePage() {
    const { ssx } = useSSX();
    const { open } = useWeb3Modal();
    const { state } = useLocation();
    const navigate = useNavigate();
    const [clicked, setClicked] = useState(false);

    const enterApp = () => {
        setClicked(true);

        if (ssx?.session()) {
            navigate("/profile");
        } else {
            open()
        }
    }

    useEffect(() => {
        if (ssx?.session() && clicked) {
            navigate("/profile");
        }
    }, [ssx?.session()])

    return (
        <div className='flex flex-col justify-col items-center'>
            <div className='flex flex-col w-full max-w-[1750px] h-[100vh]'>
                <Header />
                <div className='w-full h-full flex justify-center items-center'>
                    <div className='bg-[#ffff00] w-1/2 h-1/2 text-black rounded-xl flex flex-col justify-around items-center px-8 text-xl'>
                        <p className='font-bold'>Web3, the start of decentralization. Now let's throw an a little chaos! Nothing is permanent with BetCoin, everything is temporary. Think you can hold onto your wallet before someone steals it?</p>
                        <button
                            className='text-white bg-black w-1/4 h-[10%] rounded-xl'
                            onClick={enterApp}
                        >
                            Enter App
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage
