import yahooFinanceDefault from 'yahoo-finance2';

const yahooFinance = new yahooFinanceDefault();

async function verifyTickers() {
    const assets = [
        // Crypto
        { name: 'Bitcoin', symbol: 'BTC-EUR' },
        { name: 'Ethereum', symbol: 'ETH-EUR' },
        { name: 'XRP', symbol: 'XRP-EUR' },
        { name: 'Solana', symbol: 'SOL-EUR' },
        { name: 'Tether', symbol: 'USDT-EUR' },
        { name: 'Multiverse EGold', symbol: 'EGLD-EUR' },
        { name: 'PEPE', symbol: 'PEPE-EUR' }, // Might need check

        // Stocks
        { name: 'Intesa Sanpaolo', symbol: 'ISP.MI' },
        { name: 'Ferrero', symbol: 'FERRERO' } // Ferrero is likely private, checking if there's a related listed entity or if it fails
    ];

    console.log('Verifying assets...');

    for (const asset of assets) {
        try {
            const quote = await yahooFinance.quote(asset.symbol);
            console.log(`[SUCCESS] ${asset.name} (${asset.symbol}): ${quote.regularMarketPrice} ${quote.currency}`);
        } catch (e) {
            console.log(`[FAILED] ${asset.name} (${asset.symbol}): ${e.message}`);
            // Try searching for Ferrero if it fails
            if (asset.name === 'Ferrero') {
                console.log('Searching for Ferrero...');
                try {
                    const results = await yahooFinance.search('Ferrero');
                    if (results.quotes.length > 0) {
                        console.log('Found potential matches for Ferrero:', results.quotes.map(q => `${q.symbol} (${q.shortName})`).join(', '));
                    } else {
                        console.log('No matches found for Ferrero.');
                    }
                } catch (searchError) {
                    console.error('Search failed:', searchError);
                }
            }
        }
    }
}

verifyTickers();
