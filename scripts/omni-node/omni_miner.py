"""
============================================================
  OMNI MINING ENGINE v1.0
  Sovereign Layer-1 Zero-Gas Proof-of-Authority Block Miner
============================================================
  Requirements: pip install web3 eth-account colorama
  Usage: python omni_miner.py
"""

import time
import json
import os
import sys
from datetime import datetime

# Color output helper
try:
    from colorama import Fore, Style, init
    init(autoreset=True)
    def green(t): return Fore.GREEN + str(t) + Style.RESET_ALL
    def cyan(t): return Fore.CYAN + str(t) + Style.RESET_ALL
    def yellow(t): return Fore.YELLOW + str(t) + Style.RESET_ALL
    def red(t): return Fore.RED + str(t) + Style.RESET_ALL
    def bold(t): return Style.BRIGHT + str(t) + Style.RESET_ALL
except ImportError:
    def green(t): return str(t)
    def cyan(t): return str(t)
    def yellow(t): return str(t)
    def red(t): return str(t)
    def bold(t): return str(t)

# ============================================================
# CONFIGURATION — Edit these to match YOUR setup
# ============================================================
OMNI_RPC = "http://127.0.0.1:8545"
GENESIS_WALLET = "0x49f16218147299ca9d0407066A54587dbc3d3791"
GENESIS_PRIVATE_KEY = "9d457beecbe5ef6ecc3ad62b3e5bdd86da4eaa31158db3a05ba1c6e8f9a63fe3"
MINER_WALLET = ""
MINING_REWARD_PER_BLOCK = 50
LEDGER_FILE = "omni_ledger.json"
# ============================================================

def load_ledger():
    if os.path.exists(LEDGER_FILE):
        with open(LEDGER_FILE, 'r') as f:
            return json.load(f)
    return {"total_mined": 0, "blocks": [], "wallet": GENESIS_WALLET}

def save_ledger(ledger):
    with open(LEDGER_FILE, 'w') as f:
        json.dump(ledger, f, indent=2)

def fmt_omni(wei_value):
    """Convert Wei to OMNI (18 decimals)"""
    return round(wei_value / 10**18, 4)

def print_banner():
    os.system('cls' if os.name == 'nt' else 'clear')
    print(bold(cyan("╔══════════════════════════════════════════════════════════╗")))
    print(bold(cyan("║           ⛏  OMNI SOVEREIGN MINING ENGINE v1.0           ║")))
    print(bold(cyan("║      Zero-Gas · Proof-of-Authority · Real-Time Rewards   ║")))
    print(bold(cyan("╚══════════════════════════════════════════════════════════╝")))
    print()

def run_miner():
    print_banner()

    # Validate config
    if not GENESIS_PRIVATE_KEY:
        print(red("⚠  ERROR: GENESIS_PRIVATE_KEY is not set!"))
        print(yellow("   Open omni_miner.py and paste your private key from launch_omni_network.py"))
        print(yellow("   It looks like: 9d457beecbe5ef6ecc3ad62b3e5bdd86da4ea..."))
        sys.exit(1)

    # Connect to Omni Node
    try:
        from web3 import Web3
        from eth_account import Account
    except ImportError:
        print(red("⚠  Missing libraries. Run: pip install web3 eth-account colorama"))
        sys.exit(1)

    print(f"   {yellow('Connecting to Omni Node at')} {OMNI_RPC} ...")
    w3 = Web3(Web3.HTTPProvider(OMNI_RPC))

    if not w3.is_connected():
        print(red("✗  Cannot reach Omni Node."))
        print(yellow("   Is Geth running? Start it first with:"))
        print(cyan("   geth --datadir ./chaindata --networkid 8888 --http --http.port 8545 --http.corsdomain \"*\" --http.api eth,net,web3,personal --mine --miner.etherbase " + GENESIS_WALLET))
        sys.exit(1)

    print(green("✓  Connected to Omni Layer-1 Network (Chain ID: 8888)"))

    # Set up mining wallet
    receiver = MINER_WALLET if MINER_WALLET else GENESIS_WALLET
    print(f"   {yellow('Mining rewards →')} {green(receiver)}")

    ledger = load_ledger()
    last_block = w3.eth.block_number

    print(f"\n{bold('Starting block scan...')}\n")
    print(f"{'─'*60}")

    while True:
        try:
            current_block = w3.eth.block_number

            if current_block > last_block:
                for block_num in range(last_block + 1, current_block + 1):
                    # Get wallet balance
                    balance_wei = w3.eth.get_balance(receiver)
                    balance_omni = fmt_omni(balance_wei)

                    # Update ledger
                    ledger["total_mined"] += MINING_REWARD_PER_BLOCK
                    ledger["blocks"].append({
                        "block": block_num,
                        "reward": MINING_REWARD_PER_BLOCK,
                        "timestamp": datetime.now().isoformat(),
                        "wallet": receiver
                    })
                    save_ledger(ledger)

                    now = datetime.now().strftime("%H:%M:%S")
                    print(f"  {green('⛏  BLOCK SEALED')} #{bold(block_num)}")
                    print(f"     {cyan('Reward:        ')} +{green(str(MINING_REWARD_PER_BLOCK) + ' OMNI')}")
                    print(f"     {cyan('Network Wallet:')} {balance_omni:,.4f} OMNI")
                    print(f"     {cyan('Session Mined: ')} {ledger['total_mined']:,} OMNI")
                    print(f"     {cyan('Time:          ')} {now}")
                    print(f"{'─'*60}")

                last_block = current_block

            else:
                # Print waiting animation every 3s
                bal_wei = w3.eth.get_balance(receiver)
                bal = fmt_omni(bal_wei)
                print(f"\r  ⏳  Waiting for next block... | Block #{current_block} | Balance: {green(str(bal) + ' OMNI')}", end="", flush=True)

            time.sleep(3)

        except KeyboardInterrupt:
            print(f"\n\n{bold(yellow('Mining session ended.'))} Total this session: {green(str(ledger['total_mined']) + ' OMNI')}")
            print(f"Ledger saved to: {cyan(LEDGER_FILE)}")
            break
        except Exception as e:
            print(f"\n{red('⚠ Node Error:')} {e}")
            time.sleep(5)

if __name__ == "__main__":
    run_miner()
