import web3 from "./web3";
import NftMint from "../contracts/NftMint.json";
import NftMarketplace from "../contracts/NftMarketplace.json";
import NftTracking from "../contracts/NftTracking.json";

const getContract = (abi, address) => new web3.eth.Contract(abi, address);

// Load contracts with deployed addresses
const NftMintContract = getContract(NftMint.abi, NftMint.networks[11155111].address);
const MarketplaceContract = getContract(NftMarketplace.abi, NftMarketplace.networks[11155111].address);
const TrackingContract = getContract(NftTracking.abi, NftTracking.networks[11155111].address);

export { NftMintContract, MarketplaceContract, TrackingContract };
