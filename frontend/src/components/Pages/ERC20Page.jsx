import Header from "../Header";

function ERC20Page() {
    return (
        <div className='flex flex-col justify-col items-center'>
            <div className='flex flex-col w-full max-w-[1750px] h-[100vh]'>
                <Header />
                <div className='w-full h-full flex justify-center items-center'>
                    <div className='border-4 border-[#ffff00] w-1/2 h-1/2 text-black rounded-xl flex flex-col justify-around items-center px-8 text-xl'>
                        <p className='font-bold text-white'>Mint 50 BetCoin! Only mintable once per week!</p>
                        <button className='text-black font-bold bg-[#ffff00] w-1/4 h-[10%] rounded-xl'>Mint</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ERC20Page
