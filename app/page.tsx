import Image from "next/image";
import WalletButton from "./components/WalletButton";
import BetManager from "./components/BetManager";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <WalletButton />
      
      <div className="flex min-h-screen items-center justify-center">
        <main className="w-full max-w-6xl px-8 py-16">
          <div className="text-center mb-12">
            <Image
              className="dark:invert mx-auto mb-8"
              src="/next.svg"
              alt="Next.js logo"
              width={120}
              height={24}
              priority
            />
            <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
              Decentralized Betting Platform
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
              Connect your wallet and manage smart contract bets with Web3Auth integration
            </p>
          </div>
          
          <BetManager />
        </main>
      </div>
    </div>
  );
}
