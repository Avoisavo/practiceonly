'use client'

import { useWeb3Auth } from '../contexts/Web3AuthContext'
import { useState, useEffect } from 'react'

export default function WalletConnect() {
  const { web3auth, user, isLoading, login, logout, getAccounts, getBalance } = useWeb3Auth()
  const [userAccounts, setUserAccounts] = useState<string[]>([])
  const [userBalance, setUserBalance] = useState<string>('0')

  useEffect(() => {
    if (user) {
      fetchAccountData()
    }
  }, [user])

  const fetchAccountData = async () => {
    try {
      const accounts = await getAccounts()
      setUserAccounts(accounts)
      
      if (accounts.length > 0) {
        const balance = await getBalance()
        // Convert wei to ETH (simplified)
        const balanceInEth = (parseInt(balance, 16) / 10**18).toFixed(4)
        setUserBalance(balanceInEth)
      }
    } catch (error) {
      console.error('Error fetching account data:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading Web3Auth...</span>
      </div>
    )
  }

  if (!web3auth) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error: Web3Auth not initialized</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
        Web3Auth Wallet
      </h2>
      
      {!user ? (
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect your wallet to get started
          </p>
          <button
            onClick={login}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              {user.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {user.name || 'Anonymous User'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {user.email || 'No email'}
            </p>
          </div>

          {userAccounts.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="text-sm">
                <p className="text-gray-600 dark:text-gray-400 mb-1">Wallet Address:</p>
                <p className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
                  {userAccounts[0]}
                </p>
              </div>
              
              <div className="text-sm mt-3">
                <p className="text-gray-600 dark:text-gray-400 mb-1">Balance:</p>
                <p className="font-semibold text-lg text-gray-900 dark:text-white">
                  {userBalance} ETH
                </p>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  )
}
