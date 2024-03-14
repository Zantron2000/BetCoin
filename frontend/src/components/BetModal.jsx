function BetModal({ transaction, close }) {
    return (
        <div className="absolute">
            <div className="flex w-screen h-screen justify-center items-center">
                <div className="w-[35%] h-[35%] flex flex-col justify-between items-center bg-black border-4 border-[#ffff00] rounded-lg">
                    <div className="h-[15%] w-full flex items-center justify-between p-4">
                        <div className="w-1/4" />
                        <div className="w-1/2 flex justify-center">Transaction</div>
                        <div className="w-1/4 flex justify-end">
                            <button
                                className="font-bold border-white border-2 py-2 px-3 rounded-xl hover:bg-[#ffff00] hover:text-black"
                                onClick={close}
                            >
                                X
                            </button>
                        </div>
                    </div>
                    <div className="h-full w-full px-[20%] flex justify-center flex-col items-center">
                        <p>Transaction {transaction.hash}</p>
                        <p>Status: {transaction.status}</p>
                        <p>Bet: {transaction.bet}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BetModal
