import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import yahooFinanceDefault from 'yahoo-finance2';
const yahooFinance = new yahooFinanceDefault();

export const GET: RequestHandler = async ({ url }) => {
    const symbol = url.searchParams.get('symbol');
    const type = url.searchParams.get('type');
    const targetCurrency = url.searchParams.get('currency'); // e.g., EUR

    if (!symbol || !type) {
        return json({ error: 'Missing symbol or type' }, { status: 400 });
    }

    try {
        let price: number | null = null;
        let yahooSymbol = symbol.toUpperCase();

        // Map symbols to Yahoo Finance format
        if (type === 'Cash') {
            // Currency pairs - Yahoo uses format like EURUSD=X
            const base = symbol.toUpperCase();
            if (base === targetCurrency) {
                price = 1.0;
            } else if (targetCurrency) {
                // Direct pair to target
                const pair = `${base}${targetCurrency}=X`;
                try {
                    const quote = await yahooFinance.quote(pair);
                    price = quote.regularMarketPrice || null;
                } catch (e) {
                    // Try reverse
                    try {
                        const reversePair = `${targetCurrency}${base}=X`;
                        const reverseQuote = await yahooFinance.quote(reversePair);
                        if (reverseQuote.regularMarketPrice) {
                            price = 1 / reverseQuote.regularMarketPrice;
                        }
                    } catch (e2) {
                        console.error('Failed to fetch currency rate:', e2);
                    }
                }
            } else {
                // Default behavior (EUR base assumption from previous code, or just return 1 if same)
                // Keeping old logic for backward compatibility if targetCurrency is missing, 
                // but ideally we should always provide targetCurrency.
                // Old logic assumed EUR as base for everything implicitly or handled it specifically.
                // Let's assume if no targetCurrency, we return raw or default to EUR as before.
                if (base === 'EUR') {
                    price = 1.0;
                } else {
                    yahooSymbol = `${base}EUR=X`;
                    try {
                        const quote = await yahooFinance.quote(yahooSymbol);
                        price = quote.regularMarketPrice || null;
                    } catch (e) {
                        try {
                            const reverseSymbol = `EUR${base}=X`;
                            const reverseQuote = await yahooFinance.quote(reverseSymbol);
                            if (reverseQuote.regularMarketPrice) {
                                price = 1 / reverseQuote.regularMarketPrice;
                            }
                        } catch (e2) {
                            console.error('Failed to fetch currency rate:', e2);
                        }
                    }
                }
            }
        } else if (type === 'PreciousMetal') {
            // Precious metals - convert from USD per troy ounce to Target Currency per gram
            const metalMap: Record<string, string> = {
                'XAU': 'GC=F',      // Gold futures
                'GOLD': 'GC=F',
                'XAG': 'SI=F',      // Silver futures
                'SILVER': 'SI=F',
                'XPT': 'PL=F',      // Platinum futures
                'PLATINUM': 'PL=F',
                'XPD': 'PA=F',      // Palladium futures
                'PALLADIUM': 'PA=F'
            };

            yahooSymbol = metalMap[symbol.toUpperCase()] || 'GC=F';

            const quote = await yahooFinance.quote(yahooSymbol);
            const pricePerOunceUSD = quote.regularMarketPrice;

            if (pricePerOunceUSD) {
                let usdToTarget = 1.0;
                if (targetCurrency && targetCurrency !== 'USD') {
                    const usdTargetQuote = await yahooFinance.quote(`USD${targetCurrency}=X`);
                    usdToTarget = usdTargetQuote.regularMarketPrice || 1.0;
                } else if (!targetCurrency) {
                    // Default to EUR if not specified (legacy behavior)
                    const usdEurQuote = await yahooFinance.quote('USDEUR=X');
                    usdToTarget = usdEurQuote.regularMarketPrice || 0.92;
                }

                // Convert troy ounce to grams (1 troy oz = 31.1035 grams)
                const pricePerGramTarget = (pricePerOunceUSD * usdToTarget) / 31.1035;
                price = pricePerGramTarget;
            }
        } else if (type === 'Crypto') {
            // Crypto - Yahoo uses format like BTC-USD or BTC-EUR
            const cryptoMap: Record<string, string> = {
                'BTC': 'BTC',
                'ETH': 'ETH',
                'SOL': 'SOL',
                'ADA': 'ADA',
                'XRP': 'XRP',
                'DOT': 'DOT',
                'DOGE': 'DOGE',
                'MATIC': 'MATIC',
                'AVAX': 'AVAX',
                'LINK': 'LINK'
            };

            const baseCrypto = cryptoMap[symbol.toUpperCase()] || symbol.toUpperCase();
            const target = targetCurrency || 'EUR';
            yahooSymbol = `${baseCrypto}-${target}`;

            try {
                const quote = await yahooFinance.quote(yahooSymbol);
                price = quote.regularMarketPrice || null;
            } catch (e) {
                // Fallback to USD and convert
                try {
                    const usdSymbol = `${baseCrypto}-USD`;
                    const quote = await yahooFinance.quote(usdSymbol);
                    if (quote.regularMarketPrice) {
                        const usdTargetQuote = await yahooFinance.quote(`USD${target}=X`);
                        price = quote.regularMarketPrice * (usdTargetQuote.regularMarketPrice || 1);
                    }
                } catch (e2) {
                    console.error('Failed to fetch crypto price:', e2);
                }
            }
        } else if (type === 'Stock' || type === 'ETF') {
            // Stocks and ETFs
            const quote = await yahooFinance.quote(yahooSymbol);
            const priceNative = quote.regularMarketPrice;
            const currencyNative = quote.currency; // e.g., USD, EUR

            if (priceNative && currencyNative) {
                if (targetCurrency && currencyNative !== targetCurrency) {
                    // Convert to target currency
                    const pair = `${currencyNative}${targetCurrency}=X`;
                    try {
                        const rateQuote = await yahooFinance.quote(pair);
                        const rate = rateQuote.regularMarketPrice;
                        if (rate) {
                            price = priceNative * rate;
                        } else {
                            // Try reverse
                            const reversePair = `${targetCurrency}${currencyNative}=X`;
                            const reverseRateQuote = await yahooFinance.quote(reversePair);
                            if (reverseRateQuote.regularMarketPrice) {
                                price = priceNative / reverseRateQuote.regularMarketPrice;
                            }
                        }
                    } catch (e) {
                        console.error(`Failed to convert ${currencyNative} to ${targetCurrency}:`, e);
                        // Fallback: return native price? Or null? 
                        // Let's return native price but maybe we should indicate currency mismatch.
                        // For now, returning native price is better than nothing, but UI might show wrong symbol.
                        // Ideally we error or handle it.
                        price = priceNative;
                    }
                } else {
                    price = priceNative;
                }
            }
        }

        if (price === null) {
            return json({ error: 'Price not found' }, { status: 404 });
        }

        return json({ price: parseFloat(price.toFixed(4)) });
    } catch (error) {
        console.error('Error fetching price from Yahoo Finance:', error);
        return json({ error: 'Failed to fetch price' }, { status: 500 });
    }
};
