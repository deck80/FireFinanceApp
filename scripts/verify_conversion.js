import yahooFinanceDefault from 'yahoo-finance2';

const yahooFinance = new yahooFinanceDefault();

async function verifyConversion() {
    const symbol = 'AAPL'; // USD asset
    const targetCurrency = 'EUR';

    console.log(`Fetching ${symbol} in ${targetCurrency}...`);

    try {
        const quote = await yahooFinance.quote(symbol);
        const price = quote.regularMarketPrice;
        const currency = quote.currency;

        console.log(`Original: ${price} ${currency}`);

        if (currency !== targetCurrency) {
            const pair = `${currency}${targetCurrency}=X`;
            console.log(`Fetching rate for ${pair}...`);
            const rateQuote = await yahooFinance.quote(pair);
            const rate = rateQuote.regularMarketPrice;

            console.log(`Rate: ${rate}`);
            console.log(`Converted: ${price * rate} ${targetCurrency}`);
        }
    } catch (e) {
        console.error('Failed:', e);
    }
}

verifyConversion();
