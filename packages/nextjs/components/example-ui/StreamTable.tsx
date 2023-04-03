import { useEffect, useState } from "react";
import { Spinner } from "../Spinner";
import { BigNumber } from "ethers";
import { ethers } from "ethers";
import { useSigner } from "wagmi";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { SendStreamProps } from "~~/components/example-ui/SendStream";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export const StreamTable = ({ blocknumber: blockNumber, stream }: SendStreamProps) => {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const { data: signer } = useSigner();

  const { writeAsync: withdraw, isLoading } = useScaffoldContractWrite({
    contractName: "SolidStreaming",
    functionName: "withdraw",
    args: [stream?.id],
    onSuccess: () => {
      console.log("withdrawn");
    },
  });

  function calculateAndSetProgress(currentBlock: number, startBlock: BigNumber, stopBlock: BigNumber) {
    const startBlockNumber = Number(startBlock.toString());
    const stopBlockNumber = Number(stopBlock.toString());

    if (currentBlock > stopBlockNumber) {
      setProgress(100);
    } else {
      const progress = ((currentBlock - startBlockNumber) / (stopBlockNumber - startBlockNumber)) * 100;
      console.log(progress, "progress");

      setProgress(progress);
    }
  }

  useEffect(() => {
    calculateAndSetProgress(blockNumber!, stream?.timeframe.startBlock, stream?.timeframe.stopBlock);
  }, [blockNumber]);

  function toggle() {
    calculateAndSetProgress(blockNumber!, stream?.timeframe.startBlock, stream?.timeframe.stopBlock);
    setOpen(!open);
  }

  return (
    <div className="my-2 px-3 pt-3 bg-base-200 rounded-2xl drop-shadow-2xl border-2 border-purple-500">
      <div className="flex justify-between mb-2">
        <div>
          <span
            className={`text-xs rounded-2xl p-1 px-2 ${
              progress === 100 ? "text-green-500 border border-green-500 bg-inherit" : "text-white bg-green-500"
            }`}
          >
            {progress < 100 ? "ACTIVE" : "COMPLETE"}
          </span>{" "}
          <label className="label">
            <span className="text-xl font-bold">
              ID #{!!stream ? Number(stream?.id).toString().padStart(3, "0") : "000"}
            </span>
          </label>
        </div>

        <div className="flex-col">
          <div className="flex items-center">
            <div className="flex flex-col mr-4">
              <div className="text-2xs font-bold">Sender:</div>
              <Address address={!!stream ? stream?.sender.toString() : ""} customClass="text-sm" />
            </div>
            <ChevronDoubleRightIcon className="h-6 w-6 text-purple-500" />
            <div className="flex flex-col ml-4">
              <div className="text-2xs font-bold">Receiver:</div>
              <Address address={!!stream ? stream?.receiver : ""} customClass="text-sm" />
            </div>
          </div>

          <div className="flex justify-center text-xs italic mt-1">
            <div>
              Streaming {!!stream ? ethers.utils.formatEther(stream?.paymentPerBlock.toString()) : "0.0"} ETH per block
            </div>
          </div>
        </div>
        <div className="">
          <button
            className="btn btn-xs bg-transparent my-4 border-1 border-purple-500 hover:bg-violet-500"
            onClick={() => toggle()}
          >
            {!open ? (
              <ChevronDownIcon className="h-5 w-5 text-black hover:text-white" />
            ) : (
              <ChevronUpIcon className="h-5 w-5 text-black hover:text-white" />
            )}{" "}
          </button>
        </div>
      </div>
      {open ? (
        <div
          className="flex flex-row pt-1 w-full justify-between items-center 
            "
        >
          <div className="flex-col w-full mr-7 justify-center items-center">
            <div className="flex my-2 items-center justify-between w-full">
              <div>
                <span className="text-xs inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                  {progress < 100 ? "streaming in progress" : "streaming complete"}{" "}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-green-600">{progress}%</span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200 w-full">
              <div
                style={{ width: `${progress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
              ></div>
            </div>
          </div>

          <div className="flex-col justify-center items-center ">
            <div className="flex items-center justify-center w-full pb-2">
              <button
                className="btn border-1 bg-purple-500 hover:bg-violet-500 text-white border-gray-400"
                onClick={() => withdraw()}
                disabled={signer?._address.toString() !== stream?.receiver}
              >
                {isLoading ? (
                  <div className="flex justify-center">
                    <Spinner />
                  </div>
                ) : (
                  "Withdraw"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
