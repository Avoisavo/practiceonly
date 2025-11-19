import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "ethers";

export default buildModule("BetModule", (m) => {
  // Test addresses for Sepolia
  const takerAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Hardhat account #1
  const judgeAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Hardhat account #2
  
  // Bet parameters
  const betAmount = "0.01"; // 0.01 ETH
  const description = "Test bet deployment on Sepolia";
  const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
  
  // Create bet struct (note: maker, amount, status, winner will be set in constructor)
  const betStruct = [
    "0x0000000000000000000000000000000000000000", // maker - will be overridden
    takerAddress,                                      // taker
    judgeAddress,                                      // judge  
    0,                                                 // amount - will be overridden
    description,                                       // description
    deadline,                                          // deadline
    0,                                                 // status - PENDING, will be overridden
    "0x0000000000000000000000000000000000000000"      // winner - will be overridden
  ];

  // Deploy the bet contract with initial stake
  const bet = m.contract("bet", [betStruct], {
    value: parseEther(betAmount)
  });

  return { bet };
});
