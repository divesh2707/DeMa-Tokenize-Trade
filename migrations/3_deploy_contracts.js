const NftMarketplace = artifacts.require("NftMarketplace");
const NftTracking = artifacts.require("NftTracking");

module.exports = async function (deployer, network, accounts) {
    const owner = accounts[0];

    // Step 1: Deploy the marketplace
    await deployer.deploy(NftMarketplace, { from: owner });
    const marketplaceInstance = await NftMarketplace.deployed();
    console.log("Marketplace deployed at:", marketplaceInstance.address);

    // Step 2: Deploy the tracking contract with the marketplace address
    await deployer.deploy(NftTracking, marketplaceInstance.address, { from: owner });
    const trackingInstance = await NftTracking.deployed();
    console.log("Tracking contract deployed at:", trackingInstance.address);

    // Step 3: Call setTrackingContract() on the marketplace
    await marketplaceInstance.setNftTrackerAddress(trackingInstance.address, { from: owner });
    console.log("Tracking contract address set in Marketplace.");
};
