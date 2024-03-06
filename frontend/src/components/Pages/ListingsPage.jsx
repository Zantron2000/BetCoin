import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "../Header";
import { getOwnersForContract } from "../../utils/Alchemy";
import NftCard from "../NftCard";

function ListingsPage() {
    const [search, setSearch] = useState('');
    const [nfts, setNfts] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const nftData = await getOwnersForContract();
            console.log(nftData, 'HERE')
            setNfts(nftData ? nftData : []);
        }

        loadData();
    }, []);

    return (
        <div className='flex flex-col justify-col items-center'>
            <div className='flex flex-col w-full max-w-[1750px] h-[100vh]'>
                <Header />
                <div className='w-full h-full'>
                    <div className="py-4 flex justify-center">
                        <input
                            type='text'
                            placeholder='Search NFTs'
                            className="w-[80%] p-2 rounded text-black outline-none"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="w-full border border-red-600/0">
                        {
                            ...[
                                ...nfts.reduce((acc, { tokenId, owner }) => {
                                    const lastArray = acc[acc.length - 1];

                                    if (tokenId.includes(search)) {
                                        if (lastArray.length < 5) {
                                            lastArray.push({ tokenId, owner });
                                        } else {
                                            acc.push([{ tokenId, owner }]);
                                        }
                                    }

                                    return acc;
                                }, [[]])
                            ].map((nftRow) => {
                                return <div className="w-full flex justify-between p-2">
                                    {
                                        nftRow.map(({ tokenId, owner }) => (
                                            <NftCard
                                                key={tokenId}
                                                tokenId={tokenId}
                                                owner={owner}
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

export default ListingsPage;
