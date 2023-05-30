"use client";

import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useState, useRef } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../../constants";

const Home = () => {
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [tokensIdsMinted, setTokensIdsMinted] = useState<string>("0");
  const web3ModalRef = useRef<Web3Modal | undefined>(undefined);

  /**
   * publicMint: Mint an NFT
   */
  const publicMint = async () => {
    try {
      console.log("Public mint");
      const signer = (await getProviderOrSigner(true)) as providers.JsonRpcSigner;
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);

      const tx = await nftContract.mint({
        value: utils.parseEther("0.01"),
      });
      setLoading(true);

      await tx.wait();
      setLoading(false);
      window.alert("LW3Punk successfully minted!");
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * connectWallet: Connects the MetaMask wallet
   */
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * getTokenIdsMinted: Gets the number of tokenIds that have been minted
   */
  const getTokenIdsMinted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      const _tokenIds = await nftContract.tokenIds();
      console.log("tokenIds: ", _tokenIds);
      setTokensIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    if (!web3ModalRef.current) {
      throw new Error("web3ModalRef.current is undefined");
    }

    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Mumbai network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 80001) {
      window.alert("Change the network to Mumbai");
      throw new Error("Change network to Mumbai");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /**
   * useEffect: Whenever value of 'walletConnected' changes, this effect will be called
   */
  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      connectWallet();
      getTokenIdsMinted();

      // set an interval to get the number of token Ids minted every 5 seconds
      setInterval(async () => {
        await getTokenIdsMinted();
      }, 5 * 1000);
    }
  }, [walletConnected]);

  /**
   * renderButton: Returns a button based on the state of the dApp
   */
  const renderButton = () => {
    if (!walletConnected) {
      return (
        <button
          className="rounded bg-blue-700 border-none text-white text-base p-5 w-52 cursor-pointer mb-2 md:w-full md:flex md:flex-col md:justify-center md:items-center"
          onClick={connectWallet}
        >
          Connect your wallet
        </button>
      );
    }

    if (loading) {
      return (
        <button className="rounded bg-blue-700 border-none text-white text-base p-5 w-52 cursor-pointer mb-2 md:w-full md:flex md:flex-col md:justify-center md:items-center">
          Loading...
        </button>
      );
    }

    return (
      <button
        className="rounded bg-blue-700 border-none text-white text-base p-5 w-52 cursor-pointer mb-2 md:w-full md:flex md:flex-col md:justify-center md:items-center"
        onClick={publicMint}
      >
        Public Mint 🚀
      </button>
    );
  };

  return (
    <div>
      <Head>
        <title>LW3Punks</title>
        <link
          rel="icon"
          href="/favicon.ico"
        />
      </Head>
      <div className="min-h-screen flex flex-row justify-center items-center font-mono md:w-full md:flex md:flex-col md:justify-center md:items-center">
        <div className="mx-8">
          <h1 className="text-4xl mb-2">Welcome to LW3Punks!</h1>
          <div className="text-lg">It&#39;s an NFT collection for LearnWeb3 students.</div>
          <div className="text-lg">{tokensIdsMinted}/10 have been minted</div>
          {renderButton()}
        </div>
        <div>
          <img
            className="w-70 h-50 ml-20"
            src="./LW3punks/1.png"
          />
        </div>
      </div>
      <footer className="flex justify-center items-center py-8 border-t-2 border-gray-300">
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
};

export default Home;
