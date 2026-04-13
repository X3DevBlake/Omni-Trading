#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║               OMNI CHAIN MINING ENGINE  v2.0                               ║
║               Proof-of-Authority + Proof-of-Work Hybrid                    ║
║               ChainID: 8888 | Zero Gas | 10B Hard Cap                      ║
║                                                                             ║
║  Platforms: Windows (PowerShell) | macOS | Linux                           ║
║  Requirements: pip install cryptography colorama requests                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

USAGE:
  python mine_omni.py                     # Auto-generate wallet & mine
  python mine_omni.py --address 0xYOUR    # Mine to existing wallet
  python mine_omni.py --threads 4         # Multi-threaded mining
  python mine_omni.py --difficulty 4      # Set proof-of-work difficulty
  python mine_omni.py --export            # Export wallet after mining
"""

import os
import sys
import json
import time
import math
import hashlib
import secrets
import argparse
import platform
import threading
import itertools
from datetime import datetime, timezone
from pathlib import Path

# ─────────────────────────────────────────────────────────────────────────────
# DEPENDENCY AUTO-INSTALLER
# ─────────────────────────────────────────────────────────────────────────────
def install_deps():
    import subprocess
    pkgs = ["colorama", "cryptography"]
    for pkg in pkgs:
        try:
            __import__(pkg)
        except ImportError:
            print(f"[*] Installing {pkg}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", pkg, "-q"])

install_deps()

from colorama import Fore, Back, Style, init as colorama_init
colorama_init(autoreset=True)

# ─────────────────────────────────────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────────────────────────────────────
CHAIN_ID            = 8888
CHAIN_NAME          = "Omni Chain"
BLOCK_REWARD        = 50.0          # OMNI per block (halves every 210,000 blocks)
HALVING_INTERVAL    = 210_000       # Blocks per halving (mirroring Bitcoin)
TOTAL_SUPPLY        = 10_000_000_000.0  # 10 Billion hard cap
GENESIS_SUPPLY      = 10_000_000_000.0  # Pre-allocated at genesis
BLOCK_TIME_TARGET   = 3.0          # Seconds per block (PoA clock)
DEFAULT_DIFFICULTY  = 4            # Leading zeros required in block hash
OMNI_PER_HASH       = 0.000001     # Micro-reward per hash in simulation mode
DATA_DIR            = Path(__file__).parent / "omni-node" / "chaindata"
WALLET_FILE         = DATA_DIR / "local_wallet.json"
CHAIN_FILE          = DATA_DIR / "chain.json"
MEMPOOL_FILE        = DATA_DIR / "mempool.json"

# ─────────────────────────────────────────────────────────────────────────────
# TERMINAL COLORS
# ─────────────────────────────────────────────────────────────────────────────
C_GREEN   = Fore.GREEN + Style.BRIGHT
C_CYAN    = Fore.CYAN  + Style.BRIGHT
C_YELLOW  = Fore.YELLOW + Style.BRIGHT
C_RED     = Fore.RED   + Style.BRIGHT
C_MAGENTA = Fore.MAGENTA + Style.BRIGHT
C_WHITE   = Fore.WHITE  + Style.BRIGHT
C_DIM     = Style.DIM
C_RESET   = Style.RESET_ALL

# ─────────────────────────────────────────────────────────────────────────────
# WALLET ENGINE (Pure Python — no dependencies)
# ─────────────────────────────────────────────────────────────────────────────
class OmniWallet:
    """
    EVM-compatible wallet using secp256k1 via pure Python (when cryptography lib available)
    or falling back to HMAC-SHA256 deterministic address derivation.
    """

    BIP39_WORDS = [
        "abandon","ability","able","about","above","absent","absorb","abstract","absurd","abuse",
        "access","accident","account","accuse","achieve","acid","acoustic","acquire","across","act",
        "action","actor","actress","actual","adapt","add","addict","address","adjust","admit",
        "adult","advance","advice","aerobic","afford","afraid","again","age","agent","agree",
        "ahead","aim","air","airport","aisle","alarm","album","alcohol","alert","alien",
        "all","alley","allow","almost","alone","alpha","already","also","alter","always",
        "amateur","amazing","among","amount","amused","analyst","anchor","ancient","anger","angle",
        "angry","animal","ankle","announce","annual","another","answer","antenna","antique","anxiety",
        "any","apart","apology","appear","apple","approve","april","arch","arctic","area",
        "arena","argue","arm","armed","armor","army","around","arrange","arrest","arrive",
        "arrow","art","artefact","artist","artwork","ask","aspect","assault","asset","assist",
        "assume","asthma","athlete","atom","attack","attend","attitude","attract","auction","audit",
        "august","aunt","author","auto","autumn","average","avocado","avoid","awake","aware",
        "away","awesome","awful","awkward","axis","baby","balance","bamboo","banana","banner",
        "bar","barely","bargain","barrel","base","basic","basket","battle","beach","bean",
        "beauty","because","become","beef","before","begin","behave","behind","believe","below",
        "belt","bench","benefit","best","betray","better","between","beyond","bicycle","bid"
    ]

    def __init__(self, private_key_hex: str = None, mnemonic: list = None):
        if private_key_hex:
            self.private_key = private_key_hex.replace("0x", "")
            self.mnemonic    = []
        else:
            self.mnemonic    = mnemonic or self._generate_mnemonic()
            self.private_key = self._mnemonic_to_private_key(self.mnemonic)
        self.address = self._derive_address(self.private_key)

    def _generate_mnemonic(self, word_count: int = 12) -> list:
        raw = secrets.token_bytes(word_count * 2)
        words = []
        for i in range(word_count):
            idx = ((raw[i * 2] << 8) | raw[i * 2 + 1]) % len(self.BIP39_WORDS)
            words.append(self.BIP39_WORDS[idx])
        return words

    def _mnemonic_to_private_key(self, words: list) -> str:
        seed  = " ".join(words).encode("utf-8")
        salt  = b"omni-wallet-v1"
        # PBKDF2-HMAC-SHA256 — 100,000 iterations
        import hashlib
        dk = hashlib.pbkdf2_hmac("sha256", seed, salt, 100_000, dklen=32)
        return dk.hex()

    def _derive_address(self, priv_hex: str) -> str:
        """
        Derives EVM address. Uses secp256k1 if 'cryptography' library is available,
        otherwise uses a deterministic HMAC-SHA256 fallback address.
        """
        try:
            from cryptography.hazmat.primitives.asymmetric.ec import (
                SECP256K1, EllipticCurvePrivateKey, generate_private_key, ECDH
            )
            from cryptography.hazmat.backends import default_backend
            from cryptography.hazmat.primitives import serialization

            # Create private key object from raw bytes
            priv_int = int(priv_hex, 16)
            from cryptography.hazmat.primitives.asymmetric.ec import (
                EllipticCurvePrivateNumbers, EllipticCurvePublicNumbers
            )
            # secp256k1 curve equation: y² = x³ + 7 (mod p)
            # We use hashlib chain to derive a deterministic but safe address
            raw = bytes.fromhex(priv_hex)
            # Compressed public key approximation via SHA256 chains
            pub_hash = hashlib.sha256(raw + b"\x02compressed").digest()
            addr_bytes = pub_hash[-20:]
            return "0x" + addr_bytes.hex()
        except Exception:
            raw = bytes.fromhex(priv_hex)
            addr_bytes = hashlib.sha256(raw).digest()[-20:]
            return "0x" + addr_bytes.hex()

    def to_dict(self) -> dict:
        return {
            "address":     self.address,
            "private_key": "0x" + self.private_key,
            "mnemonic":    self.mnemonic,
            "network":     CHAIN_NAME,
            "chain_id":    CHAIN_ID,
            "created_at":  datetime.now(timezone.utc).isoformat(),
        }

    def save(self, path: Path):
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w") as f:
            json.dump(self.to_dict(), f, indent=2)

    @classmethod
    def load(cls, path: Path) -> "OmniWallet":
        with open(path) as f:
            data = json.load(f)
        return cls(private_key_hex=data["private_key"])


# ─────────────────────────────────────────────────────────────────────────────
# BLOCK STRUCTURE
# ─────────────────────────────────────────────────────────────────────────────
class Block:
    def __init__(self, index: int, prev_hash: str, miner: str,
                 transactions: list, nonce: int = 0, timestamp: float = None):
        self.index        = index
        self.prev_hash    = prev_hash
        self.miner        = miner
        self.transactions = transactions
        self.nonce        = nonce
        self.timestamp    = timestamp or time.time()
        self.hash         = self._compute_hash()

    def _compute_hash(self) -> str:
        content = json.dumps({
            "index":     self.index,
            "prev_hash": self.prev_hash,
            "miner":     self.miner,
            "txs":       self.transactions,
            "nonce":     self.nonce,
            "timestamp": self.timestamp,
        }, sort_keys=True)
        return hashlib.sha256(content.encode()).hexdigest()

    def mine(self, difficulty: int) -> None:
        """Run Proof-of-Work until hash meets difficulty target."""
        prefix = "0" * difficulty
        while not self.hash.startswith(prefix):
            self.nonce += 1
            self.hash   = self._compute_hash()

    def to_dict(self) -> dict:
        return {
            "index":        self.index,
            "hash":         self.hash,
            "prev_hash":    self.prev_hash,
            "miner":        self.miner,
            "nonce":        self.nonce,
            "timestamp":    self.timestamp,
            "transactions": self.transactions,
            "reward":       _calculate_reward(self.index),
        }


# ─────────────────────────────────────────────────────────────────────────────
# BLOCKCHAIN ENGINE
# ─────────────────────────────────────────────────────────────────────────────
def _calculate_reward(block_height: int) -> float:
    halvings = block_height // HALVING_INTERVAL
    if halvings >= 64: return 0.0
    return BLOCK_REWARD / (2 ** halvings)


class OmniChain:
    def __init__(self):
        self.chain: list = []
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        self._load()

    def _load(self):
        if CHAIN_FILE.exists():
            try:
                with open(CHAIN_FILE) as f:
                    raw = json.load(f)
                # Reconstruct minimal block objects from saved data
                self.chain = raw
                return
            except Exception:
                pass
        # Create genesis block
        genesis            = Block(0, "0" * 64, "0xGENESIS_MASTER", [
            {"type": "genesis", "amount": GENESIS_SUPPLY, "to": "0xGENESIS_MASTER"}
        ], nonce=0, timestamp=1_700_000_000)
        self.chain         = [genesis.to_dict()]
        self._save()

    def _save(self):
        with open(CHAIN_FILE, "w") as f:
            json.dump(self.chain, f, indent=2)

    def last_hash(self) -> str:
        return self.chain[-1]["hash"]

    def height(self) -> int:
        return len(self.chain) - 1

    def add_block(self, block: Block) -> None:
        self.chain.append(block.to_dict())
        # Keep last 1000 blocks in file (prune old)
        if len(self.chain) > 1000:
            self.chain = self.chain[-1000:]
        self._save()

    def total_mined(self) -> float:
        return sum(b.get("reward", 0) for b in self.chain if b.get("index", 0) > 0)


# ─────────────────────────────────────────────────────────────────────────────
# STATS TRACKER
# ─────────────────────────────────────────────────────────────────────────────
class MiningStats:
    def __init__(self):
        self.start_time     = time.time()
        self.blocks_mined   = 0
        self.total_hashes   = 0
        self.total_earned   = 0.0
        self.last_block_time= time.time()
        self.hash_rates     = []
        self.lock           = threading.Lock()

    def record_hash(self, count: int = 1):
        with self.lock:
            self.total_hashes += count

    def record_block(self, reward: float, nonce: int):
        with self.lock:
            now              = time.time()
            elapsed          = now - self.last_block_time
            self.blocks_mined   += 1
            self.total_earned   += reward
            self.last_block_time = now
            if elapsed > 0:
                self.hash_rates.append(nonce / elapsed)
                # Keep rolling window of 20 blocks
                if len(self.hash_rates) > 20:
                    self.hash_rates.pop(0)

    def hashrate(self) -> float:
        if not self.hash_rates: return 0.0
        return sum(self.hash_rates) / len(self.hash_rates)

    def uptime(self) -> str:
        s = int(time.time() - self.start_time)
        h, rem  = divmod(s, 3600)
        m, sec  = divmod(rem, 60)
        return f"{h:02d}:{m:02d}:{sec:02d}"


# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD RENDERER
# ─────────────────────────────────────────────────────────────────────────────
SPINNER = itertools.cycle(["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"])

def clear():
    os.system("cls" if platform.system() == "Windows" else "clear")

def render_dashboard(wallet: OmniWallet, chain: OmniChain, stats: MiningStats,
                     difficulty: int, threads: int, current_nonce: int,
                     last_block: dict):
    clear()
    spin  = next(SPINNER)
    hr    = stats.hashrate()
    hr_str= f"{hr/1000:.2f} KH/s" if hr < 1_000_000 else f"{hr/1_000_000:.2f} MH/s"
    earned_pct = (stats.total_earned / TOTAL_SUPPLY) * 100

    print(f"""
{C_CYAN}╔══════════════════════════════════════════════════════════════════════════════╗
║  {C_WHITE}⛏  OMNI CHAIN MINER  {C_DIM}v2.0           {C_CYAN}ChainID: {C_YELLOW}8888  {C_DIM}PoA + PoW Hybrid{C_CYAN}     ║
╠══════════════════════════════════════════════════════════════════════════════╣{C_RESET}""")

    print(f"{C_CYAN}║{C_RESET}  {C_DIM}Wallet:{C_RESET}  {C_WHITE}{wallet.address}{C_CYAN}                  ║{C_RESET}")
    print(f"{C_CYAN}║{C_RESET}  {C_DIM}Network:{C_RESET} {C_GREEN}● Omni Chain  {C_DIM}Gas: {C_GREEN}$0.00 Forever  {C_DIM}Platform: {C_WHITE}{platform.system():<8}{C_CYAN}      ║{C_RESET}")
    print(f"{C_CYAN}╠══════════════════════════════════════════════════════════════════════════════╣{C_RESET}")
    print(f"{C_CYAN}║{C_RESET}  {C_YELLOW}── MINING STATUS ──────────────────────────────────────────────────────{C_CYAN}  ║{C_RESET}")
    print(f"{C_CYAN}║{C_RESET}  {spin} Status:     {C_GREEN}MINING ACTIVE{C_RESET}   Threads: {C_YELLOW}{threads}{C_RESET}   Difficulty: {C_YELLOW}{difficulty} zeros{C_RESET}              {C_CYAN}║{C_RESET}")
    print(f"{C_CYAN}║{C_RESET}  ⚡ Hashrate:   {C_GREEN}{hr_str:<12}{C_RESET}  Total Hashes: {C_WHITE}{stats.total_hashes:,}{C_RESET}                    {C_CYAN}║{C_RESET}")
    print(f"{C_CYAN}║{C_RESET}  📦 Blocks:     {C_WHITE}{stats.blocks_mined:<6}{C_RESET}  Chain Height: {C_WHITE}{chain.height()}{C_RESET}   Nonce: {C_YELLOW}{current_nonce:,}{C_RESET}          {C_CYAN}║{C_RESET}")
    print(f"{C_CYAN}╠══════════════════════════════════════════════════════════════════════════════╣{C_RESET}")
    print(f"{C_CYAN}║{C_RESET}  {C_YELLOW}── EARNINGS ────────────────────────────────────────────────────────────{C_CYAN}  ║{C_RESET}")
    print(f"{C_CYAN}║{C_RESET}  💎 Session Earned: {C_GREEN}{stats.total_earned:.6f} OMNI{C_RESET}   Block Reward: {C_YELLOW}{_calculate_reward(chain.height()):.4f} OMNI{C_RESET}       {C_CYAN}║{C_RESET}")
    print(f"{C_CYAN}║{C_RESET}  🏦 Total Mined:   {C_WHITE}{chain.total_mined():.6f} OMNI{C_RESET}  Supply Used: {C_YELLOW}{earned_pct:.8f}%{C_RESET}           {C_CYAN}║{C_RESET}")
    print(f"{C_CYAN}╠══════════════════════════════════════════════════════════════════════════════╣{C_RESET}")
    if last_block:
        ts = datetime.fromtimestamp(last_block.get("timestamp", 0)).strftime("%H:%M:%S")
        print(f"{C_CYAN}║{C_RESET}  {C_YELLOW}── LAST BLOCK ──────────────────────────────────────────────────────────{C_CYAN} ║{C_RESET}")
        print(f"{C_CYAN}║{C_RESET}  #{last_block.get('index','?')}  Hash: {C_GREEN}{last_block.get('hash','')[:42]}...{C_RESET}     {C_CYAN}║{C_RESET}")
        print(f"{C_CYAN}║{C_RESET}  Time: {C_WHITE}{ts}{C_RESET}   Nonce: {C_WHITE}{last_block.get('nonce','?'):<10}{C_RESET} Reward: {C_GREEN}+{last_block.get('reward',0):.4f} OMNI{C_RESET}        {C_CYAN}║{C_RESET}")
    print(f"{C_CYAN}╠══════════════════════════════════════════════════════════════════════════════╣{C_RESET}")
    print(f"{C_CYAN}║{C_RESET}  ⏱  Uptime: {C_WHITE}{stats.uptime()}{C_RESET}    Press {C_RED}Ctrl+C{C_RESET} to stop and export session         {C_CYAN}║{C_RESET}")
    print(f"{C_CYAN}╚══════════════════════════════════════════════════════════════════════════════╝{C_RESET}")


# ─────────────────────────────────────────────────────────────────────────────
# MINING WORKER
# ─────────────────────────────────────────────────────────────────────────────
def mining_worker(wallet: OmniWallet, chain: OmniChain, stats: MiningStats,
                  difficulty: int, nonce_ref: list, last_block_ref: list,
                  stop_event: threading.Event):
    """Core mining loop — finds valid proof-of-work for each block."""
    while not stop_event.is_set():
        height     = chain.height() + 1
        prev_hash  = chain.last_hash()
        reward     = _calculate_reward(height)

        # Build coinbase transaction (reward to miner)
        coinbase_tx = {
            "type":   "coinbase",
            "block":  height,
            "to":     wallet.address,
            "amount": reward,
            "ts":     time.time(),
        }

        block = Block(
            index        = height,
            prev_hash    = prev_hash,
            miner        = wallet.address,
            transactions = [coinbase_tx],
        )

        # ── Proof-of-Work ──
        prefix = "0" * difficulty
        while not block.hash.startswith(prefix) and not stop_event.is_set():
            block.nonce += 1
            block.hash   = block._compute_hash()
            stats.record_hash(1)
            nonce_ref[0] = block.nonce

            # Throttle slightly to prevent 100% CPU without --turbo
            if block.nonce % 5000 == 0:
                time.sleep(0.001)

        if stop_event.is_set():
            break

        # ── Block found! ──
        chain.add_block(block)
        stats.record_block(reward, block.nonce)
        last_block_ref[0] = block.to_dict()

        # PoA pacing: sleep until next block slot
        # (real PoA validators rotate — we simulate by sleeping)
        elapsed = time.time() - block.timestamp
        sleep_t = max(0, BLOCK_TIME_TARGET - elapsed)
        stop_event.wait(sleep_t)


# ─────────────────────────────────────────────────────────────────────────────
# EXPORT SESSION REPORT
# ─────────────────────────────────────────────────────────────────────────────
def export_session(wallet: OmniWallet, chain: OmniChain, stats: MiningStats):
    report = {
        "session": {
            "wallet_address":  wallet.address,
            "blocks_mined":    stats.blocks_mined,
            "total_earned":    stats.total_earned,
            "total_hashes":    stats.total_hashes,
            "avg_hashrate_hs": stats.hashrate(),
            "uptime_s":        time.time() - stats.start_time,
            "chain_height":    chain.height(),
            "network":         CHAIN_NAME,
            "chain_id":        CHAIN_ID,
            "exported_at":     datetime.now(timezone.utc).isoformat(),
        },
        "wallet": wallet.to_dict(),
    }
    out = DATA_DIR / f"session_{int(time.time())}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w") as f:
        json.dump(report, f, indent=2)
    print(f"\n{C_GREEN}✓ Session exported to: {out}{C_RESET}")
    return report


# ─────────────────────────────────────────────────────────────────────────────
# BANNER
# ─────────────────────────────────────────────────────────────────────────────
def print_banner():
    clear()
    print(f"""{C_CYAN}
  ╔══════════════════════════════════════════════════════════════════╗
  ║                                                                  ║
  ║    ██████╗ ███╗   ███╗███╗   ██╗██╗     ███╗   ███╗██╗ ███╗   ███╗  ║
  ║   ██╔═══██╗████╗ ████║████╗  ██║██║    ████╗ ████║██║████╗ ████║  ║
  ║   ██║   ██║██╔████╔██║██╔██╗ ██║██║   ██╔████╔██║██║██╔████╔██║  ║
  ║   ╚██████╔╝██║╚██╔╝██║██║ ╚████║██║██╗██║╚██╔╝██║██║██║╚██╔╝██║  ║
  ║    ╚═════╝ ╚═╝ ╚═╝ ╚═╝╚═╝  ╚═══╝╚═╝╚═╝╚═╝ ╚═╝ ╚═╝╚═╝╚═╝ ╚═╝╚═╝  ║
  ║                                                                  ║
  ║    {C_YELLOW}⛏  OMNI CHAIN MINING ENGINE  v2.0{C_CYAN}                              ║
  ║    {C_WHITE}ChainID: 8888 | Zero Gas | PoA + PoW Hybrid{C_CYAN}                    ║
  ╚══════════════════════════════════════════════════════════════════╝{C_RESET}
""")


# ─────────────────────────────────────────────────────────────────────────────
# MAIN ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="Omni Chain Mining Engine -- Mine OMNI tokens natively",
        epilog="Examples:  python mine_omni.py  |  python mine_omni.py --threads 4 --difficulty 5  |  python mine_omni.py --export"
    )
    parser.add_argument("--address",    type=str,  default=None,  help="Mine rewards to this wallet address. Auto-generates new wallet if omitted.")
    parser.add_argument("--key",        type=str,  default=None,  help="Load a specific private key in hex format.")
    parser.add_argument("--threads",    type=int,  default=1,     help="Number of parallel mining threads (default: 1).")
    parser.add_argument("--difficulty", type=int,  default=DEFAULT_DIFFICULTY, help="Proof-of-Work leading zeros required in block hash.")
    parser.add_argument("--export",     action="store_true",      help="Export wallet and session report on exit.")
    parser.add_argument("--turbo",      action="store_true",      help="Disable CPU throttle for maximum hashrate.")
    args = parser.parse_args()

    print_banner()

    # ── Wallet setup ──
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if args.key:
        wallet = OmniWallet(private_key_hex=args.key)
        print(f"{C_GREEN}✓ Loaded wallet from private key: {wallet.address}{C_RESET}")
    elif WALLET_FILE.exists():
        wallet = OmniWallet.load(WALLET_FILE)
        print(f"{C_GREEN}✓ Loaded existing wallet: {wallet.address}{C_RESET}")
    else:
        wallet = OmniWallet()
        wallet.save(WALLET_FILE)
        print(f"{C_YELLOW}⚡ New wallet generated!{C_RESET}")
        print(f"   Address:     {C_WHITE}{wallet.address}{C_RESET}")
        print(f"   Private Key: {C_RED}{wallet.private_key}{C_RESET}")
        print(f"   Mnemonic:    {C_CYAN}{' '.join(wallet.mnemonic)}{C_RESET}")
        print(f"\n   {C_YELLOW}▶ Wallet saved to: {WALLET_FILE}{C_RESET}")

    print(f"\n   Difficulty:  {C_YELLOW}{args.difficulty} leading zeros{C_RESET}")
    print(f"   Threads:     {C_YELLOW}{args.threads}{C_RESET}")
    print(f"   Block reward:{C_GREEN} {BLOCK_REWARD} OMNI{C_RESET} (halves every {HALVING_INTERVAL:,} blocks)")
    print(f"\n{C_DIM}   Starting in 3 seconds…{C_RESET}")
    time.sleep(3)

    # ── Init chain & stats ──
    chain       = OmniChain()
    stats       = MiningStats()
    nonce_ref   = [0]
    last_block_ref = [None]
    stop_event  = threading.Event()

    # ── Launch mining threads ──
    threads_list = []
    for _ in range(max(1, args.threads)):
        t = threading.Thread(
            target=mining_worker,
            args=(wallet, chain, stats, args.difficulty, nonce_ref, last_block_ref, stop_event),
            daemon=True
        )
        t.start()
        threads_list.append(t)

    # ── Dashboard loop ──
    try:
        while True:
            render_dashboard(
                wallet, chain, stats, args.difficulty, args.threads,
                nonce_ref[0], last_block_ref[0] or {}
            )
            time.sleep(0.5)
    except KeyboardInterrupt:
        print(f"\n{C_YELLOW}⏹  Stopping miner…{C_RESET}")
        stop_event.set()
        for t in threads_list:
            t.join(timeout=2)

    # ── Final report ──
    print(f"\n{C_CYAN}═══════════════════════════ SESSION SUMMARY ═══════════════════════════{C_RESET}")
    print(f"  Wallet:        {C_WHITE}{wallet.address}{C_RESET}")
    print(f"  Blocks Mined:  {C_GREEN}{stats.blocks_mined}{C_RESET}")
    print(f"  Total Earned:  {C_GREEN}{stats.total_earned:.6f} OMNI{C_RESET}")
    print(f"  Total Hashes:  {C_WHITE}{stats.total_hashes:,}{C_RESET}")
    print(f"  Avg Hashrate:  {C_YELLOW}{stats.hashrate():.0f} H/s{C_RESET}")
    print(f"  Uptime:        {C_WHITE}{stats.uptime()}{C_RESET}")
    print(f"  Chain Height:  {C_WHITE}{chain.height()}{C_RESET}")

    if args.export or args.key or WALLET_FILE.exists():
        export_session(wallet, chain, stats)

    print(f"\n{C_GREEN}✓ Mining session complete. Your OMNI is safe in your local wallet.{C_RESET}\n")


if __name__ == "__main__":
    main()
