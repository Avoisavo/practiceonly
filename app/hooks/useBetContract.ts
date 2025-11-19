'use client'

import { useState, useEffect } from 'react'
import { useWeb3Auth } from '../contexts/Web3AuthContext'
import { contractAddress, betABI, BetDetails, BetStatus } from '../../utilis/betContract'

export function useBetContract() {
  const { provider, user } = useWeb3Auth()
  const [betDetails, setBetDetails] = useState<BetDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper function to decode hex string to address
  const hexToAddress = (hex: string, offset: number): string => {
    const start = 2 + offset * 64 + 24 // Skip 0x, go to offset, skip padding
    return '0x' + hex.slice(start, start + 40)
  }

  // Helper function to decode hex string to uint256
  const hexToUint256 = (hex: string, offset: number): string => {
    const start = 2 + offset * 64
    const value = hex.slice(start, start + 64)
    return BigInt('0x' + value).toString()
  }

  // Helper function to decode hex string to string
  const hexToString = (hex: string, offset: number): string => {
    const start = 2 + offset * 64
    const lengthHex = hex.slice(start, start + 64)
    const length = parseInt(lengthHex, 16) * 2
    const stringStart = start + 64
    const stringHex = hex.slice(stringStart, stringStart + length)
    
    let result = ''
    for (let i = 0; i < stringHex.length; i += 2) {
      const charCode = parseInt(stringHex.slice(i, i + 2), 16)
      if (charCode !== 0) {
        result += String.fromCharCode(charCode)
      }
    }
    return result
  }

  // Get bet details from contract
  const fetchBetDetails = async () => {
    if (!provider) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await provider.request({
        method: 'eth_call',
        params: [
          {
            to: contractAddress,
            data: '0x5b69da68' // getBetDetails() function selector
          },
          'latest'
        ]
      }) as string

      if (!result || result === '0x') {
        setError('No bet data found - contract may not be deployed or have no active bet')
        return
      }

      // Decode the ABI-encoded result
      // getBetDetails returns: (address,address,address,uint256,string,uint256,uint8,address)
      const cleanHex = result.startsWith('0x') ? result.slice(2) : result
      
      if (cleanHex.length < 64 * 8) { // Should have at least 8 32-byte values
        setError('Invalid response format from contract')
        return
      }

      const maker = hexToAddress(result, 0)
      const taker = hexToAddress(result, 1)
      const judge = hexToAddress(result, 2)
      const amount = hexToUint256(result, 3)
      // String is at offset 4, but it's dynamic so we need to read the pointer
      const stringPointer = parseInt(hexToUint256(result, 4))
      const deadline = hexToUint256(result, 5)
      const status = parseInt(hexToUint256(result, 6)) as BetStatus
      const winner = hexToAddress(result, 7)
      
      // For string, we need to read from the pointer location
      let description = 'No description'
      try {
        const stringOffset = Math.floor(stringPointer / 32)
        description = hexToString(result, stringOffset)
      } catch {
        // If string decoding fails, use default
        description = 'Description unavailable'
      }

      setBetDetails({
        maker,
        taker,
        judge,
        amount,
        description,
        deadline,
        status,
        winner
      })
    } catch (err) {
      setError(`Failed to fetch bet details: ${err instanceof Error ? err.message : 'Unknown error'}`)
      console.error('Error fetching bet details:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Accept a bet
  const acceptBet = async (amount: string) => {
    if (!provider) {
      setError('Wallet not connected')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const accounts = await provider.request({
        method: 'eth_accounts'
      }) as string[]

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: accounts[0],
          to: contractAddress,
          data: '0x4a0a9ed5', // acceptBet() function selector
          value: `0x${parseInt(amount).toString(16)}` // Convert amount to hex
        }]
      })

      console.log('Transaction sent:', txHash)
      await fetchBetDetails() // Refresh bet details
      return true
    } catch (err) {
      setError('Failed to accept bet')
      console.error('Error accepting bet:', err)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Cancel a bet
  const cancelBet = async () => {
    if (!provider) {
      setError('Wallet not connected')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const accounts = await provider.request({
        method: 'eth_accounts'
      }) as string[]

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: accounts[0],
          to: contractAddress,
          data: '0x5b5d7c2e' // cancelBet() function selector
        }]
      })

      console.log('Transaction sent:', txHash)
      await fetchBetDetails() // Refresh bet details
      return true
    } catch (err) {
      setError('Failed to cancel bet')
      console.error('Error cancelling bet:', err)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Resolve a bet (judge only)
  const resolveBet = async (winner: string) => {
    if (!provider) {
      setError('Wallet not connected')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const accounts = await provider.request({
        method: 'eth_accounts'
      }) as string[]

      // Encode the winner address in the function call data
      const data = '0x57e871e7' + winner.slice(2).padStart(64, '0') // resolveBet(address) function selector + padded address

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: accounts[0],
          to: contractAddress,
          data: data
        }]
      })

      console.log('Transaction sent:', txHash)
      await fetchBetDetails() // Refresh bet details
      return true
    } catch (err) {
      setError('Failed to resolve bet')
      console.error('Error resolving bet:', err)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Get contract balance
  const getContractBalance = async (): Promise<string> => {
    if (!provider) return '0'

    try {
      const balance = await provider.request({
        method: 'eth_call',
        params: [
          {
            to: contractAddress,
            data: '0x6f9fb98a' // getContractBalance() function selector
          },
          'latest'
        ]
      }) as string

      return balance
    } catch (err) {
      console.error('Error getting contract balance:', err)
      return '0'
    }
  }

  // Fetch bet details on mount and when provider changes
  useEffect(() => {
    if (provider && user) {
      fetchBetDetails()
    }
  }, [provider, user])

  return {
    betDetails,
    isLoading,
    error,
    acceptBet,
    cancelBet,
    resolveBet,
    getContractBalance,
    fetchBetDetails
  }
}
