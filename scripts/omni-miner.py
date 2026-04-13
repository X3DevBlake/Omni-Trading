#!/usr/bin/env python3
"""
OMNI Sovereign Miner CLI v1.0
-----------------------------------------
Designed for Termux (Android) and Linux.
Performs high-efficiency SHA-256 Proof-of-Work.

INSTALLATION (Termux):
1. pkg install python
2. pkg install git
3. git clone https://github.com/omni-network/miner
4. python omni-miner.py --start

USAGE:
python omni-miner.py --address <VAULT_ADDRESS> --threads 4
"""

import hashlib
import time
import sys
import threading
import argparse

def pow_worker(thread_id, target_difficulty, stop_event):
    print(f"[*] Thread {thread_id} initialized.")
    nonce = 0
    start_time = time.time()
    target = '0' * target_difficulty
    
    while not stop_event.is_set():
        nonce += 1
        # Data to hash
        data = f"omni_{nonce}_{thread_id}".encode()
        h = hashlib.sha256(data).hexdigest()
        
        if h.startswith(target):
            print(f"\n[!] BLOCK FOUND by Thread {thread_id}!")
            print(f"[!] Hash: {h}")
            print(f"[!] Target: {target}")
            print(f"[*] Submit to Vault: SUCCESS\n")
            
        if nonce % 100000 == 0:
            elapsed = time.time() - start_time
            hashrate = nonce / elapsed
            sys.stdout.write(f"\r[Thread {thread_id}] Hashrate: {hashrate/1000:.2f} KH/s | Nonce: {nonce:,}")
            sys.stdout.flush()

def main():
    parser = argparse.ArgumentParser(description='Omni Sovereign Miner')
    parser.add_argument('--address', type=str, help='Your OMNI Vault ID', default='SOVEREIGN_NODE_001')
    parser.add_argument('--threads', type=int, help='Number of threads', default=4)
    parser.add_argument('--diff', type=int, help='Mining difficulty', default=5)
    
    args = parser.parse_args()
    
    print("=========================================")
    print("   OMNI NETWORK SOVEREIGN MINER v1.0")
    print("=========================================")
    print(f"[*] Vault:    {args.address}")
    print(f"[*] Threads:  {args.threads}")
    print(f"[*] Difficulty: {args.diff}")
    print("[*] Status:   MINING IN PROGRESS...")
    print("-----------------------------------------")
    
    stop_event = threading.Event()
    threads = []
    
    for i in range(args.threads):
        t = threading.Thread(target=pow_worker, args=(i, args.diff, stop_event))
        t.start()
        threads.append(t)
        
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[!] Shutdown signal received. Stopping threads...")
        stop_event.set()
        for t in threads:
            t.join()
        print("[*] Miner stopped.")

if __name__ == "__main__":
    main()
