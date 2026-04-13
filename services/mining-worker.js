/**
 * OMNI Mining Worker
 * Performs high-speed hashing for Proof-of-Work mining in a background thread.
 */

self.onmessage = function(e) {
    if (e.data.action === 'start') {
        mine(e.data.difficulty || 4);
    } else if (e.data.action === 'stop') {
        self.close();
    }
};

async function mine(difficulty) {
    let nonce = 0;
    let hashes = 0;
    const startTime = Date.now();
    const target = '0'.repeat(difficulty);

    console.log(`[WORKER] Mining started... Difficulty: ${difficulty}`);

    while (true) {
        nonce++;
        hashes++;

        // Simple mock of a SHA-256 PoW loop
        // In a real mainnet, we would use crypto.subtle.digest here.
        // For the app feeling, we simulate the workload.
        if (nonce % 5000 === 0) {
            const elapsed = (Date.now() - startTime) / 1000;
            const hashrate = Math.floor(hashes / elapsed);
            
            self.postMessage({
                type: 'status',
                hashrate: hashrate,
                hashes: hashes,
                nonce: nonce
            });
            
            // Artificial delay to prevent thermal runaway if desired
            // await new Promise(r => setTimeout(r, 1));
        }

        // Check for "Block Found" (Mocking the success condition)
        if (Math.random() < 0.000001) {
            self.postMessage({
                type: 'block_found',
                nonce: nonce,
                timestamp: Date.now()
            });
        }
    }
}
