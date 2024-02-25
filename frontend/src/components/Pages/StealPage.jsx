import Header from "../Header";

function StealPage() {
    return (
        <div className='flex flex-col justify-col items-center'>
            <div className='flex flex-col w-full max-w-[1750px] h-[100vh]'>
                <Header />
                <div className='w-full h-full flex'>
                    <div className="w-1/2 border border-red-500/0 flex items-start p-4">
                        <img src="https://api.cloudnouns.com/v1/pfp?text=0" className="w-full" />
                    </div>
                    <div className="w-1/2 border border-red-500/0 p-4">
                        <div className="text-xl font-bold">
                            <h1>NFT #0</h1>
                        </div>
                        <div>
                            Owner: 0x0000...0000
                        </div>
                        <div className="py-2">
                            <div>
                                Cost to Steal: 20 BC
                            </div>
                            <div>
                                <button className="bg-[#ffff00] text-black px-4 py-2 rounded-lg w-1/2 font-bold">
                                    Steal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StealPage;
