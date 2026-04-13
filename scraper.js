import fs from 'fs';
import https from 'https';

const options = {
  hostname: 'api.coingecko.com',
  port: 443,
  path: '/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false',
  method: 'GET',
  headers: {
    'User-Agent': 'OmniClient/2.0'
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
        const parsed = JSON.parse(data);
        if(parsed && parsed.length > 0) {
            const format = parsed.map(d => ({
                symbol: d.symbol.toUpperCase(),
                name: d.name,
                price: d.current_price,
                image: d.image,
                change: d.price_change_percentage_24h,
                volume: d.total_volume,
                // generate a native 0x ethereum style mock contract address for wallet tracking
                contract: '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')
            }));
            
            const fileData = `export const TOP_100_ASSETS = ${JSON.stringify(format, null, 4)};`;
            fs.writeFileSync('data/CryptoDatabase.js', fileData);
            console.log("Successfully scraped logic and compiled 100 Live Tokens into CryptoDatabase.js");
        } else {
            console.log("Empty response or rate limit");
        }
    } catch(e) { console.log("Error parsing"); }
  });
});
req.on('error', e => console.error(e));
req.end();
