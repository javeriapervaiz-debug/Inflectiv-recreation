import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("=".repeat(60));
  console.log("INFLECTIV CONTRACT DEPLOYMENT");
  console.log("=".repeat(60));
  console.log(`Network: ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH/MATIC`);
  console.log("=".repeat(60));

  // Get fee recipient from env or use deployer
  const feeRecipient = process.env.PLATFORM_FEE_RECIPIENT || deployer.address;
  console.log(`Platform fee recipient: ${feeRecipient}`);

  // 1. Deploy AccessTokenFactory
  console.log("\n[1/3] Deploying AccessTokenFactory...");
  const AccessTokenFactory = await ethers.getContractFactory("AccessTokenFactory");
  const accessTokenFactory = await AccessTokenFactory.deploy();
  await accessTokenFactory.waitForDeployment();
  const factoryAddress = await accessTokenFactory.getAddress();
  console.log(`✓ AccessTokenFactory deployed to: ${factoryAddress}`);

  // 2. Deploy DataNFT
  console.log("\n[2/3] Deploying DataNFT...");
  const DataNFT = await ethers.getContractFactory("DataNFT");
  const dataNFT = await DataNFT.deploy(factoryAddress);
  await dataNFT.waitForDeployment();
  const dataNFTAddress = await dataNFT.getAddress();
  console.log(`✓ DataNFT deployed to: ${dataNFTAddress}`);

  // 3. Authorize DataNFT to use the factory
  console.log("\n[*] Authorizing DataNFT as factory deployer...");
  const authTx = await accessTokenFactory.setDeployerAuthorization(dataNFTAddress, true);
  await authTx.wait();
  console.log(`✓ DataNFT authorized`);

  // 4. Deploy Marketplace
  console.log("\n[3/3] Deploying Marketplace...");
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(dataNFTAddress, feeRecipient);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log(`✓ Marketplace deployed to: ${marketplaceAddress}`);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log(`
Contract Addresses:
-------------------
AccessTokenFactory: ${factoryAddress}
DataNFT:            ${dataNFTAddress}
Marketplace:        ${marketplaceAddress}

Configuration:
--------------
Platform Fee:       2.5% (250 bps)
Fee Recipient:      ${feeRecipient}
Default Royalty:    5% (500 bps)

Next Steps:
-----------
1. Verify contracts on Polygonscan:
   npx hardhat verify --network ${network.name} ${factoryAddress}
   npx hardhat verify --network ${network.name} ${dataNFTAddress} "${factoryAddress}"
   npx hardhat verify --network ${network.name} ${marketplaceAddress} "${dataNFTAddress}" "${feeRecipient}"

2. Update your .env.local with these addresses:
   NEXT_PUBLIC_ACCESS_TOKEN_FACTORY=${factoryAddress}
   NEXT_PUBLIC_DATA_NFT_ADDRESS=${dataNFTAddress}
   NEXT_PUBLIC_MARKETPLACE_ADDRESS=${marketplaceAddress}
   NEXT_PUBLIC_CHAIN_ID=${network.config.chainId}
`);

  // Write deployment info to file
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      accessTokenFactory: factoryAddress,
      dataNFT: dataNFTAddress,
      marketplace: marketplaceAddress,
    },
    config: {
      platformFeeBps: 250,
      feeRecipient,
      defaultRoyaltyBps: 500,
    },
  };

  const fs = await import("fs");
  const deploymentPath = `./deployments/${network.name}-${Date.now()}.json`;

  // Create deployments directory if it doesn't exist
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments");
  }

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to: ${deploymentPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
