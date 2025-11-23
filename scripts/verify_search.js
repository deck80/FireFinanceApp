import yahooFinanceDefault from 'yahoo-finance2';

const yahooFinance = new yahooFinanceDefault();

async function verifySearch() {
    const query = 'Vanguard LifeStrategy 80%';
    console.log(`Searching for: "${query}"`);

    try {
        const results = await yahooFinance.search(query);
        console.log(`Found ${results.quotes.length} results.`);

        results.quotes.forEach(q => {
            console.log(`- [${q.symbol}] ${q.longName || q.shortName} (${q.exchange})`);
        });
    } catch (e) {
        console.error('Search failed:', e);
    }
}

verifySearch();
