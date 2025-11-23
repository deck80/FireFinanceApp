import yahooFinanceDefault from 'yahoo-finance2';

const yahooFinance = new yahooFinanceDefault();

async function verify() {
    const symbol = 'SML3.MU';
    console.log(`Verifying ${symbol}...`);
    try {
        const quote = await yahooFinance.quote(symbol);
        console.log(`✅ Found ${symbol}: ${quote.longName || quote.shortName} (${quote.currency}) - Price: ${quote.regularMarketPrice}`);
    } catch (e) {
        console.log(`❌ Failed ${symbol}: ${e.message}`);
    }
}

verify();
