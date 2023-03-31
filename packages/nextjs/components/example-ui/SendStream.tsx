import { useEffect, useState } from "react";
import { BigNumber, ethers, utils } from "ethers";
import { Spinner } from "~~/components/Spinner";
import { AddressInput } from "~~/components/scaffold-eth/Input/AddressInput";
import { EtherInput } from "~~/components/scaffold-eth/Input/EtherInput";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

interface TimeFrame {
  startBlock: BigNumber;
  stopBlock: BigNumber;
}

enum FlowRate {
  BLOCK = "/ block",
  HOUR = "/ hour",
  MINUTE = "/ minute",
  SECOND = "/ second",
}

export interface SendStreamProps {
  blocknumber?: number;
  stream?: any;
}

export const SendStream = ({ blocknumber: blockNumber }: SendStreamProps) => {
  const [receiver, setReceiver] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [timeframe, setTimeframe] = useState<TimeFrame>({
    startBlock: BigNumber.from(0),
    stopBlock: BigNumber.from(0),
  });
  const [paymentPerBlockString, setPaymentPerBlockString] = useState("");
  const [paymentPerBlock, setPaymentPerBlock] = useState<BigNumber>(BigNumber.from(0));
  const [duration, setDuration] = useState<BigNumber>(BigNumber.from(0));

  function formatAndSetPaymentPerBlock(value: string) {
    if (value === "") {
      setPaymentPerBlock(BigNumber.from(0));
      return;
    }
    const parsedValue = ethers.utils.parseEther(value);
    setPaymentPerBlock(parsedValue);
  }

  interface ScaffoldContractWriteOptions {
    contractName: string;
    functionName: string;
    args: (string | BigNumber | TimeFrame)[];
    value: string;
    onSuccess: () => void;
  }

  const { writeAsync, isLoading } = useScaffoldContractWrite({
    contractName: "SolidStreaming",
    functionName: "start",
    args: [receiver, timeframe, paymentPerBlock],
    value: depositAmount,
    onSuccess: () => {
      setReceiver("");
      setDepositAmount("");
      setPaymentPerBlock(BigNumber.from(0));
      setPaymentPerBlockString("");
    },
  });

  useEffect(() => {
    const parsedDepositAmountBN = utils.parseEther(Number(depositAmount).toString());
    const duration = paymentPerBlock.gt(BigNumber.from(0))
      ? parsedDepositAmountBN.div(paymentPerBlock)
      : BigNumber.from(0);

    const mod = paymentPerBlock.gt(BigNumber.from(0))
      ? parsedDepositAmountBN.div(paymentPerBlock).mod(BigNumber.from(2))
      : BigNumber.from(0);

    if (mod.gt(BigNumber.from(0))) {
      setDuration(duration.add(BigNumber.from(1)));
    } else {
      setDuration(duration);
    }
  }, [depositAmount, paymentPerBlock]);

  useEffect(() => {
    if (blockNumber) {
      setTimeframe({
        startBlock: BigNumber.from(blockNumber),
        stopBlock: BigNumber.from(blockNumber).add(duration),
      });
    }
  }, [blockNumber, duration]);

  function sendStream() {
    if (paymentPerBlock.gt(utils.parseEther(depositAmount))) {
      alert("Deposit amount must be greater than flow rate");
      return;
    }
    writeAsync();
  }

  return (
    <div className="flex bg-purple-200 relative pb-10 justify-center items-center">
      <div className="flex flex-col w-10/12 mt-8">
        <div className="flex flex-col px-7 pb-8 pt-6 bg-base-200 opacity-80 rounded-2xl drop-shadow-2xl border-2 border-primary">
          <div className="mb-5">
            <span className="text-l text-white font-bold bg-purple-500 rounded-2xl p-3">Send Stream</span>{" "}
          </div>

          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text font-bold">Receiver Wallet Address</span>
            </label>

            <AddressInput
              value={receiver}
              onChange={value => setReceiver(value)}
              placeholder="Public Address"
              customClass="bg-white py-1"
            />

            {receiver.length > 0 && !ethers.utils.isAddress(receiver) ? <p>Add a valid address</p> : null}
          </div>
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text font-bold">Deposit Amount</span>
            </label>

            <EtherInput
              placeholder="Total amount to be streamed"
              customClass="bg-white py-1"
              value={depositAmount}
              onChange={value => setDepositAmount(value)}
            />
          </div>

          <div className="form-control mb-5">
            <label className="label">
              <span className="label-text font-bold">Flow Rate</span>
            </label>
            <div className="flex flex-row">
              <EtherInput
                customClass="bg-white py-1 w-full"
                placeholder="0.0"
                value={paymentPerBlockString}
                onChange={value => {
                  if (depositAmount != "") {
                    formatAndSetPaymentPerBlock(value);
                    setPaymentPerBlockString(value);
                  } else {
                    setPaymentPerBlockString("");
                  }
                }}
              />

              <div className="form-control -ml-12">
                <div className="input-group">
                  <select className="select select-bordered">
                    <option selected> {FlowRate.BLOCK}</option>
                    {/* <option> {FlowRate.HOUR}</option>
                    <option> {FlowRate.MINUTE}</option>
                    <option> {FlowRate.SECOND}</option> */}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full font-bold rounded-2xl bg-primary px-6 py-5 text-l uppercase text-white shadow-md  transition duration-150 ease-in-out hover:bg-primary-700 hover:shadow-lg focus:bg-primary-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-primary-800 active:shadow-lg"
            data-te-ripple-init
            data-te-ripple-color="light"
            onClick={() => sendStream()}
          >
            {isLoading ? (
              <div className="flex justify-center">
                <Spinner />
              </div>
            ) : (
              "Send Stream"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
