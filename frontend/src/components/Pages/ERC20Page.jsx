import { useContext, useEffect, useState } from "react";
import { useSSX } from "@spruceid/ssx-react";

import Header from "../Header";
import { ContractsContext } from "../ContractsProvider";
import { getAccountInfo, mint } from "../../utils/BetCoin";
import TransactionModel from "../TransactionModal";

function ERC20Page() {
    const { betCoin, publicClient } = useContext(ContractsContext);
    const { ssx } = useSSX();
    const [balance, setBalance] = useState('Loading Balance...');
    const [unlock, setUnlock] = useState('');
    const [showTransaction, setShowTransaction] = useState(false);
    const [transaction, setTransaction] = useState({ hash: '', status: 'Pending' });

    /**
     * Loads the balance and unlock date for the user.
     */
    const loadBalance = async () => {
        const data = await getAccountInfo(betCoin, ssx.address());

        if (data === null) {
            setBalance('Error loading balance');
            setUnlock('Error reading contract');
        } else {
            setBalance(`Balance: ${data.balance}`);
            const unlockDate = new Date(Number(data.unlock) * 1000);
            if (unlockDate > new Date()) {
                setUnlock(`Unlock Date: ${unlockDate}`);
            }
        }
    }

    /**
     * Watches a transaction to see if it succeeds or fails
     * 
     * @param {String} transactionHash The hash of the transaction to watch
     */
    const watchTransaction = async (transactionHash) => {
        try {
            const receipt = await publicClient.waitForTransactionReceipt({
                hash: transactionHash,
                confirmations: 1,
            });

            setTransaction({ hash: transactionHash, status: receipt.status });
            if (receipt.status.toLowerCase() === 'success') {
                loadBalance();
            }
        } catch (error) {
            console.error(error);

            setTransaction({ hash: transactionHash, status: 'Error' });
        }
    }

    /**
     * Attempts to mint BetCoin for the user
     */
    const mintCoins = async () => {
        const transactionHash = await mint(betCoin);

        if (transactionHash === null) {
            setUnlock('Error minting Coins');
        } else {
            setTransaction({ hash: transactionHash, status: 'Pending' });
            setShowTransaction(true);

            watchTransaction(transactionHash);
        }

    }

    useEffect(() => {
        loadBalance();
    }, []);

    return (
        <div className='flex flex-col justify-col items-center'>
            {showTransaction ? <TransactionModel
                close={() => setShowTransaction(false)}
                publicClient={publicClient}
                transaction={transaction}
            /> : null}
            <div className='flex flex-col w-full max-w-[1750px] h-[100vh]'>
                <Header />
                <div className='w-full h-full flex justify-center items-center'>
                    <div className='border-4 border-[#ffff00] w-1/2 h-1/2 text-black rounded-xl flex flex-col justify-around items-center px-8 text-xl'>
                        <div>
                            <p className='font-bold text-white'>Mint 50 BetCoin! Only mintable once per week!</p>
                            <p className="text-white">{balance}</p>
                        </div>
                        <div className="w-full h-[20%] flex items-center flex-col">
                            <button
                                className='text-black font-bold bg-[#ffff00] w-1/4 py-4 rounded-xl'
                                disabled={unlock !== ''}
                                onClick={mintCoins}
                            >
                                Mint
                            </button>
                            <p className="text-red-500 text-sm">{unlock}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ERC20Page
