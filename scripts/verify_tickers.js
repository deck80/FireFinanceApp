import yahooFinanceDefault from 'yahoo-finance2';

const tickers = [
    { symbol: 'V80A.DE', name: 'Vanguard LifeStrategy 80% Equity UCITS ETF' },
    { symbol: 'SML3.DE', name: 'Invesco US Technology Sector UCITS ETF' },
    { symbol: 'FWIA.DE', name: 'Invesco FTSE All-World UCITS ETF Acc' },
    { symbol: 'PPFB.DE', name: 'iShares Physical Gold ETC' },
    { symbol: 'EHBA.DE', name: 'Invesco Euro Corporate Hybrid Bond UCITS ETF Acc' },
    { symbol: '8PSB.DE', name: 'Invesco Physical Silver' },
];

async function verify() {
    console.log('Verifying tickers...');

    let yf = yahooFinanceDefault;

    // Check if we need to instantiate
    if (typeof yf === 'function') {
        try {
            // @ts-ignore
            yf = new yahooFinanceDefault();
            console.log('Instantiated yahooFinanceDefault');
        } catch (e) {
            console.log('Could not instantiate yahooFinanceDefault:', e.message);
        }
    }

    for (const item of tickers) {
        try {
            const quote = await yf.quote(item.symbol);
            console.log(`✅ Found ${item.symbol}: ${quote.longName || quote.shortName} (${quote.currency}) - Price: ${quote.regularMarketPrice}`);
        } catch (e) {
            console.log(`❌ Failed ${item.symbol}: ${e.message}`);
            // Try without suffix
            if (item.symbol.endsWith('.DE')) {
                const rawSymbol = item.symbol.replace('.DE', '');
                try {
                    const quote = await yf.quote(rawSymbol);
                    console.log(`✅ Found ${rawSymbol}: ${quote.longName || quote.shortName} (${quote.currency}) - Price: ${quote.regularMarketPrice}`);
                } catch (e2) {
                    console.log(`❌ Failed ${rawSymbol}: ${e2.message}`);
                }
            }
        }
    }
}

verify();
