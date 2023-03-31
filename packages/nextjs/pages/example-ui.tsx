import { useEffect, useState } from "react";
import Head from "next/head";
import { NextPage } from "next";
import ReactPaginate from "react-paginate";
import { goerli } from "wagmi/chains";
import { SendStream } from "~~/components/example-ui/SendStream";
import { StreamTable } from "~~/components/example-ui/StreamTable";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { getLocalProvider } from "~~/utils/scaffold-eth";

const ExampleUI: NextPage = () => {
  const [blockNumber, setBlockNumber] = useState<number | undefined>();
  const [currentPage, setCurrentPage] = useState(0);

  const { data: streamArray } = useScaffoldContractRead({
    contractName: "SolidStreaming",
    functionName: "fetchAllStreams",
  });

  const PER_PAGE = 4;
  const offset = currentPage * PER_PAGE!;
  const pageCount = Math.ceil(streamArray?.length / PER_PAGE);
  const paginatedStreams = streamArray
    ?.slice()
    .reverse()
    .slice(offset, offset + PER_PAGE);

  function handlePageClick({ selected: selectedPage }) {
    setCurrentPage(selectedPage);
  }

  useEffect(() => {
    const fetchBlockNumber = async () => {
      const provider = getLocalProvider(goerli);
      const currentBlockNumber = await provider?.getBlockNumber();
      setBlockNumber(currentBlockNumber);
    };
    // Call the fetchBlockNumber function every 15 seconds
    const interval = setInterval(() => {
      fetchBlockNumber();
    }, 15000);

    // Call the fetchBlockNumber function immediately on component mount
    fetchBlockNumber();

    // Cleanup the interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Scaffold-eth Example Ui</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </Head>
      <div className="grid lg:grid-cols-2 flex-grow" data-theme="exampleUi">
        <SendStream blocknumber={blockNumber} />
        <div className="flex bg-base-200 relative justify-center items-center min-w-[40rem] my-4">
          <div className="flex flex-col w-10/12 ">
            <div className="mb-2 ml-1.5 text-sm text-gray-700 font-semibold"> Latest Streams</div>
            {paginatedStreams?.slice().map(stream => (
              <StreamTable key={stream.id} blocknumber={blockNumber} stream={stream} />
            ))}

            <div className="flex justify-center mt-5">
              <ReactPaginate
                previousLabel={"←"}
                nextLabel={"→"}
                pageCount={pageCount}
                onPageChange={handlePageClick}
                previousLinkClassName={"font-bold"}
                nextLinkClassName={"font-bold"}
                activeClassName={"text-violet-700 bg-white rounded-md px-2 font-semibold"}
                className="flex justify-between w-1/5 text-white bg-violet-500 rounded-md px-2 py-1"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExampleUI;
