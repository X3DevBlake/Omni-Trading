import requests
import json
import time
import os
from datetime import datetime

# Configuration
RPC_URL = "http://localhost:8545"
NULL_ADDRESS = "0x0000000000000000000000000000000000000000"
OFFICIAL_POOL = "0x000000000000000000000000000000000000Ba5e"
TOTAL_CAP = 10_000_000_000

def rpc_call(method, params=[]):
    payload = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1
    }
    try:
        response = requests.post(RPC_URL, json=payload, timeout=5)
        return response.json().get('result')
    except Exception as e:
        return None

def get_balance(address):
    res = rpc_call("eth_getBalance", [address, "latest"])
    if res:
        # Convert wei to OMNI (18 decimals)
        return int(res, 16) / 10**18
    return 0

def get_block_number():
    res = rpc_call("eth_blockNumber", [])
    if res:
        return int(res, 16)
    return 0

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def main():
    print("Initializing Omni Deflationary Monitor...")
    time.sleep(1)
    
    last_burned = -1
    
    while True:
        clear_screen()
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        block = get_block_number()
        
        burn_pit = get_balance(NULL_ADDRESS)
        pool_balance = get_balance(OFFICIAL_POOL)
        circulating = TOTAL_CAP - burn_pit
        
        print(f"==================================================")
        print(f"   OMNI CHAIN DEFLATIONARY MONITOR v1.0")
        print(f"==================================================")
        print(f"Time: {now} | Block: #{block}")
        print(f"Node: {RPC_URL}")
        print(f"--------------------------------------------------")
        
        print(f"[🔥] Burn Pit (0x0...000): {burn_pit:,.2f} OMNI")
        print(f"[🌊] Official Pool:        {pool_balance:,.2f} OMNI")
        print(f"--------------------------------------------------")
        
        print(f"[💎] Initial Cap:          {TOTAL_CAP:,.0f} OMNI")
        print(f"[📉] Circulating Supply:   {circulating:,.2f} OMNI")
        
        deflation_pct = (burn_pit / TOTAL_CAP) * 100
        print(f"[🚀] Total Deflation:      {deflation_pct:.6f}%")
        
        if last_burned != -1 and burn_pit > last_burned:
            diff = burn_pit - last_burned
            print(f"\n[!] ALERT: RECENT BURN DETECTED! +{diff:.2f} OMNI")
            # In a real shell we could trigger a beep
            print("\a") 
            
        last_burned = burn_pit
        
        print(f"--------------------------------------------------")
        print(f"Status: MONITORING LIVE PACKETS...")
        print(f"Press Ctrl+C to stop.")
        
        time.sleep(5)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nMonitor stopped.")
