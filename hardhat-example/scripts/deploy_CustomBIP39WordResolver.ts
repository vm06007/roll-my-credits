import { network } from "hardhat";

async function main() {
    const { viem } = await network.connect();
    
    const contract = await viem.deployContract("CustomBIP39WordResolver");
    
    console.log("CustomBIP39WordResolver deployed to:", contract.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 