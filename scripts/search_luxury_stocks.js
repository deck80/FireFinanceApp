import yahooFinanceDefault from 'yahoo-finance2';

const yahooFinance = new yahooFinanceDefault();

async function searchStocks() {
    const queries = ['Salvatore Ferragamo', 'Brunello Cucinelli', 'Ferrari'];

    for (const query of queries) {
        console.log(`\nSearching for: "${query}"`);
        try {
            const results = await yahooFinance.search(query);
            if (results.quotes.length > 0) {
                // Filter for likely Milan or major exchange listings
                const relevant = results.quotes.filter(q =>
                    q.symbol.endsWith('.MI') ||
                    q.symbol.includes('RACE') ||
                    q.exchange === 'MIL' ||
                    q.exchange === 'MTA'
                );

                (relevant.length > 0 ? relevant : results.quotes.slice(0, 3)).forEach(q => {
                    console.log(`- [${q.symbol}] Name: "${q.shortName || q.longName}" (Exch: ${q.exchange})`);
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
