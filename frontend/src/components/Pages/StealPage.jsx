

import { useLocation, useParams } from "react-router-dom";
import { useSSX } from "@spruceid/ssx-react";
import { decodeEventLog, parseAbiItem } from "viem";

import Header from "../Header";
import { useContext, useEffect, useState } from "react";
import { getTokenInfo } from "../../utils/BetToken";
import { ContractsContext } from "../ContractsProvider";
import { getAccountInfo } from "../../utils/BetCoin";
import { getWagerInfo, bet as submitBet } from "../../utils/Bet";

import betAbi from "../../../abi/Bet.json";
import BetModal from "../BetModal";

function StealPage() {
    const { state } = useLocation();
    const { betToken, betCoin, bet, publicClient } = useContext(ContractsContext);
    const { ssx } = useSSX();
    const { id: pathId } = useParams();
    const [tokenId, setTokenId] = useState(pathId);
    const [owner, setOwner] = useState(state?.owner || 'Loading owner...');
    const [wager, setWager] = useState('Loading wager...');
    const [balance, setBalance] = useState('Loading balance...');
    const [requestId, setRequestId] = useState('');
    const [unwatchFns, setUnwatchFns] = useState([]);
    const [transaction, setTransaction] = useState({ hash: '', status: 'Pending', bet: 'Waiting for transaction to finish' });
    const [showTransaction, setShowTransaction] = useState(false);

    /**
     * Submits and listens to a bet transaction
     */
    const makeBet = async () => {
        try {
            const hash = await submitBet(bet, pathId);
            if (!hash) throw new Error('Transaction failed');

            setShowTransaction(true);
            setTransaction({ hash, status: 'Pending', bet: 'Waiting for transaction to finish' });

            const receipt = await publicClient.waitForTransactionReceipt({
                hash
            });

            setTransaction({ hash, status: receipt.status, bet: 'Waiting for bet results' });
            setBalance(balance - wager);

            // Extracts the event emitted to get the request ID
            const betPlacedLog = receipt.logs.find((log) => {
                return log.address.toLowerCase() === import.meta.env.VITE_BET_CONTRACT_ADDRESS.toLowerCase() && decodeEventLog({
                    abi: betAbi,
                    data: log.data,
                    topics: log.topics
                }).eventName === 'BetPlaced';
            });
            if (!betPlacedLog) throw new Error('Invalid transaction');

            // Decodes and saves the request ID
            setRequestId(decodeEventLog({
                abi: betAbi,
                data: betPlacedLog.data,
                topics: betPlacedLog.topics
            }).args.requestId)
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        /**
         * Loads the owner and token data provided by the URL
         */
        const loadData = async () => {
            if (owner === 'Loading owner...' || tokenId !== pathId) {
                const { owner } = await getTokenInfo(betToken, pathId);

                setOwner(owner || 'Error loading owner');
            }
            const coinData = await getAccountInfo(betCoin, ssx.address());
            const wagerData = await getWagerInfo(bet, pathId);

            setTokenId(pathId);
            setBalance(coinData?.balance != null ? Number(coinData.balance) : 'Error loading balance');
            setWager(wagerData?.wager != null ? Number(wagerData.wager) : 'Error loading wager');
        }

        loadData();
    }, [pathId]);

    useEffect(() => {
        if (requestId && !unwatchFns.length) {
            // Watches for the BetWon and BetLost events
            const unwatchWin = bet.watchEvent.BetWon({
                better: ssx.address(),
                tokenId: pathId,
                requestId,
            }, {
                onLogs: (logs) => {
                    setTransaction({ ...transaction, bet: `You won! Stealing NFT #${pathId}` });
                    setOwner(ssx.address());
                    setBalance(balance + wager);

                    setRequestId('');
                }
            });

            const unwatchLose = bet.watchEvent.BetLost({
                better: ssx.address(),
                tokenId: pathId,
                requestId,
            }, {
                onLogs: (logs) => {
                    setTransaction({ ...transaction, bet: `You lost! Failed to steal NFT #${pathId}` });

                    setRequestId('');
                }
            });

            setUnwatchFns([unwatchWin, unwatchLose]);
        } else if (!requestId && unwatchFns.length) {
            // Unwatches the events if the request ID is cleared
            unwatchFns.forEach((unwatch) => { try { unwatch() } catch (error) { } });
            setUnwatchFns([]);
        }
    }, [requestId])

    return (
        <div className='flex flex-col justify-col items-center'>
            {showTransaction ? <BetModal transaction={transaction} close={() => setShowTransaction(false)} /> : null}
            <div className='flex flex-col w-full max-w-[1750px] h-[100vh]'>
                <Header />
                <div className='w-full h-full flex'>
                    <div className="w-1/2 border border-red-500/0 flex items-start p-4">
                        <img src={`https://api.cloudnouns.com/v1/pfp?text=${tokenId}`} className="w-full" />
                    </div>
                    <div className="w-1/2 border border-red-500/0 p-4">
                        <div className="text-xl font-bold">
                            <h1>NFT #{tokenId}</h1>
                        </div>
                        <div>
                            Owner: {owner}
                        </div>
                        {
                            owner?.startsWith('0x') && owner !== ssx.address() ? (
                                <div className="py-2 w-1/2">
                                    <div className="flex justify-between">
                                        <p>{!Number.isNaN(Number(wager)) ? `Cost to Steal: ${wager}` : wager}</p>
                                        <p>{!Number.isNaN(Number(balance)) ? `Current Balance: ${balance}` : balance}</p>
                                    </div>
                                    <div>
                                        <button
                                            className="bg-[#ffff00] text-black px-4 py-2 rounded-lg w-full font-bold"
                                            disabled={requestId}
                                            onClick={makeBet}
                                        >
                                            Steal
                                        </button>
                                    </div>
                                </div>
                            ) : null
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StealPage;
