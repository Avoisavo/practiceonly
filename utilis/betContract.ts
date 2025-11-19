export const contractAddress = "0xFFC972913D3b0776f3012F262B0cAE1fB89c969A"

export const betABI = [
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "maker",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "taker",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "judge",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          },
          {
            "internalType": "enum bet.BetStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "winner",
            "type": "address"
          }
        ],
        "internalType": "struct bet.Bet",
        "name": "_bet",
        "type": "tuple"
      }
    ],
    "stateMutability": "payable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "acceptBet",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "bet",
    "outputs": [
      {
        "internalType": "address",
        "name": "maker",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "taker",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "judge",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "enum bet.BetStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "winner",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cancelBet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBetDetails",
    "outputs": [
      {
        "internalType": "address",
        "name": "maker",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "taker",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "judge",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "enum bet.BetStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "winner",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_winner",
        "type": "address"
      }
    ],
    "name": "resolveBet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "stakes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export enum BetStatus {
  PENDING = 0,
  ACTIVE = 1,
  RESOLVED = 2,
  CANCELLED = 3
}

export interface BetDetails {
  maker: string
  taker: string
  judge: string
  amount: string
  description: string
  deadline: string
  status: BetStatus
  winner: string
}
