import { ethers } from "hardhat";
import "dotenv/config";

const METADATA_CID = process.env.METADATA_CID;

const main = async () => {
  const metadataURL = METADATA_CID;
  const lw3PunksContract = await ethers.getContractFactory("LW3Punks");
  const deployedLW3PunksContract = await lw3PunksContract.deploy(metadataURL!);

  await deployedLW3PunksContract.deployed();
  console.log("LW3Punks Contract Address: ", deployedLW3PunksContract.address);
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
