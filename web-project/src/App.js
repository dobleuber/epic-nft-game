import React, {useEffect, useState} from 'react';

import {ethers} from 'ethers';

import {SelectCharacter} from './Components/SelectCharacter';
import LoadingIndicator from './Components/LoadingIndicator';
import {Arena} from './Components/Arena';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

import myEpicGame from './utils/MyEpicGame.json';
import {CONTRACT_ADDRESS, transformCharacterData} from './constants';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  // a state variable to store user public wallet

  const [gameContract, setGameContract] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  /*
   * Start by creating a new action that we will run on component load
   */
  // Actions
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);

        /*
         * Check if we're authorized to access the user's wallet
         */
        const accounts = await ethereum.request({ method: 'eth_accounts' });

        /*
         * User can have multiple authorized accounts, we grab the first one if its there!
         */
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
        } else {
          console.log('No authorized account found');
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * Implement your connectWallet method here
   */
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const {ethereum} = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      setGameContract(gameContract);
    }
  }, []);

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log('checking for character NFT on address', currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const txn = await gameContract.userHasNFT();
      if (txn.name) {
        const character = transformCharacterData(txn)
        console.log('User has character NFT', character);
        setCharacterNFT(character);
      } else {
        console.log('No character NFT found');
      }

      setIsLoading(false);
    };

    if (currentAccount) {
      console.log('current account', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount])

  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    } 
    // if not connected to wallet
    if(!currentAccount){
      return (
        <div className="connect-wallet-container">
            <img
              src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
              alt="Monty Python Gif"
            />

            <button
              className="cta-button connect-wallet-button"
              onClick={connectWalletAction}
            >
              Connect Wallet To Get Started
            </button>
          </div>
      )
    } else if (currentAccount && !characterNFT) {
      return (
        <SelectCharacter
          setCharacter={setCharacterNFT}
          gameContract={gameContract}
        />
      )
    } else if (currentAccount && characterNFT) {
      return <Arena
        characterNFT={characterNFT}
        gameContract={gameContract}
        setCharacter={setCharacterNFT}
      />;
    }
  }


  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">🐶 Metaverse Fluffymon 🐻 </p>
          <p className="sub-text">Team up to protect the Metaverse!</p>
          {
            renderContent()
          }
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
