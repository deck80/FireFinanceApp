import { describe, it, expect } from 'vitest';
import type { Asset } from '../src/lib/types';

describe('Enhanced Asset Features', () => {
    it('should correctly calculate Real Estate net income', () => {
        const asset: Asset = {
            id: '1',
            name: 'Test Property',
            type: 'RealEstate',
            value: 200000,
            currency: 'EUR',
            address: 'Via Roma 1',
            monthlyRent: 1500,
            monthlyTaxes: 200,
            monthlyBills: 100
        };

        const netIncome = (asset.monthlyRent || 0) - (asset.monthlyTaxes || 0) - (asset.monthlyBills || 0);
        expect(netIncome).toBe(1200);
    });

    it('should correctly calculate P2P metrics', () => {
        const asset: Asset = {
            id: '2',
            name: 'Mintos',
            type: 'P2PLending',
            value: 10500,
            currency: 'EUR',
            averageBuyPrice: 10000, // Invested
            moneyReceivedThisMonth: 50,
            cashDrag: 500
        };

        // Return %
        const returnPercentage = (asset.averageBuyPrice && asset.averageBuyPrice > 0)
            ? ((asset.moneyReceivedThisMonth || 0) / asset.averageBuyPrice) * 100
            : 0;
        expect(returnPercentage).toBe(0.5);

        // Cash Drag %
        const cashDragPercentage = (asset.cashDrag && asset.value > 0)
            ? (asset.cashDrag / asset.value) * 100
            : 0;

        // 500 / 10500 * 100 = 4.7619...
        expect(cashDragPercentage).toBeCloseTo(4.76, 1);
    });
});
