const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config(); // for loading PRIVATE_KEY & ALCHEMY_KEY

module.exports = {
  networks: {
    sepolia: {
      provider: () =>
        new HDWalletProvider(
          process.env.PRIVATE_KEY,
          `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
        ),
      network_id: 11155111,
      gas: 5500000,        // Gas limit
      confirmations: 2,    // Wait 2 blocks for confirmation
      timeoutBlocks: 200,  // Timeout after 200 blocks
      skipDryRun: true     // Skip dry run before migrations
    }
  },

  compilers: {
    solc: {
      version: "^0.8.1",
    }
  }
};
