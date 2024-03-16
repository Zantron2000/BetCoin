import {
  createHashRouter,
  RouterProvider,
} from 'react-router-dom'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { WagmiProvider } from "wagmi";
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './App.css'
import HomePage from './components/Pages/HomePage';
import ListingsPage from './components/Pages/ListingsPage';
import StealPage from './components/Pages/StealPage';
import MintingsPage from './components/Pages/MintingsPage';
import ERC20Page from './components/Pages/ERC20Page';
import ERC721Page from './components/Pages/ERC721Page';
import ProfilePage from './components/Pages/ProfilePage';
import SSXWatchProvider from './components/SSXWatchProvider';
import Authenticated from './components/Authenticated';
import ContractsProvider from './components/ContractsProvider';

// Prepares WalletConnect web3modal
const projectId = import.meta.env.VITE_PROJECT_ID;
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}
const chains = [sepolia]
const wagmiConfig = defaultWagmiConfig({
  chains, projectId, metadata, themeMode: 'dark', themeVariables: {
    '--w3m-accent	': '#000000',
    '--w3m-color-mix': '#00BB7F',
    '--w3m-color-mix-strength': 40
  }
})
createWeb3Modal({ wagmiConfig, projectId, chains })

const queryClient = new QueryClient()

// Prepares the router
const router = createHashRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/nfts',
    element: <Authenticated><ListingsPage /></Authenticated>,
  },
  {
    path: '/nfts/:id',
    element: <Authenticated><ContractsProvider><StealPage /></ContractsProvider></Authenticated>,
  },
  {
    path: '/mint',
    element: <Authenticated><MintingsPage /></Authenticated>,
  },
  {
    path: '/mint/erc20',
    element: <Authenticated><ContractsProvider><ERC20Page /></ContractsProvider></Authenticated>,
  },
  {
    path: '/mint/erc721',
    element: <Authenticated><ContractsProvider><ERC721Page /></ContractsProvider></Authenticated>,
  },
  {
    path: '/profile',
    element: <Authenticated><ContractsProvider><ProfilePage /></ContractsProvider></Authenticated>,
  },
]);

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SSXWatchProvider>
          <RouterProvider router={router} />
        </SSXWatchProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
