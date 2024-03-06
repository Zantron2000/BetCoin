import { Link } from "react-router-dom"

function NftCard({ tokenId, owner }) {
    return (
        <Link
            to={`/nfts/${tokenId}`}
            className="border-2 border-white hover:border-[#ffff00] w-1/6 h-96 rounded-lg block"
            state={{ owner }}
        >
            <div className="w-full flex justify-center">
                <img src={`https://api.cloudnouns.com/v1/pfp?text=${tokenId}`} alt="nft" className="w-[100%] rounded-t-lg" />
            </div>
            <div className="p-2">
                <h1 className="text-lg font-bold">NFT #{tokenId}</h1>
                <p>Owned by: {owner.slice(0, 6) + '...' + owner.slice(-4)}</p>
            </div>
        </Link>
    )
}

export default NftCard
