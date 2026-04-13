import os
import subprocess

def colored_print(text, color_code):
    print(f"\033[{color_code}m{text}\033[0m")

def print_start_instructions():
    colored_print("\n=== OMNI L1: TURBO DEV MODE READY ===", "36")
    print("Omni Chain is now configured for high-performance Geth (v1.14+).")
    print("This mode uses instant seals and zero-configuration consensus.")
    
    print("\n[Step 1] Kill any existing Omni processes:")
    print("         Stop-Process -Name geth -Force")
    
    print("\n[Step 2] Launch the Professional Omni RPC Node:")
    print("         geth --dev --dev.period 2 --datadir ./devchain --networkid 8888 --http --http.api eth,net,web3,personal,miner --http.corsdomain '*' --http.addr 0.0.0.0")
    
    print("\n[Step 3] Provision Official Liquidity:")
    print("         python ..\\defi\\provision_liquidity.py")
    
    print("\nPRO TIP: Once running, your node will automatically mint 10+ Million OMNI into the 'Dev Master' wallet.")
    print("The Provisioning script will now automatically detect this wallet and fund the 5 Billion OMNI Official Pool.")

if __name__ == "__main__":
    print_start_instructions()
