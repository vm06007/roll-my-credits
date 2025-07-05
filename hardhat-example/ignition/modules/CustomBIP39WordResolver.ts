import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CustomBIP39WordResolverModule", (m) => {
    const resolver = m.contract("CustomBIP39WordResolver");

    return { resolver };
}); 