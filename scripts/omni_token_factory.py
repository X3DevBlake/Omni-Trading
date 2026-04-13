import math
import time

class OmniTokenEngine:
    def __init__(self):
        self.OMNI_PREMINE = 10_000_000_000
        self.SECONDS_IN_YEAR = 31_536_000
        self.BLOCK_TIME = 3  # Seconds per block
        
        # Reward Config
        self.STAKING_APR = 0.18 # 18% Base APR
        self.FARM_REWARD_POOL_YEARLY = 5_000_000 # 5M OMNI per year per standard farm
        
    def mint_somni(self, omni_amount, current_exchange_rate=1.0):
        """
        Calculates sOMNI (Staked OMNI) tokens to be issued.
        Formula: sOMNI = OMNI / ExchangeRate
        """
        somni_issued = omni_amount / current_exchange_rate
        return round(somni_issued, 8)

    def generate_lp_tokens(self, amount_a, amount_b, total_lp_supply=0):
        """
        Calculates LP tokens rewarded for providing liquidity.
        Formula: sqrt(amount_a * amount_b)
        """
        if amount_a <= 0 or amount_b <= 0:
            return 0
            
        lp_to_mint = math.sqrt(amount_a * amount_b)
        return round(lp_to_mint, 8)

    def calculate_farm_apy(self, pool_total_lp, omni_price=2.50):
        """
        Calculates current Farm APY based on total staked LP and reward emissions.
        """
        if pool_total_lp <= 0:
            return 500.0 # Initial "Empty Pool" Boosted APY
            
        # Simulated value of 1 LP token = $10 (simplification for the engine logic)
        total_value_locked = pool_total_lp * 10 
        
        # Yearly Rewards value in USD
        yearly_rewards_usd = self.FARM_REWARD_POOL_YEARLY * omni_price
        
        # APY Formula: (Yearly Rewards in USD / TVL in USD) * 100
        apy = (yearly_rewards_usd / total_value_locked) * 100
        return round(apy, 2)

    def simulate_staking_yield(self, principal_omni, period_days):
        """
        Simulates OMNI yield over a specific period.
        """
        daily_rate = self.STAKING_APR / 365
        total_yield = principal_omni * (daily_rate * period_days)
        return round(total_yield, 4)

if __name__ == "__main__":
    # Quick Simulation for User Review
    engine = OmniTokenEngine()
    
    print("--- Omni DeFi Token Engine Simulation ---")
    
    # 1. Staking Test
    staked = 1000
    days = 365
    yield_omni = engine.simulate_staking_yield(staked, days)
    print(f"Staking: {staked} OMNI for {days} days @ {engine.STAKING_APR*100}% APR")
    print(f"Resulting Yield: {yield_omni} OMNI")
    
    # 2. LP Test
    lp = engine.generate_lp_tokens(500, 500)
    print(f"\nLiquidity: Deposit 500 OMNI / 500 USDT")
    print(f"Generated LP Tokens: {lp} OMNI-USDT-LP")
    
    # 3. APY Scaling Test
    apy = engine.calculate_farm_apy(100_000)
    print(f"\nFarm APY @ 100,000 Total Staked LP: {apy}%")
    
    apy_high = engine.calculate_farm_apy(500_000)
    print(f"Farm APY @ 500,000 Total Staked LP: {apy_high}% (Scaling check)")
