import yahooFinanceDefault from 'yahoo-finance2';

const yahooFinance = new yahooFinanceDefault();

async function searchStocks() {
    const queries = ['Brunello Cucinelli', 'Ferrari', 'BC.MI', 'RACE.MI'];

    for (const query of queries) {
        console.log(`\nSearching for: "${query}"`);
        try {
            const results = await yahooFinance.search(query);
            if (results.quotes.length > 0) {
                results.quotes.forEach(q => {
                    // Safe check for symbol existence
                    if (q.symbol) {
                        console.log(`- [${q.symbol}] Name: "${q.shortName || q.longName}" (Exch: ${q.exchange})`);
                    }
                });
            } else {
                console.log('No matches found.');
            }
        } catch (e) {
            console.error('Search failed:', e);
        }
    }
}

searchStocks();
