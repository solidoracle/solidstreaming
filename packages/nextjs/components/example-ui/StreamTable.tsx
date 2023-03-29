import { useState } from "react";
import { BigNumber } from "ethers";
import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useAnimationConfig, useScaffoldContractRead, useScaffoldEventSubscriber } from "~~/hooks/scaffold-eth";

export const StreamTable = () => {
  const [open, setOpen] = useState(false);

  const { data: stream5, isLoading: isStreamsLoading } = useScaffoldContractRead({
    contractName: "SolidStreaming",
    functionName: "streams",
    args: [5],
  });

  console.log("streamID", stream5);

  return (
    <div className="flex bg-base-200 relative justify-center items-center min-w-[40rem]">
      <div className="flex flex-col w-10/12 ">
        <div className="mb-3 ml-1 text-sm text-gray-700"> Latest Streams</div>

        <div className="px-3 pt-3 bg-base-200 rounded-2xl drop-shadow-2xl border-2 border-purple-500">
          <div className="flex justify-between">
            <div className="">
              <span className="text-xs text-white bg-green-500 rounded-2xl p-1 px-2 ">ACTIVE</span>{" "}
              <label className="label">
                <span className="text-2xl font-bold">ID #001</span>
              </label>
            </div>

            <div className="flex-col">
              <div className="flex items-center">
                <div className="flex flex-col mr-4">
                  <div className="text-2xs font-bold">Sender:</div>
                  <Address address={stream5[0]} customClass="text-sm" />
                </div>
                <ChevronDoubleRightIcon className="h-6 w-6 text-purple-500" />
                <div className="flex flex-col ml-4">
                  <div className="text-2xs font-bold">Receiver:</div>
                  <Address address={stream5[1]} customClass="text-sm" />
                </div>
              </div>

              <div className="flex justify-center text-xs italic mt-1">
                <div>Streaming 1.0 ETH per Block</div>
              </div>
            </div>
            <div className="">
              <button
                className="btn btn-xs bg-gray-900 my-4 border-1 border-purple-500 hover:bg-violet-500"
                onClick={() => setOpen(!open)}
              >
                <ChevronDownIcon className="h-5 w-5 text-white " />
              </button>
            </div>
          </div>
          {open ? (
            <div className="flex flex-col pt-1 w-full justify-center items-center">
              <div className="flex-col w-1/2 justify-center items-center">
                <div className="flex my-2 items-center justify-between w-full">
                  <div>
                    <span className="text-2xs inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                      streaming progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-green-600">30%</span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200 w-full">
                  <div
                    style={{ width: "30%" }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                  ></div>
                </div>
              </div>
              <div className="flex-col w-full justify-center items-center ">
                <div className="flex m-2 items-center justify-between w-full px-14 pb-2">
                  <button className="btn border-1 bg-purple-500 hover:bg-violet-600 text-white border-gray-400">
                    Adjust
                  </button>
                  <button className="btn border-1 bg-purple-500 hover:bg-violet-500 text-white border-gray-400">
                    Withdraw
                  </button>
                  <button className="btn border-1 bg-purple-500 hover:bg-violet-500 text-white border-gray-400">
                    Refund
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
