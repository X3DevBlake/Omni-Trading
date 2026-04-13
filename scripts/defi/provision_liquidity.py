import json
import time
import sys

try:
    from web3 import Web3
except ImportError:
    print("\n[!] Error: Web3.py is not installed.")
    print("Please run: pip install web3")
    sys.exit(1)

def provision_liquidity():
    print("\n" + "="*50)
    print("   OMNI CHAIN OFFICIAL LIQUIDITY PROVISIONING   ")
    print("="*50)

    # Configuration
    RPC_URL = "http://127.0.0.1:8545"
    POOL_ADDRESS = "0x000000000000000000000000000000000000BA5E"
    LIQUIDITY_AMOUNT_OMNI = 5_000_000_000 # 5 Billion OMNI
    
    w3 = Web3(Web3.HTTPProvider(RPC_URL))

    if not w3.is_connected():
        print(f"\n[!] Error: Could not connect to Omni Node at {RPC_URL}")
        print("Make sure your Omni Node (Geth) is running.")
        return

    print(f"\n[+] Connected to Omni L1 (Chain ID: {w3.eth.chain_id})")
    
    # Ensure Checksum Format for Pooled Address
    try:
        target_pool = w3.to_checksum_address(POOL_ADDRESS)
    except:
        target_pool = POOL_ADDRESS

    # Discover Accounts
    accounts = w3.eth.accounts
    dev_mode = len(accounts) > 0
    
    if dev_mode:
        genesis_address = accounts[0]
        print(f"\n[+] Turbo Dev Mode Detected")
        print(f"[+] Master Developer Account: {genesis_address}")
        private_key = None # Not needed for unlocked dev account
    else:
        # Prompt for key
        print("\n" + "-"*30)
        print("GENESIS AUTHENTICATION REQUIRED")
        print("-"*30)
        private_key = input("Enter Genesis Private Key: ").strip()
        if not private_key.startswith('0x'): private_key = '0x' + private_key
        account = w3.eth.account.from_key(private_key)
        genesis_address = account.address
        print(f"\n[+] Authenticated: {genesis_address}")

    try:
        balance_wei = w3.eth.get_balance(genesis_address)
        balance_omni = float(w3.from_wei(balance_wei, 'ether'))
        
        print(f"[+] Master Balance: {balance_omni:,.2f} OMNI")
        
        # In Dev Mode, we have infinite money, so we just send exactly what's requested
        amount_to_send_omni = float(LIQUIDITY_AMOUNT_OMNI)
        if balance_omni < amount_to_send_omni:
            amount_to_send_omni = balance_omni * 0.95

        # Assemble Transaction
        amount_wei = w3.to_wei(amount_to_send_omni, 'ether')
        
        tx = {
            'from': genesis_address,
            'to': target_pool,
            'value': amount_wei,
            'gas': 21000,
            'gasPrice': w3.eth.gas_price,
            'nonce': w3.eth.get_transaction_count(genesis_address),
            'chainId': w3.eth.chain_id
        }
        
        print(f"\n[>] Provisioning {amount_to_send_omni:,.2f} OMNI to Official Pool...")
        print(f"    Target: {target_pool}")
        
        if private_key:
            signed_tx = w3.eth.account.sign_transaction(tx, private_key)
            raw_tx = getattr(signed_tx, 'raw_transaction', getattr(signed_tx, 'rawTransaction', None))
            tx_hash = w3.eth.send_raw_transaction(raw_tx)
        else:
            # Geth --dev handles the signing internally if account is unlocked
            tx_hash = w3.eth.send_transaction(tx)
        
        print(f"\n[OK] Transaction Broadcasted!")
        print(f"     Hash: {w3.to_hex(tx_hash)}")
        
        print("\nWaiting for block confirmation...")
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        print("\n" + "="*50)
        print("   OFFICIAL OMNI LIQUIDITY SUCCESSFULLY DEPLOYED  ")
        print("="*50)
        print(f"Status: SUCCESS (Block #{receipt.blockNumber})")
        print(f"Pool Address: {target_pool}")
        
        final_balance = w3.from_wei(w3.eth.get_balance(target_pool), 'ether')
        print(f"Pool Final Balance: {final_balance:,.2f} OMNI")
        print("="*50 + "\n")

    except Exception as e:
        print(f"\n[FATAL ERROR] {str(e)}")

if __name__ == "__main__":
    provision_liquidity()
