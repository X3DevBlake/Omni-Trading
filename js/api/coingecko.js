// CoinGecko API Wrapper (Free Tier, No Key Required)
// Rate Limit: 10-30 calls/minute. Must implement memory caching to avoid 429s.

const CACHE = {
  topPrices: { data: null, timestamp: 0 },
};

const CACHE_TTL = 60000; // 60 seconds

export async function fetchTopPrices() {
  const now = Date.now();
  if (CACHE.topPrices.data && (now - CACHE.topPrices.timestamp < CACHE_TTL)) {
    return CACHE.topPrices.data;
  }

  try {
    // List of major coins for ticker
    const ids = 'bitcoin,ethereum,solana,ripple,dogecoin,binancecoin,cardano,sui,avalanche-2'.split(',');
    
    // In a real proxy set up, we'd route via a backend. For browser, we call direct 
    // and hope free tier CORS is okay. CoinGecko public API usually allows browser origins.
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('CoinGecko API rate limited or error');
    
    const data = await response.json();
    
    // Transform to standard array format
    const transformed = Object.keys(data).map(id => {
      // Map CG ids to standard symbols
      const symbols = {
        bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL', ripple: 'XRP', 
        dogecoin: 'DOGE', binancecoin: 'BNB', cardano: 'ADA', sui: 'SUI', 'avalanche-2': 'AVAX'
      };
      
      return {
        id,
        symbol: symbols[id] || id,
        current_price: data[id].usd,
        price_change_percentage_24h: data[id].usd_24h_change
      };
    });

    // Save to cache
    CACHE.topPrices.data = transformed;
    CACHE.topPrices.timestamp = now;
    
    return transformed;
  } catch (err) {
    console.error('API Error:', err);
    throw err; // Components will catch and fallback to mock data
  }
}
