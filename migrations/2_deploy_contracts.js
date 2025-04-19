const NftMint = artifacts.require("NftMint");
const NftMarketplace = artifacts.require("NftMarketplace");
const NftTracking = artifacts.require("NftTracking");

module.exports = async function (deployer) {
  await deployer.deploy(NftMint); // Deploy NftMint first
  const nftMintInstance = await NftMint.deployed();
  
  await deployer.deploy(NftMarketplace); // Then deploy NftMarketplace
  const marketplaceInstance = await NftMarketplace.deployed();
  
  await deployer.deploy(NftTracking); // Finally, deploy NftTracking
  const trackingInstance = await NftTracking.deployed();
};
