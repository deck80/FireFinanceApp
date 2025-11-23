export type Currency = string;

export type AssetType = 'ETF' | 'Stock' | 'Bank' | 'Saving' | 'RealEstate' | 'P2PLending' | 'Other' | 'Watch' | 'Car' | 'PreciousMetal' | 'Cash' | 'Crypto';

export interface Asset {
    id: string;
    name: string;
    symbol?: string; // For ETFs and Stocks
    type: AssetType;
    quantity?: number; // For ETFs and Stocks
    value: number; // Current total value in base currency (EUR)
    currency: Currency;
    institution?: string; // For Bank/Savings
    description?: string;
    price?: number; // Unit price
    averageBuyPrice?: number; // Average price paid per unit
    isAutoUpdate?: boolean; // Whether to fetch price automatically
    liquidity?: 'available' | 'locked'; // For Saving accounts
    // Real Estate specific
    address?: string;
    monthlyRent?: number;
    monthlyTaxes?: number;
    monthlyBills?: number;
    // P2P specific
    capitalInvestedPreviousMonth?: number;
    investmentThisMonth?: number;
    moneyReceivedThisMonth?: number;
    cashDrag?: number;
}

export interface UserProfile {
    name: string;
    preferredCurrency: Currency;
    showMaterialValues: boolean;
    theme: 'light' | 'dark';
}
