'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Web3Auth, WEB3AUTH_NETWORK } from '@web3auth/modal'
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider'
import { IProvider, CHAIN_NAMESPACES } from '@web3auth/base'

interface Web3AuthContextType {
  web3auth: Web3Auth | null
  provider: IProvider | null
  user: any
  isLoading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  getAccounts: () => Promise<string[]>
  getBalance: () => Promise<string>
}

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined)

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "YOUR_WEB3AUTH_CLIENT_ID"

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7", // Sepolia Testnet
  rpcTarget: "https://rpc.sepolia.org",
  displayName: "Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "SepoliaETH",
  tickerName: "Sepolia Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
}

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
})

export function Web3AuthProvider({ children }: { children: ReactNode }) {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null)
  const [provider, setProvider] = useState<IProvider | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const web3authInstance = new Web3Auth({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // Use SAPPHIRE_MAINNET for production
          privateKeyProvider,
        })

        await web3authInstance.init()
        setWeb3auth(web3authInstance)

        if (web3authInstance.connected) {
          setProvider(web3authInstance.provider)
          const userInfo = await web3authInstance.getUserInfo()
          setUser(userInfo)
        }
      } catch (error) {
        console.error("Error initializing Web3Auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  const login = async () => {
    if (!web3auth) {
      console.log("Web3Auth not initialized yet")
      return
    }
    
    try {
      const web3authProvider = await web3auth.connect()
      setProvider(web3authProvider)
      
      if (web3auth.connected) {
        const userInfo = await web3auth.getUserInfo()
        setUser(userInfo)
      }
    } catch (error) {
      console.error("Error during login:", error)
    }
  }

  const logout = async () => {
    if (!web3auth) {
      console.log("Web3Auth not initialized yet")
      return
    }
    
    try {
      await web3auth.logout()
      setProvider(null)
      setUser(null)
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const getAccounts = async (): Promise<string[]> => {
    if (!provider) {
      console.log("Provider not initialized yet")
      return []
    }
    
    try {
      const accounts = await provider.request({
        method: "eth_accounts",
      })
      return accounts as string[]
    } catch (error) {
      console.error("Error getting accounts:", error)
      return []
    }
  }

  const getBalance = async (): Promise<string> => {
    if (!provider) {
      console.log("Provider not initialized yet")
      return "0"
    }
    
    try {
      const accounts = await getAccounts()
      if (accounts.length === 0) return "0"
      
      const balance = await provider.request({
        method: "eth_getBalance",
        params: [accounts[0], "latest"],
      })
      return balance as string
    } catch (error) {
      console.error("Error getting balance:", error)
      return "0"
    }
  }

  const contextValue: Web3AuthContextType = {
    web3auth,
    provider,
    user,
    isLoading,
    login,
    logout,
    getAccounts,
    getBalance,
  }

  return (
    <Web3AuthContext.Provider value={contextValue}>
      {children}
    </Web3AuthContext.Provider>
  )
}

export function useWeb3Auth() {
  const context = useContext(Web3AuthContext)
  if (context === undefined) {
    throw new Error('useWeb3Auth must be used within a Web3AuthProvider')
  }
  return context
}
