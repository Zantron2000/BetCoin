import { createContext } from "react";
import { useWalletClient } from "wagmi";
import { createPublicClient, http, getContract } from "viem";
import { sepolia } from "viem/chains";
import { useSSX } from "@spruceid/ssx-react";

import betContractAbi from '../../abi/Bet.json';
import betTokenContractAbi from '../../abi/BetToken.json';
import betCoinContractAbi from '../../abi/BetCoin.json';

export const ContractsContext = createContext();

function ContractsProvider({ children }) {
    const { ssx } = useSSX();
    const { data: walletClient } = useWalletClient({
        account: ssx.address()
    });
    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
    });

    const betContract = getContract({
        client: {
            public: publicClient,
            wallet: walletClient,
        },
        address: process.env.VITE_BET_CONTRACT_ADDRESS,
        abi: betContractAbi,
    });
    const betTokenContract = getContract({
        client: {
            public: publicClient,
            wallet: walletClient,
        },
        address: process.env.VITE_BET_TOKEN_CONTRACT_ADDRESS,
        abi: betTokenContractAbi,
    });
    const betCoinContract = getContract({
        client: {
            public: publicClient,
            wallet: walletClient,
        },
        address: process.env.VITE_BET_COIN_CONTRACT_ADDRESS,
        abi: betCoinContractAbi,
    });

    return (
        <ContractsContext.Provider value={{
            bet: betContract,
            betToken: betTokenContract,
            betCoin: betCoinContract,
        }}>
            {children}
        </ContractsContext.Provider>
    );
}

export default ContractsProvider;
