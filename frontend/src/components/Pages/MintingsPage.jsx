import { Link } from "react-router-dom";

import Header from "../Header";

function MintingsPage() {
    return (
        <div className='flex flex-col justify-col items-center'>
            <div className='flex flex-col w-full max-w-[1750px] h-[100vh]'>
                <Header />
                <div className='w-full h-full flex'>
                    <div className="w-1/2 border border-red-500/0 flex items-start p-4 rounded-xl">
                        <Link to="/mint/erc20" className="text-2xl block w-full h-full rounded-xl border-4 hover:border-[#ffff00] p-4 flex justify-center items-center">
                            Mint ERC20 Tokens
                        </Link>
                    </div>
                    <div className="w-1/2 border border-red-500/0 p-4 rounded-xl">
                        <Link to="/mint/erc721" className="text-2xl block w-full h-full rounded-xl border-4 hover:border-[#ffff00] p-4 flex justify-center items-center">
                            Mint ERC721 Tokens
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MintingsPage
