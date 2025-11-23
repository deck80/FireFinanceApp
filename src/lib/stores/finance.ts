import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { Asset } from '$lib/types';
import { auth } from './auth';

function createFinanceStore() {
    const storedAssets = browser ? localStorage.getItem('assets') : null;
    const initialAssets: Asset[] = storedAssets ? JSON.parse(storedAssets) : [];

    const { subscribe, set, update } = writable<Asset[]>(initialAssets);

    subscribe(currentAssets => {
        if (browser) {
            localStorage.setItem('assets', JSON.stringify(currentAssets));
        }
    });

    return {
        subscribe,
        setAssets: (assets: Asset[]) => set(assets),
        addAsset: (asset: Asset) => update(assets => [...assets, asset]),
        updateAsset: (asset: Asset) => update(assets => assets.map(a => a.id === asset.id ? asset : a)),
        removeAsset: (id: string) => update(assets => assets.filter(a => a.id !== id))
    };
}

export const assets = createFinanceStore();

export const totalWealth = derived([assets, auth], ([$assets, $auth]) => {
    if (!$auth) return 0;
    const currency = $auth.preferredCurrency;
    const showMaterial = $auth.showMaterialValues;
    // Simple conversion rate for mock purposes if not fetched
    const EUR_TO_USD = 1.1;

    return $assets.reduce((total, asset) => {
        // Skip material values if disabled
        if (!showMaterial && ['Watch', 'Car', 'PreciousMetal', 'Cash'].includes(asset.type)) {
            return total;
        }

        let value = asset.value;
        if (asset.currency !== currency) {
            if (currency === 'USD') value = value * EUR_TO_USD;
            else value = value / EUR_TO_USD;
        }
        return total + value;
    }, 0);
});
