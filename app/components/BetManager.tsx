'use client'

import { useState, useEffect } from 'react'
import { useBetContract } from '../hooks/useBetContract'
import { useWeb3Auth } from '../contexts/Web3AuthContext'
import { BetStatus } from '../../utilis/betContract'

export default function BetManager() {
  const { user, getAccounts } = useWeb3Auth()
  const { betDetails, isLoading, error, acceptBet, cancelBet, resolveBet, getContractBalance } = useBetContract()
  const [userAddress, setUserAddress] = useState<string>('')
  const [contractBalance, setContractBalance] = useState<string>('0')
  const [betAmount, setBetAmount] = useState<string>('')
  const [selectedWinner, setSelectedWinner] = useState<string>('')

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const accounts = await getAccounts()
        if (accounts.length > 0) {
          setUserAddress(accounts[0])
        }
        
        const balance = await getContractBalance()
        setContractBalance(balance)
      }
    }

    fetchUserData()
  }, [user, betDetails])

  if (!user) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Bet Contract Manager
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Please connect your wallet to interact with the bet contract.
        </p>
      </div>
    )
  }

  const getStatusText = (status: BetStatus) => {
    switch (status) {
      case BetStatus.PENDING: return 'Pending'
      case BetStatus.ACTIVE: return 'Active'
      case BetStatus.RESOLVED: return 'Resolved'
      case BetStatus.CANCELLED: return 'Cancelled'
      default: return 'Unknown'
    }
  }

  const getStatusColor = (status: BetStatus) => {
    switch (status) {
      case BetStatus.PENDING: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case BetStatus.ACTIVE: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case BetStatus.RESOLVED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case BetStatus.CANCELLED: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const handleAcceptBet = async () => {
    if (!betAmount) {
      alert('Please enter bet amount')
      return
    }
    
    const success = await acceptBet(betAmount)
    if (success) {
      setBetAmount('')
      alert('Bet accepted successfully!')
    }
  }

  const handleCancelBet = async () => {
    const success = await cancelBet()
    if (success) {
      alert('Bet cancelled successfully!')
    }
  }

  const handleResolveBet = async () => {
    if (!selectedWinner) {
      alert('Please select a winner')
      return
    }
    
    const success = await resolveBet(selectedWinner)
    if (success) {
      setSelectedWinner('')
      alert('Bet resolved successfully!')
    }
  }

  const formatAddress = (address: string) => {
    if (!address || address === '0x0000000000000000000000000000000000000000') return 'Not set'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatAmount = (amount: string) => {
    if (!amount || amount === '0') return '0'
    return `${parseInt(amount) / 10**18} ETH`
  }

  const formatDeadline = (deadline: string) => {
    if (!deadline || deadline === '0') return 'Not set'
    return new Date(parseInt(deadline) * 1000).toLocaleString()
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
        Bet Contract Manager
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading...</span>
        </div>
      )}

      {betDetails && (
        <div className="space-y-6">
          {/* Bet Details Card */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Current Bet Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(betDetails.status)}`}>
                  {getStatusText(betDetails.status)}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatAmount(betDetails.amount)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Maker</p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">{formatAddress(betDetails.maker)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Taker</p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">{formatAddress(betDetails.taker)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Judge</p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">{formatAddress(betDetails.judge)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Deadline</p>
                <p className="text-sm text-gray-900 dark:text-white">{formatDeadline(betDetails.deadline)}</p>
              </div>
              
              {betDetails.winner !== '0x0000000000000000000000000000000000000000' && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Winner</p>
                  <p className="font-mono text-sm text-green-600 dark:text-green-400">{formatAddress(betDetails.winner)}</p>
                </div>
              )}
            </div>
            
            {betDetails.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                <p className="text-gray-900 dark:text-white">{betDetails.description}</p>
              </div>
            )}
          </div>

          {/* Contract Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Contract Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your Address</p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">{formatAddress(userAddress)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Contract Balance</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatAmount(contractBalance)}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Accept Bet */}
            {betDetails.status === BetStatus.PENDING && betDetails.taker.toLowerCase() === userAddress.toLowerCase() && (
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Bet amount (wei)"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleAcceptBet}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded transition-colors"
                >
                  Accept Bet
                </button>
              </div>
            )}

            {/* Cancel Bet */}
            {(betDetails.status === BetStatus.PENDING || betDetails.status === BetStatus.ACTIVE) && 
             (betDetails.maker.toLowerCase() === userAddress.toLowerCase()) && (
              <button
                onClick={handleCancelBet}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 px-4 rounded transition-colors"
              >
                Cancel Bet
              </button>
            )}

            {/* Resolve Bet */}
            {betDetails.status === BetStatus.ACTIVE && betDetails.judge.toLowerCase() === userAddress.toLowerCase() && (
              <div className="space-y-2">
                <select
                  value={selectedWinner}
                  onChange={(e) => setSelectedWinner(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select Winner</option>
                  <option value={betDetails.maker}>Maker ({formatAddress(betDetails.maker)})</option>
                  <option value={betDetails.taker}>Taker ({formatAddress(betDetails.taker)})</option>
                </select>
                <button
                  onClick={handleResolveBet}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded transition-colors"
                >
                  Resolve Bet
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
