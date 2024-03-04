import { useContext, useEffect, useState } from "react";
import { useSSX } from "@spruceid/ssx-react";

import Header from "../Header";
import { ContractsContext } from "../ContractsProvider";
import { getAccountInfo, mint } from '../../utils/BetToken';
import TransactionModel from "../TransactionModal";

function ERC721Page() {
    const { betToken, publicClient } = useContext(ContractsContext);
    const { ssx } = useSSX();
    const [balance, setBalance] = useState('Loading Balance...');
    const [unlock, setUnlock] = useState('Checking if you can mint...');
    const [showTransaction, setShowTransaction] = useState(false);
    const [transaction, setTransaction] = useState({ hash: '', status: 'Pending' });

    const loadStatus = async () => {
        const data = await getAccountInfo(betToken, ssx.address());

        if (data === null) {
            setBalance('Error loading balance');
            setUnlock('Error reading contract');
        } else {
            setBalance(`Balance: ${data.balance}`);
            if (data.balance >= BigInt(3)) {
                setUnlock('You have too many NFTs');
            } else {
                setUnlock('');
            }
        }
    }

    const watchTransaction = async (transactionHash) => {
        try {
            const receipt = await publicClient.waitForTransactionReceipt({
                hash: transactionHash,
                confirmations: 1,
            });

            setTransaction({ hash: transactionHash, status: receipt.status });
            if (receipt.status.toLowerCase() === 'success') {
                loadStatus();
            }
        } catch (error) {
            console.error(error);

            setTransaction({ hash: transactionHash, status: 'Error' });
        }
    }

    const mintNFT = async () => {
        const transactionHash = await mint(betToken, ssx.address());

        if (transactionHash === null) {
            setUnlock('Error minting NFT');
        } else {
            setTransaction({ hash: transactionHash, status: 'Pending' });
            setShowTransaction(true);

            watchTransaction(transactionHash);
        }

    }

    useEffect(() => {
        loadStatus();
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
                            <p className='font-bold text-white'>Mint a NFT! Only mintable if you don't currently own 3+. If you're going to be greedy, just steal!</p>
                            <p className="text-white">{balance}</p>
                        </div>
                        <div className="w-full h-[20%] flex items-center flex-col">
                            <button
                                className='text-black font-bold bg-[#ffff00] w-1/4 py-4 rounded-xl'
                                disabled={unlock !== ''}
                                onClick={mintNFT}
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

export default ERC721Page
