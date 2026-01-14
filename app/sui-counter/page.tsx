'use client';

import { useEffect, useState } from 'react';
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

const PACKAGE_ID = '0x775570f12a2767fdd6c620dad039f75c72b3c8ec8fb7bf4dfc00ed4394d6e515';
const MODULE = 'counter';
const STRUCT = 'Counter';

function counterType() {
    return `${PACKAGE_ID}::${MODULE}::${STRUCT}`;
}

export default function CounterPage() {
    const client = useSuiClient();
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

    const [counterId, setCounterId] = useState<string>(() =>
        typeof window !== 'undefined' ? localStorage.getItem('counterId') || '' : ''
    );
    const [value, setValue] = useState<number | null>(null);
    const [lastTxDigest, setLastTxDigest] = useState<string>('');

    const isConnected = !!account?.address;

    useEffect(() => {
        if (counterId) localStorage.setItem('counterId', counterId);
    }, [counterId]);

    async function refreshValue(id: string) {
        const obj = await client.getObject({
            id,
            options: { showContent: true },
        });

        // Counter is a Move object; value is in fields.value
        const content: any = obj.data?.content;
        const v = Number(content?.fields?.value);
        setValue(Number.isFinite(v) ? v : null);
    }

    // Find an owned Counter in the connected wallet (handy after create).
    async function findOwnedCounter() {
        if (!account?.address) return;

        const res = await client.getOwnedObjects({
            owner: account.address,
            filter: { StructType: counterType() },
            options: { showContent: true },
        });

        const first = res.data[0];
        const id = first?.data?.objectId;
        if (id) {
            setCounterId(id);
            await refreshValue(id);
        } else {
            setValue(null);
        }
    }

    async function createCounter() {
        const tx = new Transaction();
        const counter = tx.moveCall({
            target: `${PACKAGE_ID}::${MODULE}::create`,
            arguments: [],
        });

        // Transfer the returned Counter object to the current user
        tx.transferObjects([counter], account!.address);

        const result = await signAndExecute({ transaction: tx });
        setLastTxDigest(result.digest);

        // After creation, query wallet objects to find the new Counter:
        await findOwnedCounter();
    }

    async function inc() {
        if (!counterId) return;
        const tx = new Transaction();
        tx.moveCall({
            target: `${PACKAGE_ID}::${MODULE}::inc`,
            arguments: [tx.object(counterId)],
        });

        const result = await signAndExecute({ transaction: tx });
        setLastTxDigest(result.digest);
        await refreshValue(counterId);
    }

    async function dec() {
        if (!counterId) return;
        const tx = new Transaction();
        tx.moveCall({
            target: `${PACKAGE_ID}::${MODULE}::dec`,
            arguments: [tx.object(counterId)],
        });

        const result = await signAndExecute({ transaction: tx });
        setLastTxDigest(result.digest);
        await refreshValue(counterId);
    }

    useEffect(() => {
        if (isConnected) {
            findOwnedCounter();
        } else {
            setValue(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Sui Counter
                    </h1>
                    <p className="text-gray-300 text-sm">Blockchain-powered counter on Sui Testnet</p>
                </div>

                {/* Connect Wallet Button */}
                <div className="flex justify-center mb-6">
                    <ConnectButton />
                </div>

                {/* Main Card */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                    {/* Network Info */}
                    <div className="grid grid-cols-1 gap-3 mb-6 text-sm">
                        <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                            <span className="text-gray-400">Network:</span>
                            <span className="text-white ml-2 font-mono">testnet</span>
                        </div>
                        <div className="bg-black/20 rounded-xl p-3 border border-white/10 break-all">
                            <span className="text-gray-400">Address:</span>
                            <span className="text-white ml-2 font-mono text-xs">{account?.address ?? '—'}</span>
                        </div>
                        <div className="bg-black/20 rounded-xl p-3 border border-white/10 break-all">
                            <span className="text-gray-400">Counter Object:</span>
                            <span className="text-white ml-2 font-mono text-xs">{counterId || '—'}</span>
                        </div>
                    </div>

                    {/* Counter Value Display */}
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-10 mb-6 border border-white/20 text-center">
                        <div className="text-gray-300 text-sm mb-2 uppercase tracking-wider">Current Value</div>
                        <div className="text-7xl font-bold text-white tabular-nums">
                            {value === null ? '—' : value}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {/* Create Counter Button */}
                        <button
                            disabled={!isConnected}
                            onClick={createCounter}
                            className="col-span-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                        >
                            🎯 Create Counter
                        </button>

                        {/* +1 Button */}
                        <button
                            disabled={!isConnected || !counterId}
                            onClick={inc}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                        >
                            ➕ Increment
                        </button>

                        {/* -1 Button */}
                        <button
                            disabled={!isConnected || !counterId}
                            onClick={dec}
                            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                        >
                            ➖ Decrement
                        </button>

                        {/* Refresh Button */}
                        <button
                            disabled={!isConnected || !counterId}
                            onClick={() => refreshValue(counterId)}
                            className="col-span-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                        >
                            🔄 Refresh Value
                        </button>
                    </div>

                    {/* Tip */}
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
                        <p className="text-yellow-200 text-sm">
                            💡 <span className="font-semibold">Tip:</span> Decrement will fail when value is 0 (contract protection)
                        </p>
                    </div>

                    {/* Transaction Explorer Link */}
                    {lastTxDigest && (
                        <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                            <p className="text-green-200 text-sm mb-2">
                                ✅ <span className="font-semibold">Transaction Successful!</span>
                            </p>
                            <a
                                href={`https://suiscan.xyz/testnet/tx/${lastTxDigest}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 underline text-sm font-mono break-all transition-colors"
                            >
                                View on Explorer 🔗
                            </a>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-gray-400 text-xs">
                    Powered by Sui Blockchain • Built with Move & TypeScript
                </div>
            </div>
        </div>
    );
}
