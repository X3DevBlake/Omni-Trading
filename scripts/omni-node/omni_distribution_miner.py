"""
============================================================
  OMNI TOKEN DISTRIBUTION MINING ENGINE v2.0
  Bitcoin-style Difficulty · Variable Block Rewards
  Draws from the 10 Billion Genesis Supply
============================================================
  Requirements: pip install web3 eth-account colorama requests
  Usage: python omni_distribution_miner.py
  
  The Genesis wallet (holding 10B OMNI) automatically sends
  mining rewards to connected wallets based on a SHA-256 
  proof-of-work puzzle, just like Bitcoin.
============================================================
"""

import hashlib
import time
import json
import os
import sys
import random
from datetime import datetime

try:
    from colorama import Fore, Style, init
    init(autoreset=True)
    G = lambda t: Fore.GREEN + str(t) + Style.RESET_ALL
    C = lambda t: Fore.CYAN + str(t) + Style.RESET_ALL
    Y = lambda t: Fore.YELLOW + str(t) + Style.RESET_ALL
    R = lambda t: Fore.RED + str(t) + Style.RESET_ALL
    W = lambda t: Style.BRIGHT + str(t) + Style.RESET_ALL
    M = lambda t: Fore.MAGENTA + str(t) + Style.RESET_ALL
except ImportError:
    G=C=Y=R=W=M = str

try:
    from web3 import Web3
    from eth_account import Account
except ImportError:
    print("ERROR: Run: pip install web3 eth-account colorama")
    sys.exit(1)

# ============================================================
# GENESIS CONFIGURATION (DO NOT EDIT)
# ============================================================
OMNI_RPC          = "http://127.0.0.1:8545"
GENESIS_WALLET    = "0x49f16218147299ca9d0407066A54587dbc3d3791"
GENESIS_PRIVKEY   = "9d457beecbe5ef6ecc3ad62b3e5bdd86da4eaa31158db3a05ba1c6e8f9a63fe3"
TOTAL_SUPPLY      = 10_000_000_000  # 10 Billion OMNI
MAX_DISTRIBUTABLE = 5_000_000_000   # 5 Billion reserved for mining (50% of supply)
STATE_FILE        = "mining_state.json"

# ============================================================
# MINING PARAMETERS (Adjust to tune difficulty feel)
# ============================================================
INITIAL_DIFFICULTY    = 4     # Number of leading zeros in hash (like Bitcoin)
DIFFICULTY_ADJUSTMENT = 100   # Re-calculate difficulty every N blocks 
TARGET_BLOCK_TIME     = 15    # Seconds per block (target)

# Reward tiers: (probability_weight, reward_in_OMNI)
# Mostly fractions, rarely jackpot 1 OMNI
REWARD_TIERS = [
    (50,  0.001),   # 50% chance → 0.001 OMNI (dust reward)
    (25,  0.01),    # 25% chance → 0.01 OMNI
    (12,  0.05),    # 12% chance → 0.05 OMNI
    (8,   0.1),     # 8% chance  → 0.1 OMNI
    (4,   0.5),     # 4% chance  → 0.5 OMNI (half token)
    (1,   1.0),     # 1% chance  → 1.0 OMNI (jackpot!)
]
# ============================================================

def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE) as f:
            return json.load(f)
    return {
        "total_distributed": 0.0,
        "blocks_mined": 0,
        "difficulty": INITIAL_DIFFICULTY,
        "block_times": [],
        "wallets": {}
    }

def save_state(s):
    with open(STATE_FILE, "w") as f:
        json.dump(s, f, indent=2)

def pick_reward():
    """Weighted random reward selection simulating Bitcoin variability."""
    roll = random.randint(1, 100)
    cumulative = 0
    for weight, amount in REWARD_TIERS:
        cumulative += weight
        if roll <= cumulative:
            return amount
    return 0.001

def mine_block(difficulty, miner_address, block_index):
    """
    SHA-256 Proof-of-Work: Find a nonce that produces a hash
    with `difficulty` leading zeros. Identical to Bitcoin's mechanism.
    """
    target = "0" * difficulty
    nonce = 0
    data = f"{miner_address}{block_index}{time.time()}"

    print(f"\n  {Y('Mining block #' + str(block_index))} | Difficulty: {W(difficulty)} leading zeros")
    start = time.time()

    while True:
        hash_attempt = hashlib.sha256(f"{data}{nonce}".encode()).hexdigest()
        if hash_attempt.startswith(target):
            elapsed = time.time() - start
            print(f"  {G('✓ SOLUTION FOUND!')} Nonce: {W(nonce)} | Hash: {G(hash_attempt[:20]+'...')}")
            print(f"  Time to solve: {Y(f'{elapsed:.2f}s')}")
            return hash_attempt, nonce, elapsed
        nonce += 1

        # Show progress every 100k attempts
        if nonce % 100_000 == 0:
            print(f"\r  Hashing... {nonce:,} attempts | {hash_attempt[:16]}...", end="", flush=True)

def adjust_difficulty(state):
    """Bitcoin-style difficulty adjustment based on block times."""
    if len(state["block_times"]) < DIFFICULTY_ADJUSTMENT:
        return state["difficulty"]

    recent = state["block_times"][-DIFFICULTY_ADJUSTMENT:]
    avg_time = sum(recent) / len(recent)

    print(f"\n  {M('[ DIFFICULTY ADJUSTMENT ]')}")
    print(f"  Average block time: {avg_time:.1f}s | Target: {TARGET_BLOCK_TIME}s")

    if avg_time < TARGET_BLOCK_TIME * 0.5:
        new_diff = min(state["difficulty"] + 1, 8)
        print(f"  Blocks too fast → Increasing difficulty {state['difficulty']} → {new_diff}")
    elif avg_time > TARGET_BLOCK_TIME * 2:
        new_diff = max(state["difficulty"] - 1, 2)
        print(f"  Blocks too slow → Decreasing difficulty {state['difficulty']} → {new_diff}")
    else:
        new_diff = state["difficulty"]
        print(f"  {G('Difficulty stable at ' + str(new_diff))}")

    state["block_times"] = []
    return new_diff

def send_reward(w3, to_address, amount_omni):
    """Send OMNI from genesis wallet to miner."""
    try:
        amount_wei = w3.to_wei(amount_omni, 'ether')
        genesis_balance = w3.eth.get_balance(GENESIS_WALLET)

        if genesis_balance < amount_wei:
            print(R("  ⚠ Genesis wallet has insufficient balance for reward."))
            return None

        nonce = w3.eth.get_transaction_count(GENESIS_WALLET)
        tx = {
            'nonce': nonce,
            'to': to_address,
            'value': amount_wei,
            'gas': 21000,
            'gasPrice': 0,   # Zero gas on Omni Chain
            'chainId': 8888
        }
        signed = w3.eth.account.sign_transaction(tx, private_key=GENESIS_PRIVKEY)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=30)
        return w3.to_hex(tx_hash)
    except Exception as e:
        print(R(f"  ⚠ Transaction failed: {e}"))
        return None

def create_wallet():
    """Generate a brand new cryptographic Omni wallet for a new user."""
    acct = Account.create()
    return acct.address, acct.key.hex()

def print_banner(state, w3):
    os.system('cls' if os.name == 'nt' else 'clear')
    genesis_bal = w3.eth.get_balance(GENESIS_WALLET) / 1e18 if w3.is_connected() else 0
    pct = (state['total_distributed'] / MAX_DISTRIBUTABLE) * 100

    print(W(C("╔════════════════════════════════════════════════════════════╗")))
    print(W(C("║      ⛏  OMNI DISTRIBUTION MINING ENGINE v2.0              ║")))
    print(W(C("╠════════════════════════════════════════════════════════════╣")))
    print(f"{C('║')}  Genesis Supply Remaining : {G(f'{genesis_bal:,.2f} OMNI'):<40}{C('║')}")
    print(f"{C('║')}  Total Distributed        : {Y(f'{state[\"total_distributed\"]:,.4f} / {MAX_DISTRIBUTABLE:,}'):<40}{C('║')}")
    print(f"{C('║')}  Distribution Progress    : {M(f'{pct:.4f}%'):<40}{C('║')}")
    print(f"{C('║')}  Blocks Mined             : {W(str(state['blocks_mined'])):<40}{C('║')}")
    print(f"{C('║')}  Current Difficulty       : {Y(str(state['difficulty']) + ' leading zeros'):<40}{C('║')}")
    print(W(C("╚════════════════════════════════════════════════════════════╝\n")))

def main():
    print(W(C("\n  Connecting to Omni Layer-1 Node...")))
    w3 = Web3(Web3.HTTPProvider(OMNI_RPC))

    if not w3.is_connected():
        print(R("  ✗ Cannot connect to Omni Node at http://127.0.0.1:8545"))
        print(Y("  Make sure Geth is running! Command:"))
        print(C(f"  geth --datadir ./chaindata --networkid 8888 --http --http.port 8545 --http.corsdomain \"*\" --http.api eth,net,web3,personal --mine --miner.etherbase {GENESIS_WALLET}"))
        sys.exit(1)

    print(G("  ✓ Connected to Omni Chain (ID: 8888)"))
    state = load_state()

    # Wallet setup
    print(f"\n  {W('=== MINER WALLET SETUP ===')}")
    print(f"  {Y('Options:')}")
    print("  [1] Generate a brand new Omni wallet for me")
    print("  [2] Enter my existing Omni wallet address")
    choice = input(f"\n  {C('Choose (1 or 2): ')}").strip()

    if choice == "1":
        miner_addr, miner_key = create_wallet()
        print(f"\n  {G('✓ New Omni Wallet Created!')}")
        print(f"  {C('Public Address :')} {W(miner_addr)}")
        print(f"  {R('Private Key    :')} {miner_key}")
        print(f"\n  {Y('⚠ SAVE THIS PRIVATE KEY. It controls your mined OMNI.')}")

        # Store it in state
        state["wallets"][miner_addr] = {
            "private_key": miner_key,
            "created": datetime.now().isoformat(),
            "total_earned": 0
        }
        save_state(state)
    else:
        miner_addr = input(f"  {C('Enter your 0x wallet address: ')}").strip()
        if not w3.is_address(miner_addr):
            print(R("  ✗ Invalid Ethereum address format."))
            sys.exit(1)
        miner_addr = w3.to_checksum_address(miner_addr)

    if state["total_distributed"] >= MAX_DISTRIBUTABLE:
        print(R("\n  ⚠ Mining distribution complete. All 5 Billion mineable OMNI have been distributed."))
        sys.exit(0)

    print(f"\n  {G('Starting mining loop...')} Press {Y('Ctrl+C')} to stop.\n")
    time.sleep(2)

    try:
        while state["total_distributed"] < MAX_DISTRIBUTABLE:

            print_banner(state, w3)

            # Adjust difficulty every N blocks
            if state["blocks_mined"] > 0 and state["blocks_mined"] % DIFFICULTY_ADJUSTMENT == 0:
                state["difficulty"] = adjust_difficulty(state)

            # Mine a block (PoW puzzle)
            block_hash, nonce, solve_time = mine_block(
                state["difficulty"], miner_addr, state["blocks_mined"]
            )

            # Pick the reward
            reward = pick_reward()
            remaining = MAX_DISTRIBUTABLE - state["total_distributed"]
            reward = min(reward, remaining)  # Never overpay

            print(f"\n  {W('═' * 50)}")
            if reward == 1.0:
                print(f"  {G('🎰  JACKPOT! Full 1.0 OMNI Reward!')}")
            else:
                print(f"  {C('Block Reward:')} {G(f'{reward} OMNI')}")
            print(f"  {C('To Wallet  :')} {W(miner_addr)}")

            # Execute real on-chain transaction
            print(f"  {Y('Broadcasting zero-gas transaction...')}")
            tx_hash = send_reward(w3, miner_addr, reward)

            if tx_hash:
                state["total_distributed"] += reward
                state["blocks_mined"] += 1
                state["block_times"].append(solve_time)

                if miner_addr in state["wallets"]:
                    state["wallets"][miner_addr]["total_earned"] = \
                        state["wallets"].get(miner_addr, {}).get("total_earned", 0) + reward

                save_state(state)

                new_bal = w3.eth.get_balance(miner_addr) / 1e18
                print(f"  {G('✓ TX Success!')} Hash: {C(tx_hash[:24]+'...')}")
                print(f"  {C('New Balance  :')} {G(f'{new_bal:.6f} OMNI')}")
            else:
                print(R("  ✗ Transaction failed. Trying next block..."))

            print(f"  {W('═' * 50)}\n")
            time.sleep(1)

    except KeyboardInterrupt:
        print(f"\n\n{Y('Mining session ended.')}")
        print(f"Total distributed this session: {G(str(state['total_distributed']) + ' OMNI')}")
        save_state(state)

if __name__ == "__main__":
    main()
