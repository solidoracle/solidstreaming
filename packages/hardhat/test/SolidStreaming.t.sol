// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/SolidStreaming.sol";
import { Vm } from 'forge-std/Vm.sol';

contract SolidStreamingTest is Test {
    SolidStreaming public solidStreaming;
    address receiver = address(1);


    function setUp() public {
        solidStreaming = new SolidStreaming();
    }

function testNonce() public {
    uint256 nonce = solidStreaming.nonce();
    assertEq(nonce, 1);
}

function testStreamStart() public {
    SolidStreaming.Timeframe memory timeframe = SolidStreaming.Timeframe({
        startBlock: block.number,
        stopBlock: block.number + 5
    });

    uint256 streamId = solidStreaming.start{value: 0.5 ether}(
        address(receiver),
        timeframe,
        0.1 ether
    );

    assertEq(streamId, 1);
    assertEq(address(solidStreaming).balance, 0.5 ether);

    (
        uint256 id,
        address sender,
        address streamReceiver,
        uint256 balance,
        uint256 withdrawnBalance,
        uint256 paymentPerBlock,
        SolidStreaming.Timeframe memory streamTimeframe
    ) = solidStreaming.streams(streamId);

    assertEq(sender, address(this));
    assertEq(streamReceiver, address(receiver));
    assertEq(balance, 0.5 ether);
    assertEq(withdrawnBalance, 0);
    assertEq(paymentPerBlock, 0.1 ether);
    assertEq(streamTimeframe.startBlock, timeframe.startBlock);
    assertEq(streamTimeframe.stopBlock, timeframe.stopBlock);
}
function testBalanceCalculationAndWithdrawals() public {
    uint256 streamId = solidStreaming.start{value: 0.5 ether}(
        address(receiver),
        SolidStreaming.Timeframe({ startBlock: block.number, stopBlock: block.number + 10 }),
        0.1 ether
    );


    assertEq(solidStreaming.balanceOf(streamId, address(receiver)), 0);
    assertEq(solidStreaming.balanceOf(streamId, address(this)), 0.5 ether);

    vm.roll(block.number + 1);

    assertEq(solidStreaming.balanceOf(streamId, address(receiver)), 0.1 ether);
    assertEq(solidStreaming.balanceOf(streamId, address(this)), 0.4 ether);

    vm.roll(block.number + 1);

    assertEq(solidStreaming.balanceOf(streamId, address(receiver)), 0.2 ether);
    assertEq(solidStreaming.balanceOf(streamId, address(this)), 0.3 ether);


    vm.startPrank(address(receiver));

    solidStreaming.withdraw(streamId);

    assertEq(address(receiver).balance, 0.2 ether);
    assertEq(solidStreaming.balanceOf(streamId, address(receiver)), 0);

    assertEq(address(solidStreaming).balance, 0.3 ether);

    vm.roll(block.number + 3);

    assertEq(solidStreaming.balanceOf(streamId, address(receiver)), 0.3 ether);
    assertEq(solidStreaming.balanceOf(streamId, address(this)), 0);

    solidStreaming.withdraw(streamId);
    assertEq(address(receiver).balance, 0.5 ether);
    assertEq(address(solidStreaming).balance, 0);
}

function testNonRecipientCannotWithdraw() public {
    uint256 streamId = solidStreaming.start{value: 0.5 ether}(
        address(receiver),
        SolidStreaming.Timeframe({ startBlock: block.number, stopBlock: block.number + 10 }),
        0.1 ether
    );

    assertEq(solidStreaming.balanceOf(streamId, address(receiver)), 0);
    assertEq(solidStreaming.balanceOf(streamId, address(this)), 0.5 ether);

    vm.expectRevert(abi.encodeWithSignature('Unauthorized()'));
    solidStreaming.withdraw(streamId);

	    assertEq(address(solidStreaming).balance, 0.5 ether);
		assertEq(solidStreaming.balanceOf(streamId, address(receiver)), 0);
		assertEq(solidStreaming.balanceOf(streamId, address(this)), 0.5 ether);
}
}


