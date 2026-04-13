// ============================================================
// OMNI TRADING - MOCK DATA
// All data is fictional/mock. Token names are real crypto names
// used for demonstration purposes only.
// ============================================================

export const PLATFORM_STATS = {
  totalUsers: '8.4M+',
  tradingPairs: '2,500+',
  dailyVolume: '$12.8B',
  protectionFund: '1,000 BTC',
  countries: '150+',
  futuresLeverage: '200×',
};

export const OMNI_TOKEN = {
  name: 'Omni Token',
  symbol: 'OMNI',
  totalSupply: '1,000,000,000',
  circulatingSupply: '420,000,000',
  price: 2.47,
  change24h: 5.82,
  marketCap: '1,037,400,000',
  contractAddress: '0x7a3f...OMNI...9c2e',
  chain: 'Ethereum (ERC-20)',
  burned: '120,000,000',
  treasuryReserve: '200,000,000',
  stakingRewards: '80,000,000',
  teamVesting: '100,000,000',
  communityAirdrops: '80,000,000',
};

export const TOP_TOKENS = [
  { rank: 1, name: 'Bitcoin', symbol: 'BTC', price: 82453.21, change: 2.34, volume: '28.4B', marketCap: '1.63T', sparkline: 'up' },
  { rank: 2, name: 'Ethereum', symbol: 'ETH', price: 3124.56, change: -1.02, volume: '14.2B', marketCap: '376.1B', sparkline: 'down' },
  { rank: 3, name: 'Tether', symbol: 'USDT', price: 1.00, change: 0.01, volume: '62.1B', marketCap: '143.8B', sparkline: 'flat' },
  { rank: 4, name: 'XRP', symbol: 'XRP', price: 2.18, change: 4.56, volume: '8.7B', marketCap: '125.4B', sparkline: 'up' },
  { rank: 5, name: 'BNB', symbol: 'BNB', price: 612.34, change: 1.78, volume: '2.1B', marketCap: '91.2B', sparkline: 'up' },
  { rank: 6, name: 'Solana', symbol: 'SOL', price: 187.92, change: 6.23, volume: '5.6B', marketCap: '87.3B', sparkline: 'up' },
  { rank: 7, name: 'USDC', symbol: 'USDC', price: 1.00, change: 0.00, volume: '8.9B', marketCap: '52.1B', sparkline: 'flat' },
  { rank: 8, name: 'TRON', symbol: 'TRX', price: 0.2341, change: -0.45, volume: '1.8B', marketCap: '20.4B', sparkline: 'down' },
  { rank: 9, name: 'Dogecoin', symbol: 'DOGE', price: 0.1823, change: 3.12, volume: '3.2B', marketCap: '26.7B', sparkline: 'up' },
  { rank: 10, name: 'Cardano', symbol: 'ADA', price: 0.7845, change: -2.31, volume: '1.4B', marketCap: '27.8B', sparkline: 'down' },
  { rank: 11, name: 'Avalanche', symbol: 'AVAX', price: 38.92, change: 5.67, volume: '890M', marketCap: '15.8B', sparkline: 'up' },
  { rank: 12, name: 'Chainlink', symbol: 'LINK', price: 18.45, change: 1.23, volume: '720M', marketCap: '11.2B', sparkline: 'up' },
  { rank: 13, name: 'Polkadot', symbol: 'DOT', price: 7.23, change: -0.89, volume: '450M', marketCap: '10.1B', sparkline: 'down' },
  { rank: 14, name: 'Shiba Inu', symbol: 'SHIB', price: 0.00002341, change: 8.92, volume: '1.2B', marketCap: '13.8B', sparkline: 'up' },
  { rank: 15, name: 'Litecoin', symbol: 'LTC', price: 98.56, change: 0.45, volume: '620M', marketCap: '7.4B', sparkline: 'flat' },
  { rank: 16, name: 'Sui', symbol: 'SUI', price: 4.12, change: 12.34, volume: '2.3B', marketCap: '12.6B', sparkline: 'up' },
  { rank: 17, name: 'Toncoin', symbol: 'TON', price: 6.78, change: -3.21, volume: '340M', marketCap: '16.8B', sparkline: 'down' },
  { rank: 18, name: 'Stellar', symbol: 'XLM', price: 0.3456, change: 2.89, volume: '280M', marketCap: '10.4B', sparkline: 'up' },
  { rank: 19, name: 'Monero', symbol: 'XMR', price: 218.34, change: 1.67, volume: '190M', marketCap: '4.0B', sparkline: 'up' },
  { rank: 20, name: 'Hedera', symbol: 'HBAR', price: 0.1923, change: 4.12, volume: '410M', marketCap: '7.2B', sparkline: 'up' },
  { rank: 21, name: 'Omni Token', symbol: 'OMNI', price: 2.47, change: 5.82, volume: '156M', marketCap: '1.04B', sparkline: 'up' },
  { rank: 22, name: 'Bitcoin Cash', symbol: 'BCH', price: 412.78, change: 0.92, volume: '380M', marketCap: '8.1B', sparkline: 'flat' },
  { rank: 23, name: 'Hyperliquid', symbol: 'HYPE', price: 14.56, change: 7.89, volume: '890M', marketCap: '4.9B', sparkline: 'up' },
  { rank: 24, name: 'Cronos', symbol: 'CRO', price: 0.1245, change: -1.56, volume: '120M', marketCap: '3.3B', sparkline: 'down' },
  { rank: 25, name: 'Bittensor', symbol: 'TAO', price: 412.56, change: 9.23, volume: '560M', marketCap: '3.1B', sparkline: 'up' },
];

export const TRADING_PAIRS_SPOT = [
  { pair: 'BTC/USDT', lastPrice: 82453.21, change: 2.34, high: 83102.00, low: 80245.33, volume: '12,456 BTC' },
  { pair: 'ETH/USDT', lastPrice: 3124.56, change: -1.02, high: 3189.00, low: 3078.12, volume: '89,234 ETH' },
  { pair: 'SOL/USDT', lastPrice: 187.92, change: 6.23, high: 192.45, low: 176.34, volume: '1.2M SOL' },
  { pair: 'OMNI/USDT', lastPrice: 2.47, change: 5.82, high: 2.58, low: 2.31, volume: '45.6M OMNI' },
  { pair: 'XRP/USDT', lastPrice: 2.18, change: 4.56, high: 2.24, low: 2.08, volume: '234M XRP' },
  { pair: 'DOGE/USDT', lastPrice: 0.1823, change: 3.12, high: 0.1889, low: 0.1756, volume: '890M DOGE' },
  { pair: 'BNB/USDT', lastPrice: 612.34, change: 1.78, high: 618.90, low: 601.23, volume: '45,678 BNB' },
  { pair: 'ADA/USDT', lastPrice: 0.7845, change: -2.31, high: 0.8123, low: 0.7689, volume: '156M ADA' },
  { pair: 'SUI/USDT', lastPrice: 4.12, change: 12.34, high: 4.34, low: 3.67, volume: '89M SUI' },
  { pair: 'AVAX/USDT', lastPrice: 38.92, change: 5.67, high: 39.78, low: 36.45, volume: '12M AVAX' },
];

export const FUTURES_PAIRS = [
  { pair: 'BTCUSDT', lastPrice: 82467.50, change: 2.37, fundingRate: '0.0100%', openInterest: '$8.2B', volume24h: '$28.4B', maxLeverage: '200x' },
  { pair: 'ETHUSDT', lastPrice: 3125.80, change: -0.98, fundingRate: '0.0050%', openInterest: '$4.1B', volume24h: '$14.2B', maxLeverage: '200x' },
  { pair: 'SOLUSDT', lastPrice: 188.10, change: 6.31, fundingRate: '0.0200%', openInterest: '$1.8B', volume24h: '$5.6B', maxLeverage: '150x' },
  { pair: 'OMNIUSDT', lastPrice: 2.48, change: 5.91, fundingRate: '0.0150%', openInterest: '$120M', volume24h: '$450M', maxLeverage: '100x' },
  { pair: 'XRPUSDT', lastPrice: 2.19, change: 4.62, fundingRate: '0.0100%', openInterest: '$890M', volume24h: '$3.2B', maxLeverage: '150x' },
  { pair: 'DOGEUSDT', lastPrice: 0.1825, change: 3.18, fundingRate: '0.0300%', openInterest: '$450M', volume24h: '$1.8B', maxLeverage: '100x' },
];

export const ORDER_BOOK = {
  asks: [
    { price: 82480.00, amount: 1.234, total: 101780.32 },
    { price: 82475.50, amount: 0.892, total: 73568.15 },
    { price: 82472.00, amount: 2.156, total: 177849.63 },
    { price: 82470.00, amount: 0.567, total: 46740.49 },
    { price: 82468.50, amount: 1.890, total: 155865.47 },
    { price: 82465.00, amount: 3.456, total: 284959.04 },
    { price: 82462.00, amount: 0.234, total: 19296.11 },
    { price: 82460.50, amount: 1.567, total: 129174.52 },
  ],
  bids: [
    { price: 82453.21, amount: 2.345, total: 193352.28 },
    { price: 82450.00, amount: 1.678, total: 138354.60 },
    { price: 82447.50, amount: 0.945, total: 77912.89 },
    { price: 82445.00, amount: 3.210, total: 264648.45 },
    { price: 82442.00, amount: 1.123, total: 92582.37 },
    { price: 82440.00, amount: 0.789, total: 65045.16 },
    { price: 82437.50, amount: 2.567, total: 211615.43 },
    { price: 82435.00, amount: 1.890, total: 155802.15 },
  ],
};

export const ELITE_TRADERS = [
  { name: 'ShadowBlade', avatar: 'warrior', roi: 342.5, winRate: 78.2, followers: 12456, pnl: '+$1.2M', profitShare: '10%', trades: 892 },
  { name: 'CrystalMage', avatar: 'mage', roi: 287.3, winRate: 82.1, followers: 9823, pnl: '+$890K', profitShare: '15%', trades: 1234 },
  { name: 'PhoenixRider', avatar: 'summoner', roi: 198.7, winRate: 71.5, followers: 7654, pnl: '+$567K', profitShare: '12%', trades: 678 },
  { name: 'NightHunter', avatar: 'thief', roi: 456.2, winRate: 69.8, followers: 15234, pnl: '+$2.1M', profitShare: '8%', trades: 2345 },
  { name: 'DragonKnight', avatar: 'knight', roi: 178.9, winRate: 85.3, followers: 6789, pnl: '+$345K', profitShare: '20%', trades: 456 },
  { name: 'StarWeaver', avatar: 'whitemage', roi: 312.1, winRate: 76.4, followers: 8901, pnl: '+$780K', profitShare: '10%', trades: 1567 },
];

export const STAKING_POOLS = [
  { token: 'OMNI', apy: 24.5, minStake: 100, lockDays: 30, totalStaked: '45.2M', rewards: 'OMNI' },
  { token: 'OMNI', apy: 36.8, minStake: 500, lockDays: 90, totalStaked: '23.1M', rewards: 'OMNI' },
  { token: 'OMNI', apy: 52.1, minStake: 1000, lockDays: 180, totalStaked: '12.8M', rewards: 'OMNI' },
  { token: 'BTC', apy: 5.2, minStake: 0.01, lockDays: 30, totalStaked: '1,234 BTC', rewards: 'BTC' },
  { token: 'ETH', apy: 7.8, minStake: 0.1, lockDays: 30, totalStaked: '18,456 ETH', rewards: 'ETH' },
  { token: 'USDT', apy: 12.4, minStake: 100, lockDays: 14, totalStaked: '89.2M USDT', rewards: 'USDT' },
  { token: 'SOL', apy: 9.6, minStake: 1, lockDays: 30, totalStaked: '234K SOL', rewards: 'SOL' },
];

export const FARM_POOLS = [
  { pair: 'OMNI/USDT', apy: 89.4, tvl: '$12.4M', multiplier: '3x', earned: 0, staked: 0 },
  { pair: 'OMNI/ETH', apy: 72.1, tvl: '$8.9M', multiplier: '2.5x', earned: 0, staked: 0 },
  { pair: 'BTC/USDT', apy: 34.2, tvl: '$45.6M', multiplier: '2x', earned: 0, staked: 0 },
  { pair: 'ETH/USDT', apy: 28.7, tvl: '$38.2M', multiplier: '1.5x', earned: 0, staked: 0 },
  { pair: 'SOL/USDT', apy: 56.3, tvl: '$15.7M', multiplier: '2x', earned: 0, staked: 0 },
  { pair: 'OMNI/BTC', apy: 65.8, tvl: '$6.2M', multiplier: '2.5x', earned: 0, staked: 0 },
];

export const LIQUIDITY_POOLS = [
  { pair: 'OMNI/USDT', tvl: '$12.4M', volume24h: '$2.3M', fees24h: '$6,900', apy: 20.3 },
  { pair: 'BTC/USDT', tvl: '$45.6M', volume24h: '$8.9M', fees24h: '$26,700', apy: 21.4 },
  { pair: 'ETH/USDT', tvl: '$38.2M', volume24h: '$7.2M', fees24h: '$21,600', apy: 20.6 },
  { pair: 'SOL/USDT', tvl: '$15.7M', volume24h: '$4.1M', fees24h: '$12,300', apy: 28.6 },
  { pair: 'OMNI/ETH', tvl: '$8.9M', volume24h: '$1.8M', fees24h: '$5,400', apy: 22.1 },
];

export const LENDING_MARKETS = [
  { token: 'USDT', supplyApy: 8.2, borrowApy: 12.4, totalSupply: '$234M', totalBorrow: '$156M', utilization: '66.7%' },
  { token: 'USDC', supplyApy: 7.8, borrowApy: 11.9, totalSupply: '$189M', totalBorrow: '$121M', utilization: '64.0%' },
  { token: 'BTC', supplyApy: 2.1, borrowApy: 5.8, totalSupply: '2,345 BTC', totalBorrow: '890 BTC', utilization: '38.0%' },
  { token: 'ETH', supplyApy: 3.4, borrowApy: 7.2, totalSupply: '45,678 ETH', totalBorrow: '18,234 ETH', utilization: '39.9%' },
  { token: 'OMNI', supplyApy: 15.6, borrowApy: 22.3, totalSupply: '89M OMNI', totalBorrow: '34M OMNI', utilization: '38.2%' },
  { token: 'SOL', supplyApy: 4.8, borrowApy: 9.1, totalSupply: '567K SOL', totalBorrow: '189K SOL', utilization: '33.3%' },
];

export const VIP_TIERS = [
  { level: 'Standard', volume: '< $1M', makerFee: '0.020%', takerFee: '0.060%', withdrawal: '$500K', perks: [] },
  { level: 'VIP 1', volume: '$1M+', makerFee: '0.018%', takerFee: '0.050%', withdrawal: '$1M', perks: ['Priority support'] },
  { level: 'VIP 2', volume: '$5M+', makerFee: '0.016%', takerFee: '0.045%', withdrawal: '$2M', perks: ['Priority support', 'Account manager'] },
  { level: 'VIP 3', volume: '$10M+', makerFee: '0.014%', takerFee: '0.040%', withdrawal: '$5M', perks: ['Priority support', 'Account manager', 'Exclusive airdrops'] },
  { level: 'VIP 4', volume: '$25M+', makerFee: '0.012%', takerFee: '0.035%', withdrawal: '$10M', perks: ['All VIP 3 perks', 'VIP community', 'Event invites'] },
  { level: 'VIP 5', volume: '$50M+', makerFee: '0.010%', takerFee: '0.030%', withdrawal: '$20M', perks: ['All VIP 4 perks', 'Custom fee rates', 'Direct line'] },
  { level: 'VVIP', volume: '$100M+', makerFee: '0.006%', takerFee: '0.025%', withdrawal: 'Unlimited', perks: ['All perks', 'Co-marketing', 'Revenue share'] },
];

export const FEE_SCHEDULE = {
  spot: { maker: '0.10%', taker: '0.10%', note: 'Volume discounts available' },
  futures: { maker: '0.00%', taker: '0.03%', note: 'VIP rates as low as 0.006%' },
  withdrawal: { BTC: '0.0005 BTC', ETH: '0.005 ETH', USDT: '1 USDT (TRC20)', OMNI: '5 OMNI' },
};

export const PROMOTIONS = [
  { title: 'Omni Launch Fest', description: 'Win a share of 1,000,000 OMNI!', type: 'spot', endDate: '2026-05-15', reward: '1,000,000 OMNI' },
  { title: 'New User Rewards', description: 'Unlock 30,000 USDT bonus now!', type: 'new-user', endDate: '2026-12-31', reward: '30,000 USDT' },
  { title: 'Futures Challenge', description: 'Trade futures to share airdrop', type: 'futures', endDate: '2026-04-30', reward: '50,000 USDT' },
  { title: 'Airdrop Hub', description: 'Deposit & trade to earn airdrops', type: 'airdrop', endDate: '2026-06-01', reward: 'Various tokens' },
  { title: 'Spot Challenge', description: 'Trade spot to share 30,000 USDT', type: 'spot', endDate: '2026-05-01', reward: '30,000 USDT' },
  { title: 'Invite & Earn', description: 'Earn up to 40% commission', type: 'referral', endDate: 'Ongoing', reward: '40% commission' },
];

export const DAO_PROPOSALS = [
  { id: 1, title: 'Increase Staking Rewards for OMNI/ETH Pool', status: 'active', votes: { for: 12456789, against: 3456789 }, endDate: '2026-04-20', author: 'OmniCore' },
  { id: 2, title: 'Fund Development of Mobile Wallet v2', status: 'active', votes: { for: 8901234, against: 1234567 }, endDate: '2026-04-18', author: 'DevGuild' },
  { id: 3, title: 'Reduce Trading Fees for VIP Tiers', status: 'passed', votes: { for: 23456789, against: 2345678 }, endDate: '2026-04-10', author: 'TradeCouncil' },
  { id: 4, title: 'Allocate Treasury for Marketing Campaign', status: 'passed', votes: { for: 15678901, against: 5678901 }, endDate: '2026-04-05', author: 'OmniCore' },
  { id: 5, title: 'Add Support for Cross-chain Bridges', status: 'failed', votes: { for: 4567890, against: 8901234 }, endDate: '2026-03-28', author: 'BridgeDAO' },
];

export const WALLET_ASSETS = [
  { token: 'OMNI', balance: 12500.00, value: 30875.00, change: 5.82 },
  { token: 'BTC', balance: 0.5432, value: 44789.23, change: 2.34 },
  { token: 'ETH', balance: 8.234, value: 25727.72, change: -1.02 },
  { token: 'USDT', balance: 15000.00, value: 15000.00, change: 0.01 },
  { token: 'SOL', balance: 45.67, value: 8583.56, change: 6.23 },
];

export const LEARN_ARTICLES = [
  { title: 'How to Use AI Agents for Crypto Trading', category: 'Beginner', date: '2026-04-10' },
  { title: '10 Concepts You Must Know Before Buying Crypto', category: 'Beginner', date: '2026-04-10' },
  { title: 'DEX: Benefits, Risks, and How It Works', category: 'Intermediate', date: '2026-04-08' },
  { title: '51% Attacks: How Blockchains Get Rewritten', category: 'Advanced', date: '2026-04-07' },
  { title: 'Understanding Staking and Yield Farming', category: 'Beginner', date: '2026-04-05' },
  { title: 'The Complete Guide to DeFi Lending', category: 'Intermediate', date: '2026-04-03' },
  { title: 'How to Set Up a Decentralized Identity (DID)', category: 'Advanced', date: '2026-04-01' },
  { title: 'DAO Governance: A Beginner\'s Overview', category: 'Beginner', date: '2026-03-28' },
];

export const CRYPTO_NEWS = [
  { title: 'Bitcoin Surges Past $82K as Institutional Demand Grows', date: '2026-04-10', category: 'Bitcoin' },
  { title: 'Ethereum Layer 2 Solutions See Record Activity', date: '2026-04-10', category: 'Ethereum' },
  { title: 'Solana DeFi TVL Reaches New All-Time High', date: '2026-04-09', category: 'DeFi' },
  { title: 'New Regulatory Framework for Crypto Proposed in EU', date: '2026-04-09', category: 'Regulation' },
  { title: 'Top 5 Cryptos to Watch in Q2 2026', date: '2026-04-08', category: 'Analysis' },
  { title: 'AI-Powered Trading Bots Gain Mainstream Adoption', date: '2026-04-07', category: 'Technology' },
];

export const BANKING_CARD_TIERS = [
  { tier: 'Crystal', color: '#00f0ff', benefits: ['2% cashback', '$10K monthly limit', 'Free ATM withdrawals'], cost: '100 OMNI' },
  { tier: 'Platinum', color: '#8B5CF6', benefits: ['4% cashback', '$50K monthly limit', 'Airport lounge', 'Free ATM worldwide'], cost: '500 OMNI' },
  { tier: 'Obsidian', color: '#1a1a3e', benefits: ['6% cashback', '$200K monthly limit', 'Concierge', 'All Platinum perks'], cost: '2,000 OMNI' },
  { tier: 'Celestial', color: '#ffd700', benefits: ['8% cashback', 'Unlimited', 'Private events', 'All Obsidian perks'], cost: '10,000 OMNI' },
];

export const REFERRAL_TIERS = [
  { level: 'Starter', referrals: '1-10', commission: '20%', bonus: '$10 per referral' },
  { level: 'Builder', referrals: '11-50', commission: '25%', bonus: '$15 per referral' },
  { level: 'Influencer', referrals: '51-200', commission: '30%', bonus: '$20 per referral' },
  { level: 'Ambassador', referrals: '201-1000', commission: '35%', bonus: '$25 per referral' },
  { level: 'Legend', referrals: '1000+', commission: '40%', bonus: '$30 per referral + 0.01 BTC' },
];

export const PROTECTION_FUND = {
  totalReserve: '1,000 BTC',
  usdValue: '$82,453,210',
  walletAddresses: [
    { chain: 'Bitcoin', address: 'bc1q...omni...fund1' },
    { chain: 'Ethereum', address: '0x7f3a...omni...fund2' },
  ],
  highlights: {
    transparent: 'Wallet addresses are public, reflecting commitment to transparency and integrity.',
    reliable: 'Large Bitcoin reserve to reduce volatility, with ongoing monitoring.',
    efficient: 'Fully backed, allowing quick coverage without external dependencies.',
  },
};

export const PROOF_OF_RESERVES = {
  totalAssets: '$4.2B',
  totalLiabilities: '$3.8B',
  reserveRatio: '110.5%',
  lastAudit: '2026-04-01',
  assets: [
    { token: 'BTC', held: '12,456', liability: '11,234', ratio: '110.9%' },
    { token: 'ETH', held: '89,234', liability: '78,456', ratio: '113.7%' },
    { token: 'USDT', held: '1.2B', liability: '1.1B', ratio: '109.1%' },
    { token: 'OMNI', held: '420M', liability: '380M', ratio: '110.5%' },
  ],
};

export const NAV_STRUCTURE = {
  buyCrypto: { label: 'Buy Crypto', items: ['Quick Buy (Card, Apple Pay, Google Pay, ACH)'] },
  markets: { label: 'Markets', link: '/pages/markets.html' },
  futures: {
    label: 'Futures', items: [
      { name: 'USDT-M Futures', desc: 'Perpetual futures settled in USDT' },
      { name: 'Elite Trading', desc: 'Lead trades, share profits' },
      { name: 'Demo Trading', desc: 'USDT-M futures demo' },
      { name: 'About Futures', desc: 'Trade with confidence' },
      { name: 'Funding Rate', desc: 'Overview of futures funding rate' },
      { name: 'Position Limits', desc: '' },
      { name: 'Leaderboard', desc: 'Current & past leaderboards' },
    ]
  },
  spot: { label: 'Spot', link: '/pages/spot.html' },
  copyTrade: { label: 'Copy Trade', link: '/pages/copy-trading.html' },
  earn: {
    label: 'Earn', items: [
      { name: 'Staking', desc: 'Subscribe now to earn steady returns' },
      { name: 'Auto Earn', desc: 'Keep holding, keep earning' },
      { name: 'APY Farming', desc: 'Farm LP tokens for high yields' },
      { name: 'Liquidity', desc: 'Provide liquidity, earn fees' },
      { name: 'Lending', desc: 'Supply & borrow crypto assets' },
    ]
  },
  more: {
    label: 'More', items: [
      { name: 'Protection Fund', desc: '1,000 BTC to safeguard your assets' },
      { name: 'Omni Token Zone', desc: 'Exclusive fee rates and airdrops' },
      { name: 'Elite Trader', desc: 'Share strategies and earn rewards' },
      { name: 'Affiliate', desc: 'Unlock exclusive perks and high commissions' },
      { name: 'VIP Perks', desc: 'Become an Omni VIP today' },
      { name: 'Events', desc: 'Explore events around the world' },
      { name: 'Career', desc: 'Join Omni and build the future' },
      { name: 'Announcements', desc: 'Get the latest updates' },
      { name: 'Crypto Wiki', desc: 'Master trading with easy guides' },
      { name: 'Crypto News', desc: 'Keep up with the latest trends' },
      { name: 'Contact Verifier', desc: 'Verify the channels you use' },
      { name: 'DAO Governance', desc: 'Vote on platform proposals' },
      { name: 'Omni Wallet', desc: 'Your native multi-asset wallet' },
    ]
  },
};

export const FOOTER_LINKS = {
  about: ['About Us', 'Announcements', 'Media Kit', 'Community', 'Omni Token Zone', 'DAO Governance'],
  legal: ['Legal Statement', 'Risk Disclosure', 'Terms of Use', 'Privacy Policy', 'AML/CTF Policy'],
  products: ['Futures', 'Spot', 'Copy Trade', 'Markets', 'Omni Store', 'Proof of Reserves', 'Omni Wallet'],
  services: ['OTC', 'Download App', 'Affiliate', 'VIP Program', 'API', 'Listing Application'],
  learn: ['User Guide', 'Learn', 'Q&A', 'Academy', 'Glossary', 'Crypto Prices', 'Price Predictions'],
  support: ['Help Center', 'Fee Schedule', 'Trading Rules', 'Contact Verifier', 'Submit Feedback'],
};

export const CRYPTO_TOOLS = [
  { name: 'Converter', desc: 'Convert between crypto and fiat', examples: ['BTC to USD', 'ETH to EUR', 'OMNI to USD'] },
  { name: 'PnL Calculator', desc: 'Calculate profit and loss on trades' },
  { name: 'Futures Calculator', desc: 'Calculate futures positions, margin, liquidation' },
  { name: 'Tax Calculator', desc: 'Estimate crypto tax obligations' },
];
