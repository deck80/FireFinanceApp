import yahooFinanceDefault from 'yahoo-finance2';

const yahooFinance = new yahooFinanceDefault();

async function verifySearch() {
    const queries = ['SML3', 'Invesco Technology'];

    for (const query of queries) {
        console.log(`\nSearching for: "${query}"`);
        try {
            const results = await yahooFinance.search(query);
            results.quotes.forEach(q => {
                if (q.symbol.includes('SML3')) {
                    console.log(`- [${q.symbol}] Name: "${q.longName || q.shortName}" (Type: ${q.quoteType})`);
                }
            });
        } catch (e) {
            console.error('Search failed:', e);
        }
    }
}

verifySearch();
