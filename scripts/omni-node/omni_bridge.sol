// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title OmniBridgeProtocol
 * @dev The official mapping protocol linking the sovereign zero-gas Omni Layer-1 blockchain 
 * to external EVM Mainnets (Ethereum, BSC, Base).
 */
contract OmniBridgeProtocol {
    
    // Address of the centralized/decentralized relayer node bridging states
    address public bridgeMaster;
    
    // Ledger tracking how much Native Omni has been locked in the vault before minting onto Ethereum
    mapping(address => uint256) public nativeLockedBalance;
    
    // Ledger tracking how much external ERC-20 has been burned and unlocked back to Native Omni
    mapping(bytes32 => bool) public processedForeignBurns;

    event NativeLocked(address indexed user, string destinationChain, string destinationAddress, uint256 amount);
    event ForeignBurnMinted(address indexed user, uint256 amount, bytes32 foreignTxHash);

    constructor() {
        bridgeMaster = msg.sender;
    }

    modifier onlyMaster() {
        require(msg.sender == bridgeMaster, "OmniBridge: Unauthorized Node");
        _;
    }

    /**
     * @dev Step 1: User sends Native Omni to the Bridge on the Omni L1 Chain to cross over to Ethereum.
     * Since Native Omni is the gas token in our network, they send it via `msg.value`.
     */
    function lockNativeForEVM(string memory _destinationChain, string memory _destinationAddress) public payable {
        require(msg.value > 0, "OmniBridge: Must lock physical tokens");
        
        nativeLockedBalance[msg.sender] += msg.value;
        
        // Emits an event that the off-chain relayer nodes pick up to physically mint ERC-20 Omni on Ethereum
        emit NativeLocked(msg.sender, _destinationChain, _destinationAddress, msg.value);
    }

    /**
     * @dev Step 2: The relayer picks up that the user burned/locked their ERC-20 Omni back on Ethereum,
     * and releases the native Omni back to their wallet on this chain.
     */
    function processForeignBridgeAction(address payable _user, uint256 _amount, bytes32 _foreignTxHash) public onlyMaster {
        require(!processedForeignBurns[_foreignTxHash], "OmniBridge: Tx already processed");
        
        processedForeignBurns[_foreignTxHash] = true;
        
        // Release physical Native Gas Token from the bridge vault back to the user
        (bool success, ) = _user.call{value: _amount}("");
        require(success, "OmniBridge: Vault extraction failed");
        
        emit ForeignBurnMinted(_user, _amount, _foreignTxHash);
    }

    // Fallback allowing the DAO to inject liquidity to the bridge
    receive() external payable {}
}
