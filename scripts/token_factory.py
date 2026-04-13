import json
import time

try:
    from web3 import Web3
    from solcx import compile_standard, install_solc
except ImportError:
    print("FATAL ERROR: Please `pip install web3 py-solc-x` before running this factory.")
    exit(1)

def deploy_omni_token():
    print("=== OMNI SMART CONTRACT TOKEN FACTORY ===")
    print("WARNING: This script will deploy a live Smart Contract to the configured Ethereum/EVM Mainnet.")
    print("Configured Supply: 10,000,000,000 (10 Billion) OMNI\n")

    # ==========================================
    # USER CONFIGURATION (YOU MUST FILL THESE IN)
    # ==========================================
    RPC_ENDPOINT = "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID" # e.g. Infura or Alchemy RPC URL
    PRIVATE_KEY = "YOUR_PRIVATE_KEY_HERE"  # Your physical wallet Private Key (Needed to pay gas for deployment)
    TARGET_WALLET = "YOUR_PERSONAL_WALLET_ADDRESS_HERE" # E.g., 0xYourWalletAddress (Where the 10 Billion goes)
    # ==========================================

    if "YOUR_PRIVATE_KEY_HERE" in PRIVATE_KEY:
        print("[!] Execution Halted: You must open token_factory.py and input your private key and target wallet before deploying.")
        exit(1)

    print("Step 1: Connecting to RPC Endpoint...")
    w3 = Web3(Web3.HTTPProvider(RPC_ENDPOINT))
    if not w3.is_connected():
        print("Failed to connect to RPC Pipeline. Check the endpoint URL.")
        exit(1)
    
    print("Step 2: Installing Solidity Compiler (v0.8.0)...")
    install_solc('0.8.0')

    print("Step 3: Compiling 10 Billion OMNI ERC-20 Assembly...")
    # The raw Smart Contract injecting 10,000,000,000 OMNI directly to msg.sender
    contract_source_code = """
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;

    contract OmniGlobalToken {
        string public name = "Omni";
        string public symbol = "OMNI";
        uint8 public decimals = 18;
        uint256 public totalSupply = 10000000000 * (10 ** uint256(decimals));

        mapping(address => uint256) public balanceOf;

        event Transfer(address indexed from, address indexed to, uint256 value);

        constructor() {
            // Send entire 10 Billion supply to the smart contract deployer
            balanceOf[msg.sender] = totalSupply;
            emit Transfer(address(0), msg.sender, totalSupply);
        }

        function transfer(address _to, uint256 _value) public returns (bool success) {
            require(balanceOf[msg.sender] >= _value, "Insufficient OMNI Balance");
            balanceOf[msg.sender] -= _value;
            balanceOf[_to] += _value;
            emit Transfer(msg.sender, _to, _value);
            return true;
        }
    }
    """

    compiled_sol = compile_standard(
        {
            "language": "Solidity",
            "sources": {"OmniToken.sol": {"content": contract_source_code}},
            "settings": {
                "outputSelection": {
                    "*": {"*": ["abi", "metadata", "evm.bytecode", "evm.sourceMap"]}
                }
            },
        },
        solc_version="0.8.0",
    )

    # Extract JSON mappings
    bytecode = compiled_sol["contracts"]["OmniToken.sol"]["OmniGlobalToken"]["evm"]["bytecode"]["object"]
    abi = compiled_sol["contracts"]["OmniToken.sol"]["OmniGlobalToken"]["abi"]

    print("Step 4: Assembling Mainnet Blockchain Transaction...")
    OmniContract = w3.eth.contract(abi=abi, bytecode=bytecode)
    nonce = w3.eth.get_transaction_count(TARGET_WALLET)

    # Build physical deployment transaction
    tx = OmniContract.constructor().build_transaction({
        "chainId": 1, # Mainnet ID (Change to 56 for Binance Smart Chain, or 8453 for Base)
        "gasPrice": w3.eth.gas_price,
        "from": TARGET_WALLET,
        "nonce": nonce,
    })

    print("Step 5: Cryptographically Signing Minting Payload...")
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)

    print("Step 6: Executing Physical Mainnet Deployment (Paying Gas)...")
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    
    print(f"\n[OK] Transaction Broadcasted! Hash: {w3.to_hex(tx_hash)}")
    print("Waiting for network confirmation blocks (This may take 30-60 seconds)...")
    
    # Wait for the node to confirm it hit the block
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    print("\n=============================================")
    print("          OMNI TOKEN SUCCESSFULLY DEPLOYED   ")
    print("=============================================")
    print(f"Contract Address: {tx_receipt.contractAddress}")
    print(f"Total Minted: 10,000,000,000 OMNI")
    print(f"Holder Access: {TARGET_WALLET} now holds 100% of global supply.")
    print("=============================================")

if __name__ == "__main__":
    deploy_omni_token()
