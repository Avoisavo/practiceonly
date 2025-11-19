'use client'

import { useWeb3Auth } from '../contexts/Web3AuthContext'
import { useState } from 'react'

export default function WalletButton() {
  const { user, isLoading, login, logout } = useWeb3Auth()
  const [isExpanded, setIsExpanded] = useState(false)

  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-full p-3 border border-gray-200 dark:border-gray-700">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed top-4 right-4 z-50"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {!user ? (
        <button
          onClick={login}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <div className="w-5 h-5 bg-white rounded-full opacity-80"></div>
          <span className="text-sm">Connect Wallet</span>
        </button>
      ) : (
        <div className={`bg-white dark:bg-gray-900 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isExpanded ? 'w-64' : 'w-12'
        }`}>
          <div className="p-3 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center">
              {user.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt="Profile" 
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-3 h-3 bg-white rounded-full"></div>
              )}
            </div>
            
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name || 'Connected'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email || 'Wallet Connected'}
                </div>
                <button
                  onClick={logout}
                  className="text-xs text-red-600 hover:text-red-700 mt-1"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
