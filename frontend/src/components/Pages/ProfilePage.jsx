import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useSSX } from "@spruceid/ssx-react";

import Header from "../Header";
import NftCard from "../NftCard";
import { getAccountInfo } from "../../utils/BetCoin";
import { ContractsContext } from "../ContractsProvider";
import { getNFTsForOwner } from "../../utils/Alchemy";

function ProfilePage() {
    const { betCoin } = useContext(ContractsContext)
    const { ssx } = useSSX();
    const [ownedNfts, setOwnedNfts] = useState([]);
    const [balance, setBalance] = useState('Loading balance...');
    const [search, setSearch] = useState('');

    useEffect(() => {
        // Load the user's balance and NFTs
        const loadData = async () => {
            const coinData = await getAccountInfo(betCoin, ssx.address());
            const nftData = await getNFTsForOwner(ssx.address());

            setBalance(coinData ? Number(coinData.balance) : 'Error loading information');
            setOwnedNfts(nftData ? nftData.nfts : []);
        }

        loadData();
    }, []);

    return (
        <div className='flex flex-col justify-col items-center'>
            <div className='flex flex-col w-full max-w-[1750px] h-[100vh]'>
                <Header />
                <div className='w-full h-full'>
                    <div className="py-4 flex justify-between items-center">
                        <input
                            type='text'
                            placeholder='Search NFTs by ID...'
                            className="w-[80%] p-2 rounded text-black outline-none"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <p className="text-lg">Balance: {balance}</p>
                    </div>
                    <div className="w-full border border-red-600/0">
                        {
                            ...[
                                ...ownedNfts.reduce((acc, { tokenId }) => {
                                    const lastArray = acc[acc.length - 1];

                                    if (tokenId.includes(search)) {
                                        if (lastArray.length < 5) {
                                            lastArray.push(tokenId);
                                        } else {
                                            acc.push([tokenId]);
                                        }
                                    }

                                    return acc;
                                }, [[]])
                            ].map((nftRow) => {
                                return <div className="w-full flex justify-between p-2">
                                    {
                                        nftRow.map((tokenId) => (
                                            <NftCard
                                                key={tokenId}
                                                tokenId={tokenId}
                                                owner={ssx.address()}
                                            />
                                        ))
                                    }
                                </div>
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
