import type { Asset, AssetType } from '$lib/types';
import { get } from 'svelte/store';
import { auth } from '$lib/stores/auth';

export const generateMockData = (): Asset[] => {
    const assets: Asset[] = [];

    // 1. ETFs (~80k)
    // We need 6-7 ETFs. Let's split 80k among them.
    const etfs = [
        { symbol: 'VWCE.DE', name: 'Vanguard FTSE All-World', value: 25000 },
        { symbol: 'IWDA.AS', name: 'iShares Core MSCI World', value: 20000 },
        { symbol: 'EMIM.AS', name: 'iShares Core MSCI EM IMI', value: 10000 },
        { symbol: 'SXR8.DE', name: 'iShares Core S&P 500', value: 10000 },
        { symbol: 'QDVE.DE', name: 'iShares S&P 500 Info Tech', value: 5000 },
        { symbol: 'EUNL.DE', name: 'iShares Core MSCI World', value: 5000 },
        { symbol: 'IUSN.DE', name: 'iShares MSCI World Small Cap', value: 5000 },
    ];

    etfs.forEach((etf, index) => {
        assets.push({
            id: `etf-${index}`,
            name: etf.name,
            symbol: etf.symbol,
            type: 'ETF',
            value: etf.value,
            currency: 'EUR',
            quantity: Math.floor(etf.value / 100), // Mock quantity
            price: 100, // Mock current price
            averageBuyPrice: 90, // Mock buy price (profit)
            isAutoUpdate: true
        });
    });

    // 2. Stocks (~1k)
    assets.push({
        id: 'stock-1',
        name: 'Apple Inc.',
        symbol: 'AAPL',
        type: 'Stock',
        value: 600,
        currency: 'USD',
        quantity: 3,
        price: 200,
        averageBuyPrice: 150, // Profit
        isAutoUpdate: true
    });
    assets.push({
        id: 'stock-2',
        name: 'Tesla, Inc.',
        symbol: 'TSLA',
        type: 'Stock',
        value: 400,
        currency: 'USD',
        quantity: 2,
        price: 200,
        averageBuyPrice: 250, // Loss
        isAutoUpdate: true
    });

    // 3. Bank Accounts (20k)
    assets.push({
        id: 'bank-1',
        name: 'Main Checking',
        type: 'Bank',
        value: 15000,
        currency: 'EUR',
        institution: 'Intesa Sanpaolo'
    });
    assets.push({
        id: 'bank-2',
        name: 'Secondary Account',
        type: 'Bank',
        value: 5000,
        currency: 'EUR',
        institution: 'Revolut'
    });

    // 4. Savings (30k)
    assets.push({
        id: 'saving-1',
        name: 'Emergency Fund',
        type: 'Saving',
        value: 20000,
        currency: 'EUR',
        institution: 'Santander',
        description: 'Available in > 1 day'
    });
    assets.push({
        id: 'saving-2',
        name: 'Travel Fund',
        type: 'Saving',
        value: 10000,
        currency: 'EUR',
        institution: 'Trade Republic'
    });

    // Current Total: 80k + 1k + 20k + 30k = 131k
    // Target: 400k. Gap: 269k.
    // Adding "Real Estate" or "Other" to fill the gap.
    assets.push({
        id: 'real-estate-1',
        name: 'Rental Property',
        type: 'RealEstate',
        value: 269000,
        currency: 'EUR',
        description: 'Apartment in Milan'
    });

    // 5. Material Values (~40k)
    // Watch
    assets.push({
        id: 'watch-1',
        name: 'Rolex Submariner',
        type: 'Watch',
        value: 12000,
        currency: 'EUR',
        description: '2020 Model'
    });

    // Car
    assets.push({
        id: 'car-1',
        name: 'Fiat 500 Vintage',
        type: 'Car',
        value: 15000,
        currency: 'EUR',
        description: 'Restored'
    });

    // Precious Metals
    assets.push({
        id: 'metal-1',
        name: 'Gold Bar',
        type: 'PreciousMetal',
        value: 8000,
        currency: 'EUR',
        quantity: 100, // grams
        description: '100g Fine Gold'
    });
    assets.push({
        id: 'metal-2',
        name: 'Silver Coins',
        type: 'PreciousMetal',
        value: 2000,
        currency: 'EUR',
        quantity: 50,
        description: 'American Eagles'
    });

    // Cash (Foreign Money)
    assets.push({
        id: 'cash-1',
        name: 'USD Cash Stash',
        type: 'Cash',
        value: 3000,
        currency: 'USD',
        description: 'Physical notes'
    });

    // 6. Crypto (~15k)
    assets.push({
        id: 'crypto-1',
        name: 'Bitcoin',
        symbol: 'BTC',
        type: 'Crypto',
        value: 10000,
        currency: 'EUR',
        quantity: 0.15,
        price: 66666.66,
        averageBuyPrice: 50000, // Profit
        isAutoUpdate: true
    });
    assets.push({
        id: 'crypto-2',
        name: 'Ethereum',
        symbol: 'ETH',
        type: 'Crypto',
        value: 5000,
        currency: 'EUR',
        quantity: 2.5,
        price: 2000,
        averageBuyPrice: 2200, // Loss
        isAutoUpdate: true
    });

    return assets;
};

export const searchAsset = async (query: string, type: AssetType): Promise<Asset[]> => {
    try {
        const currency = get(auth)?.preferredCurrency || 'EUR';
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&currency=${encodeURIComponent(currency)}`);

        if (!response.ok) {
            console.error('Failed to search assets:', await response.text());
            return [];
        }

        const assets = await response.json();

        return assets.filter((a: Asset) => {
            if (type === 'ETF') return a.type === 'ETF';
            if (type === 'Stock') return a.type === 'Stock';
            if (type === 'Crypto') return a.type === 'Crypto';
            return true;
        });
    } catch (error) {
        console.error('Error searching assets:', error);
        return [];
    }
};

// Real-time Price Fetcher using server-side API
export const fetchAssetPrice = async (symbol: string, type: AssetType): Promise<number | null> => {
    try {
        const currency = get(auth)?.preferredCurrency || 'EUR';
        const response = await fetch(`/api/price?symbol=${encodeURIComponent(symbol)}&type=${encodeURIComponent(type)}&currency=${encodeURIComponent(currency)}`);

        if (!response.ok) {
            console.error('Failed to fetch price:', await response.text());
            return null;
        }

        const data = await response.json();
        return data.price || null;
    } catch (error) {
        console.error('Error fetching asset price:', error);
        return null;
    }
};

import { assets } from '$lib/stores/finance';

export const refreshAssetPrices = async (): Promise<void> => {
    const currentAssets = get(assets);
    const assetsToUpdate = currentAssets.filter(a => a.isAutoUpdate && a.symbol && ['ETF', 'Stock', 'Crypto'].includes(a.type));

    if (assetsToUpdate.length === 0) return;

    const updatedAssets = [...currentAssets];
    let hasUpdates = false;

    await Promise.all(assetsToUpdate.map(async (asset) => {
        if (!asset.symbol) return;
        const newPrice = await fetchAssetPrice(asset.symbol, asset.type);
        if (newPrice !== null && newPrice !== asset.price) {
            const index = updatedAssets.findIndex(a => a.id === asset.id);
            if (index !== -1) {
                updatedAssets[index] = {
                    ...updatedAssets[index],
                    price: newPrice,
                    value: parseFloat((updatedAssets[index].quantity! * newPrice).toFixed(2))
                };
                hasUpdates = true;
            }
        }
    }));

    if (hasUpdates) {
        assets.setAssets(updatedAssets);
    }
};
