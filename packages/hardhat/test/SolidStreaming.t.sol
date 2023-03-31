// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/SolidStreaming.sol";
import { Vm } from 'forge-std/Vm.sol';


contract CounterTest is Test {
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

console.log("HELLO");

SolidStreaming.Timeframe memory timeframe = SolidStreaming.Timeframe({
    startBlock: block.number,
    stopBlock: block.number + 5
});


uint256 streamId = solidStreaming.start{value: 0.5 ether}(
    address(receiver),
    timeframe,
    0.1 ether
);


}


}
