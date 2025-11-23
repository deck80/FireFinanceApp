import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import yahooFinanceDefault from 'yahoo-finance2';
const yahooFinance = new yahooFinanceDefault();

export const GET: RequestHandler = async ({ url }) => {
    const query = url.searchParams.get('query');
    const targetCurrency = url.searchParams.get('currency');

    if (!query) {
        return json({ error: 'Missing query' }, { status: 400 });
    }

    try {
        const results = await yahooFinance.search(query) as any;

        // Map Yahoo Finance results to our Asset format
        const assets = await Promise.all(results.quotes.map(async (quote: any) => {
            // Determine type based on quoteType
            let type = 'Stock'; // Default
            if (quote.quoteType === 'ETF') type = 'ETF';
            if (quote.quoteType === 'CRYPTOCURRENCY') type = 'Crypto';
            if (quote.quoteType === 'CURRENCY') type = 'Cash';
            if (quote.quoteType === 'FUTURE') type = 'PreciousMetal'; // Rough mapping

            let name = quote.longName || quote.shortName;

            // If name is missing, try to fetch quote details (common for some ETFs like SML3.MU in search)
            if (!name) {
                try {
                    const fullQuote = await yahooFinance.quote(quote.symbol) as any;
                    name = fullQuote.longName || fullQuote.shortName;
                } catch (e) {
                    console.warn(`Failed to fetch full quote for ${quote.symbol}`);
                }
            }

            return {
                id: `search-${quote.symbol}`,
                name: name || quote.symbol,
                symbol: quote.symbol,
                type: type,
                value: 0,
                currency: targetCurrency || 'USD', // Set to target currency if provided, otherwise default
                quantity: 0,
                price: 0,
                isAutoUpdate: true
            };
        }));

        return json(assets);
    } catch (error) {
        console.error('Error searching assets:', error);
        return json({ error: 'Failed to search assets' }, { status: 500 });
    }
};
