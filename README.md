Built a full-stack Web3 marketplace that allows users to mint, buy, and sell NFTs representing both digital and physical assets.
Key features include:

NFT Minting for All Digital Formats: Supports minting NFTs for any type of digital content — images, videos, audio, music, code, 3D files, animations, and more.

Physical Asset Integration: Enables listing and trading of physical assets, backed by a custom escrow-based tracking system to ensure secure delivery and buyer protection.

Decentralized Architecture:

IPFS used for decentralized storage of NFT metadata and files.

Backend (Node.js + Express) handles interaction with Pinata IPFS node and stores off-chain data (e.g., buyer address, tracking info) using PostgreSQL.

Smart Contract Development: Written in Solidity, deployed on the Ethereum Sepolia testnet, enabling core marketplace functionalities like minting, sales, escrow logic, delivery confirmations, and refunds.

Frontend: Developed with React, using Web3.js for smart contract interaction and wallet connectivity.

This project showcases advanced integration of blockchain, decentralized storage, and real-world asset tracking — bridging the gap between digital ownership and physical fulfillment.
