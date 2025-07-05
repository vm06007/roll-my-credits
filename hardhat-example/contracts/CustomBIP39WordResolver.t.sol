// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { CustomBIP39WordResolver } from "./CustomBIP39WordResolver.sol";
import { Test } from "forge-std/Test.sol";

contract CustomBIP39WordResolverTest is Test {
    CustomBIP39WordResolver resolver;
    address owner;
    address user1;
    address user2;

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        resolver = new CustomBIP39WordResolver();
    }

    function test_InitialState() public view {
        // Check that contract is deployed
        require(address(resolver) != address(0), "Contract should be deployed");
    }

    function test_PayFunction() public {
        uint256 paymentAmount = 1 ether;

        // User sends payment
        vm.prank(user1);
        resolver.pay{value: paymentAmount}();

        // Check contract balance
        require(address(resolver).balance == paymentAmount, "Contract should have received payment");
    }

    function test_PaymentReceivedEvent() public {
        uint256 paymentAmount = 1 ether;

        // Expect PaymentReceived event
        vm.expectEmit(true, true, false, true);
        emit PaymentReceived(user1, paymentAmount);

        vm.prank(user1);
        resolver.pay{value: paymentAmount}();
    }

    function test_WithdrawFunction() public {
        uint256 paymentAmount = 1 ether;

        // User sends payment
        vm.prank(user1);
        resolver.pay{value: paymentAmount}();

        uint256 initialBalance = address(this).balance;

        // Owner withdraws
        resolver.withdraw();

        uint256 finalBalance = address(this).balance;

        // Check that owner received the funds
        require(finalBalance > initialBalance, "Owner should receive funds");
        require(address(resolver).balance == 0, "Contract should have 0 balance after withdrawal");
    }

    function test_OnlyOwnerCanWithdraw() public {
        uint256 paymentAmount = 1 ether;

        // User sends payment
        vm.prank(user1);
        resolver.pay{value: paymentAmount}();

        // Non-owner tries to withdraw
        vm.prank(user2);
        vm.expectRevert();
        resolver.withdraw();
    }

    function test_MultiplePayments() public {
        uint256 payment1 = 0.5 ether;
        uint256 payment2 = 0.3 ether;

        // Multiple users send payments
        vm.prank(user1);
        resolver.pay{value: payment1}();

        vm.prank(user2);
        resolver.pay{value: payment2}();

        // Check total contract balance
        require(address(resolver).balance == payment1 + payment2, "Contract should have total of all payments");
    }

    function testFuzz_PaymentAmounts(uint256 amount) public {
        // Limit amount to reasonable range to avoid overflow
        vm.assume(amount > 0 && amount <= 100 ether);

        vm.prank(user1);
        resolver.pay{value: amount}();

        require(address(resolver).balance == amount, "Contract should have received exact payment amount");
    }

    // Helper function to receive ETH (needed for withdraw test)
    receive() external payable {}
}