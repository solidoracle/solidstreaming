//SPDX-License-Identifier: CC0
pragma solidity ^0.8.10;

// import { ERC20 } from 'solmate/tokens/ERC20.sol';
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title SolidStreaming
/// @author solidoracle.eth

contract SolidStreaming {
    /*///////////////////////////////////////////////////////////////
                        STRUCTS & STORAGE
    //////////////////////////////////////////////////////////////*/

	struct Stream {
		uint256 id;
		address sender;
		address receiver;
		uint256 balance;
		uint256 withdrawnBalance;
		uint256 paymentPerBlock;
		Timeframe timeframe;
	}

	struct Timeframe {
		uint256 startBlock;
		uint256 stopBlock;
	}


	uint256 internal streamId = 1;
	uint256 public nonce = 1;
	mapping(uint256 => Stream) public streams;
	Stream[] public streamArray;

    /*///////////////////////////////////////////////////////////////
                        STREAM & WITHDRAWAL LOGIC
    //////////////////////////////////////////////////////////////*/

	function start(address receiver, Timeframe memory timeframe, uint paymentPerBlock) external payable returns (uint256) {
		Stream memory stream = Stream({
			id: streamId,
			sender: msg.sender,
			withdrawnBalance: 0,
			timeframe: timeframe,
			receiver: receiver,
			balance: msg.value,
			paymentPerBlock: paymentPerBlock
		});

		streams[streamId] = stream;
		streamArray.push(stream);

		return streamId++;
	}



	function withdraw(uint256 streamId) public payable {
		if (streams[streamId].receiver != msg.sender) revert Unauthorized();

		uint256 balance = balanceOf(streamId, msg.sender);
		if (balance == 0) revert ZeroBalance();

		unchecked {
			streams[streamId].withdrawnBalance += balance;
		}

		(bool success, ) = msg.sender.call{value:  balance}('');
		require(success, 'Withdraw failed.');
	}



	/*//////////////////////////////////////////////////////////////
								HELPERS
	//////////////////////////////////////////////////////////////*/

	function calculateBlockDelta(Timeframe memory timeframe) internal view returns (uint256 delta) {
		if (block.number <= timeframe.startBlock) return 0;
		if (block.number < timeframe.stopBlock) return block.number - timeframe.startBlock;

		return timeframe.stopBlock - timeframe.startBlock;
	}

	function balanceOf(uint256 streamId, address _address) public view returns (uint256) {
		Stream memory stream = streams[streamId];

		if (stream.sender == address(0)) revert ZeroAddressSender();

		uint256 blockDelta = calculateBlockDelta(stream.timeframe);
		uint256 recipientBalance = blockDelta * stream.paymentPerBlock;

		if (_address == stream.receiver) return recipientBalance - stream.withdrawnBalance;
		if (_address == stream.sender) return stream.balance - recipientBalance;

		return 0;
	}

	function fetchAllStreams() public view returns(Stream[] memory) {
        return streamArray;
    }

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/
	error ZeroBalance();
	error Unauthorized();
	error ZeroAddressSender();
	error StreamStillLive();

}
