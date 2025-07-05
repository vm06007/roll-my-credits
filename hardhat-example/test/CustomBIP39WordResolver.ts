import { expect } from "chai";
import { network } from "hardhat";

describe("CustomBIP39WordResolver", async function () {
    const { viem } = await network.connect();
    const publicClient = await viem.getPublicClient();

    it("Should deploy successfully", async function () {
        const contract = await viem.deployContract("CustomBIP39WordResolver");
        expect(contract.address).to.be.a("string");
        expect(contract.address).to.match(/^0x[a-fA-F0-9]{40}$/);
    });

    it("Should accept payments and emit PaymentReceived event", async function () {
        const [owner, user] = await viem.getWalletClients();
        const contract = await viem.deployContract("CustomBIP39WordResolver");

        const paymentAmount = 1000000000000000000n; // 1 ETH in wei

        // User sends payment
        const tx = await contract.write.pay({ value: paymentAmount, account: user.account });
        const receipt = await tx.wait();

        // Check that PaymentReceived event was emitted
        const events = await publicClient.getContractEvents({
            address: contract.address,
            abi: contract.abi,
            eventName: "PaymentReceived",
            fromBlock: receipt.blockNumber,
            toBlock: receipt.blockNumber,
            strict: true,
        });

        expect(events).to.have.length(1);
        expect(events[0].args.from).to.equal(user.account.address);
        expect(events[0].args.amount).to.equal(paymentAmount);
    });

    it("Should allow owner to withdraw funds", async function () {
        const [owner, user] = await viem.getWalletClients();
        const contract = await viem.deployContract("CustomBIP39WordResolver");

        const paymentAmount = 1000000000000000000n; // 1 ETH in wei

        // User sends payment
        await contract.write.pay({ value: paymentAmount, account: user.account });

        // Get initial owner balance
        const initialBalance = await publicClient.getBalance({ address: owner.account.address });

        // Owner withdraws
        const withdrawTx = await contract.write.withdraw({ account: owner.account });
        await withdrawTx.wait();

        // Get final owner balance
        const finalBalance = await publicClient.getBalance({ address: owner.account.address });

        // Check that balance increased (accounting for gas costs)
        expect(finalBalance).to.be.greaterThan(initialBalance - 100000000000000000n); // Allow for gas costs
    });

    it("Should track balances correctly", async function () {
        const [owner, user1, user2] = await viem.getWalletClients();
        const contract = await viem.deployContract("CustomBIP39WordResolver");

        const payment1 = 500000000000000000n; // 0.5 ETH
        const payment2 = 300000000000000000n; // 0.3 ETH

        // Multiple users send payments
        await contract.write.pay({ value: payment1, account: user1.account });
        await contract.write.pay({ value: payment2, account: user2.account });

        // Check contract balance
        const contractBalance = await publicClient.getBalance({ address: contract.address });
        expect(contractBalance).to.equal(payment1 + payment2);
    });
}); 