import { expect } from "chai";
import { ethers } from "hardhat";
import { DataNFT, AccessTokenFactory, AccessToken, Marketplace } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Inflectiv Contracts", function () {
  let accessTokenFactory: AccessTokenFactory;
  let dataNFT: DataNFT;
  let marketplace: Marketplace;
  let owner: SignerWithAddress;
  let creator: SignerWithAddress;
  let buyer: SignerWithAddress;
  let feeRecipient: SignerWithAddress;

  const ASSET_ID = "550e8400-e29b-41d4-a716-446655440000";
  const DATASET_NAME = "Financial Q4 Report";
  const CATEGORY = "Financial";
  const METADATA_URI = "ipfs://QmTestHash123456789";
  const INITIAL_SUPPLY = ethers.parseEther("100"); // 100 access tokens
  const LISTING_PRICE = ethers.parseEther("0.01"); // 0.01 MATIC per token

  beforeEach(async function () {
    [owner, creator, buyer, feeRecipient] = await ethers.getSigners();

    // Deploy AccessTokenFactory
    const AccessTokenFactoryContract = await ethers.getContractFactory("AccessTokenFactory");
    accessTokenFactory = await AccessTokenFactoryContract.deploy();
    await accessTokenFactory.waitForDeployment();

    // Deploy DataNFT
    const DataNFTContract = await ethers.getContractFactory("DataNFT");
    dataNFT = await DataNFTContract.deploy(await accessTokenFactory.getAddress());
    await dataNFT.waitForDeployment();

    // Authorize DataNFT as factory deployer
    await accessTokenFactory.setDeployerAuthorization(await dataNFT.getAddress(), true);

    // Deploy Marketplace
    const MarketplaceContract = await ethers.getContractFactory("Marketplace");
    marketplace = await MarketplaceContract.deploy(
      await dataNFT.getAddress(),
      feeRecipient.address
    );
    await marketplace.waitForDeployment();
  });

  describe("DataNFT", function () {
    it("Should mint a dataset with access tokens", async function () {
      const tx = await dataNFT.connect(creator).mintDataset(
        creator.address,
        ASSET_ID,
        DATASET_NAME,
        CATEGORY,
        METADATA_URI,
        INITIAL_SUPPLY
      );

      const receipt = await tx.wait();

      // Check NFT was minted
      expect(await dataNFT.ownerOf(1)).to.equal(creator.address);
      expect(await dataNFT.tokenURI(1)).to.equal(METADATA_URI);

      // Check dataset info
      const dataset = await dataNFT.getDataset(1);
      expect(dataset.assetId).to.equal(ASSET_ID);
      expect(dataset.name).to.equal(DATASET_NAME);
      expect(dataset.category).to.equal(CATEGORY);
      expect(dataset.creator).to.equal(creator.address);
      expect(dataset.isActive).to.be.true;

      // Check access token was deployed
      const accessTokenAddress = await dataNFT.accessTokens(1);
      expect(accessTokenAddress).to.not.equal(ethers.ZeroAddress);

      // Check creator has access tokens
      const AccessTokenContract = await ethers.getContractFactory("AccessToken");
      const accessToken = AccessTokenContract.attach(accessTokenAddress) as AccessToken;
      expect(await accessToken.balanceOf(creator.address)).to.equal(INITIAL_SUPPLY);
    });

    it("Should not allow duplicate asset IDs", async function () {
      await dataNFT.connect(creator).mintDataset(
        creator.address,
        ASSET_ID,
        DATASET_NAME,
        CATEGORY,
        METADATA_URI,
        INITIAL_SUPPLY
      );

      await expect(
        dataNFT.connect(creator).mintDataset(
          creator.address,
          ASSET_ID,
          "Another Dataset",
          CATEGORY,
          METADATA_URI,
          INITIAL_SUPPLY
        )
      ).to.be.revertedWithCustomError(dataNFT, "AssetAlreadyMinted");
    });

    it("Should allow owner to mint additional access tokens", async function () {
      await dataNFT.connect(creator).mintDataset(
        creator.address,
        ASSET_ID,
        DATASET_NAME,
        CATEGORY,
        METADATA_URI,
        INITIAL_SUPPLY
      );

      const additionalTokens = ethers.parseEther("50");
      await dataNFT.connect(creator).mintAccessTokens(1, buyer.address, additionalTokens);

      const accessTokenAddress = await dataNFT.accessTokens(1);
      const AccessTokenContract = await ethers.getContractFactory("AccessToken");
      const accessToken = AccessTokenContract.attach(accessTokenAddress) as AccessToken;

      expect(await accessToken.balanceOf(buyer.address)).to.equal(additionalTokens);
    });

    it("Should return correct royalty info", async function () {
      await dataNFT.connect(creator).mintDataset(
        creator.address,
        ASSET_ID,
        DATASET_NAME,
        CATEGORY,
        METADATA_URI,
        INITIAL_SUPPLY
      );

      const salePrice = ethers.parseEther("1");
      const [receiver, amount] = await dataNFT.royaltyInfo(1, salePrice);

      expect(receiver).to.equal(creator.address);
      // Default royalty is 5% (500 bps)
      expect(amount).to.equal(ethers.parseEther("0.05"));
    });

    it("Should check access correctly", async function () {
      await dataNFT.connect(creator).mintDataset(
        creator.address,
        ASSET_ID,
        DATASET_NAME,
        CATEGORY,
        METADATA_URI,
        INITIAL_SUPPLY
      );

      // Creator has access
      expect(await dataNFT.hasAccess(1, creator.address)).to.be.true;

      // Buyer doesn't have access
      expect(await dataNFT.hasAccess(1, buyer.address)).to.be.false;

      // Give buyer some tokens
      const accessTokenAddress = await dataNFT.accessTokens(1);
      const AccessTokenContract = await ethers.getContractFactory("AccessToken");
      const accessToken = AccessTokenContract.attach(accessTokenAddress) as AccessToken;

      await accessToken.connect(creator).transfer(buyer.address, ethers.parseEther("1"));

      // Now buyer has access
      expect(await dataNFT.hasAccess(1, buyer.address)).to.be.true;
    });
  });

  describe("Marketplace", function () {
    let accessToken: AccessToken;

    beforeEach(async function () {
      // Mint a dataset
      await dataNFT.connect(creator).mintDataset(
        creator.address,
        ASSET_ID,
        DATASET_NAME,
        CATEGORY,
        METADATA_URI,
        INITIAL_SUPPLY
      );

      // Get access token
      const accessTokenAddress = await dataNFT.accessTokens(1);
      const AccessTokenContract = await ethers.getContractFactory("AccessToken");
      accessToken = AccessTokenContract.attach(accessTokenAddress) as AccessToken;

      // Approve marketplace to transfer tokens
      await accessToken.connect(creator).approve(
        await marketplace.getAddress(),
        ethers.MaxUint256
      );
    });

    it("Should create a listing", async function () {
      const tokenAmount = 50; // List 50 access tokens

      await marketplace.connect(creator).createListing(1, LISTING_PRICE, tokenAmount);

      const listing = await marketplace.listings(1);
      expect(listing.seller).to.equal(creator.address);
      expect(listing.pricePerToken).to.equal(LISTING_PRICE);
      expect(listing.availableTokens).to.equal(tokenAmount);
      expect(listing.isActive).to.be.true;
    });

    it("Should allow purchase with correct payment distribution", async function () {
      const tokenAmount = 50;
      await marketplace.connect(creator).createListing(1, LISTING_PRICE, tokenAmount);

      const purchaseAmount = 10;
      const totalPrice = LISTING_PRICE * BigInt(purchaseAmount);

      // Get balances before
      const creatorBalanceBefore = await ethers.provider.getBalance(creator.address);
      const feeRecipientBalanceBefore = await ethers.provider.getBalance(feeRecipient.address);

      // Purchase
      await marketplace.connect(buyer).purchaseAccess(1, purchaseAmount, { value: totalPrice });

      // Check buyer has access tokens
      expect(await accessToken.balanceOf(buyer.address)).to.equal(
        ethers.parseEther(purchaseAmount.toString())
      );

      // Check listing updated
      const listing = await marketplace.listings(1);
      expect(listing.availableTokens).to.equal(tokenAmount - purchaseAmount);

      // Check payments (platform fee = 2.5%, royalty = 5%)
      const platformFee = (totalPrice * BigInt(250)) / BigInt(10000);
      const royalty = (totalPrice * BigInt(500)) / BigInt(10000);
      const sellerProceeds = totalPrice - platformFee - royalty;

      const creatorBalanceAfter = await ethers.provider.getBalance(creator.address);
      const feeRecipientBalanceAfter = await ethers.provider.getBalance(feeRecipient.address);

      // Creator gets seller proceeds + royalty (they're both creator and royalty receiver)
      expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(sellerProceeds + royalty);
      expect(feeRecipientBalanceAfter - feeRecipientBalanceBefore).to.equal(platformFee);
    });

    it("Should allow cancelling a listing", async function () {
      await marketplace.connect(creator).createListing(1, LISTING_PRICE, 50);

      await marketplace.connect(creator).cancelListing(1);

      const listing = await marketplace.listings(1);
      expect(listing.isActive).to.be.false;
    });

    it("Should calculate purchase correctly", async function () {
      await marketplace.connect(creator).createListing(1, LISTING_PRICE, 50);

      const purchaseInfo = await marketplace.calculatePurchase(1, 10);

      const expectedTotal = LISTING_PRICE * BigInt(10);
      const expectedPlatformFee = (expectedTotal * BigInt(250)) / BigInt(10000);
      const expectedRoyalty = (expectedTotal * BigInt(500)) / BigInt(10000);
      const expectedSellerProceeds = expectedTotal - expectedPlatformFee - expectedRoyalty;

      expect(purchaseInfo.totalPrice).to.equal(expectedTotal);
      expect(purchaseInfo.platformFee).to.equal(expectedPlatformFee);
      expect(purchaseInfo.royaltyAmount).to.equal(expectedRoyalty);
      expect(purchaseInfo.sellerProceeds).to.equal(expectedSellerProceeds);
    });
  });

  describe("AccessToken", function () {
    let accessToken: AccessToken;

    beforeEach(async function () {
      await dataNFT.connect(creator).mintDataset(
        creator.address,
        ASSET_ID,
        DATASET_NAME,
        CATEGORY,
        METADATA_URI,
        INITIAL_SUPPLY
      );

      const accessTokenAddress = await dataNFT.accessTokens(1);
      const AccessTokenContract = await ethers.getContractFactory("AccessToken");
      accessToken = AccessTokenContract.attach(accessTokenAddress) as AccessToken;
    });

    it("Should check access correctly", async function () {
      expect(await accessToken.hasAccess(creator.address)).to.be.true;
      expect(await accessToken.hasAccess(buyer.address)).to.be.false;
    });

    it("Should return correct access units", async function () {
      expect(await accessToken.accessUnits(creator.address)).to.equal(100);
    });

    it("Should be transferable", async function () {
      const transferAmount = ethers.parseEther("10");
      await accessToken.connect(creator).transfer(buyer.address, transferAmount);

      expect(await accessToken.balanceOf(buyer.address)).to.equal(transferAmount);
      expect(await accessToken.hasAccess(buyer.address)).to.be.true;
    });

    it("Should be burnable", async function () {
      const burnAmount = ethers.parseEther("10");
      await accessToken.connect(creator).burn(burnAmount);

      expect(await accessToken.balanceOf(creator.address)).to.equal(
        INITIAL_SUPPLY - burnAmount
      );
    });
  });
});
