import yahooFinanceDefault from 'yahoo-finance2';

const yahooFinance = new yahooFinanceDefault();

async function searchAssets() {
    const queries = ['PEPE', 'Ferrero'];

    for (const query of queries) {
        console.log(`\nSearching for: "${query}"`);
        try {
            const results = await yahooFinance.search(query);
            if (results.quotes.length > 0) {
                results.quotes.forEach(q => {
                    console.log(`- [${q.symbol}] Name: "${q.shortName || q.longName}" (Type: ${q.quoteType})`);
                });
            } else {
                console.log('No matches found.');
            }
        } catch (e) {
            console.error('Search failed:', e);
        }
    }

    // Try fetching PEPE-USD directly as it's common
    try {
        console.log('\nTrying PEPE-USD...');
        const quote = await yahooFinance.quote('PEPE-USD');
        console.log(`[SUCCESS] PEPE-USD: ${quote.regularMarketPrice} ${quote.currency}`);
    } catch (e) {
        console.log('[FAILED] PEPE-USD');
    }
}

searchAssets();
