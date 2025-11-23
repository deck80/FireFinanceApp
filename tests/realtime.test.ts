import { describe, it, expect } from 'vitest';
import yahooFinanceDefault from 'yahoo-finance2';
import { GET as GET_SEARCH } from '../src/routes/api/search/+server';
import { GET as GET_PRICE } from '../src/routes/api/price/+server';

const yahooFinance = new yahooFinanceDefault();

describe('Realtime Service Verification', () => {
    const tickers = [
        // ETFs
        { symbol: 'V80A.DE', name: 'Vanguard LifeStrategy 80% Equity UCITS ETF' },
        { symbol: 'FWIA.DE', name: 'Invesco FTSE All-World UCITS ETF Acc' },
        { symbol: 'PPFB.DE', name: 'iShares Physical Gold ETC' },
        { symbol: 'EHBA.DE', name: 'Invesco Euro Corporate Hybrid Bond UCITS ETF Acc' },
        { symbol: '8PSB.DE', name: 'Invesco Physical Silver' },
        // European Stocks
        { symbol: 'ISP.MI', name: 'Intesa Sanpaolo' },
        { symbol: 'SFER.MI', name: 'Salvatore Ferragamo' },
        { symbol: 'BC.MI', name: 'Brunello Cucinelli' },
        { symbol: 'RACE.MI', name: 'Ferrari' },
        // Crypto (Yahoo Finance usually has EUR pairs for major ones, USD for others)
        { symbol: 'BTC-EUR', name: 'Bitcoin' },
        { symbol: 'ETH-EUR', name: 'Ethereum' },
        { symbol: 'XRP-EUR', name: 'XRP' },
        { symbol: 'SOL-EUR', name: 'Solana' },
        { symbol: 'USDT-EUR', name: 'Tether' },
        { symbol: 'EGLD-EUR', name: 'Multiverse EGold' },
        { symbol: 'PEPE-USD', name: 'Pepe' }
    ];

    it('should fetch quotes for specified assets', async () => {
        for (const item of tickers) {
            try {
                const quote = await yahooFinance.quote(item.symbol);
                console.log(`Found ${item.symbol}: ${quote.regularMarketPrice} ${quote.currency}`);
                expect(quote).toBeDefined();
                expect(quote.regularMarketPrice).toBeGreaterThan(0);
                // PEPE-USD will be in USD, others in EUR
                if (item.symbol === 'PEPE-USD') {
                    expect(quote.currency).toBe('USD');
                } else {
                    expect(quote.currency).toBe('EUR');
                }
            } catch (error) {
                console.error(`Failed to fetch ${item.symbol}:`, error);
                throw error;
            }
        }
    });

    it('should search for assets', async () => {
        const query = 'Vanguard LifeStrategy 80%';
        const results = await yahooFinance.search(query);
        expect(results.quotes.length).toBeGreaterThan(0);
        const found = results.quotes.some((q: any) => q.symbol === 'V80A.DE' || q.symbol === 'V80A.F');
    });
});

describe('Search API Endpoint', () => {
    it('should return full name for SML3.MU', async () => {
        const url = new URL('http://localhost/api/search?query=SML3');
        const request = { url } as any;

        const response = await GET_SEARCH(request);
        const assets = await response.json();

        const sml3 = assets.find((a: any) => a.symbol === 'SML3.MU');
        expect(sml3).toBeDefined();
        expect(sml3.name).not.toBe('undefined');
        expect(sml3.name.toLowerCase()).toContain('invesco');
    });

    it('should convert currency in search results', async () => {
        const url = new URL('http://localhost/api/search?query=AAPL&currency=EUR');
        const request = { url } as any;

        const response = await GET_SEARCH(request);
        const assets = await response.json();

        const aapl = assets.find((a: any) => a.symbol === 'AAPL');
        expect(aapl).toBeDefined();
        expect(aapl.currency).toBe('EUR');
    });
});

describe('Price API Endpoint', () => {
    it('should convert price to target currency', async () => {
        // AAPL is in USD
        const url = new URL('http://localhost/api/price?symbol=AAPL&type=Stock&currency=EUR');
        const request = { url } as any;

        const response = await GET_PRICE(request);
        const data = await response.json();

        expect(data.price).toBeDefined();
        expect(data.price).toBeGreaterThan(0);

        // Fetch raw USD price to compare
        const quote = await yahooFinance.quote('AAPL');
        const priceUSD = quote.regularMarketPrice;

        // EUR price should be less than USD price (approx 0.9x)
        expect(data.price).toBeLessThan(priceUSD);
        console.log(`AAPL Price: ${priceUSD} USD -> ${data.price} EUR`);
    });
});
