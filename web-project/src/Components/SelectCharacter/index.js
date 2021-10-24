import React, {useEffect, useState} from 'react';

import LoadingIndicator from '../LoadingIndicator';
import './SelectCharacter.css';
import { transformCharacterData } from '../../constants';

export const SelectCharacter = ({setCharacter, gameContract}) => {
  const [characters, setCharacters] = useState([]);
  const [mintingCharacter, setMintingCharacter] = useState(false);

  useEffect(() => {
    const getCharacters = async () => {
      try {
        console.log('Getting contract characters to mint!');

        const charactersTxn = await gameContract.getAllDefaultCharacters();
        

        const characters = charactersTxn.map(transformCharacterData)
        console.log('characters:', characters);
        setCharacters(characters);
      } catch (error) {
        console.error(error);
      }
    }

    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      console.log(
        `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      );

      /*
      * Once our character NFT is minted we can fetch the metadata from our contract
      * and set it in state to move onto the Arena
      */
      if (gameContract) {
        const characterNFT = await gameContract.userHasNFT();
        console.log('CharacterNFT: ', characterNFT);
        setCharacter(transformCharacterData(characterNFT));
      }
    };

    if(gameContract) {
      getCharacters();

      gameContract.on('CharacterCreated', onCharacterMint);
    }

    return () => {
      if (gameContract) {
        gameContract.off('CharacterCreated', onCharacterMint);
      }
    }
  }, [gameContract,setCharacters]);

  const mintCharacterNFTAction = (characterId) => async () => {
    try {
      if (gameContract) {
        setMintingCharacter(true);
        console.log('minting your character...');
        const mintTxn = await gameContract.mint(characterId);
        await mintTxn.wait();
        console.log('mintTxn:', mintTxn);
      }
    } catch (error) {
      console.error(error);
    }

    setMintingCharacter(false);
  }

  const renderCharacters = () =>
  characters.map((character, index) => (
    <div className="character-item" key={character.name}>
      <div className="name-container">
        <p>{character.name}</p>
      </div>
      <img src={character.imageURI} alt={character.name} />
      <button
        type="button"
        className="character-mint-button"
        onClick={mintCharacterNFTAction(index)}
      >{`Mint ${character.name}`}</button>
    </div>
  ));

  return (
  <div className="select-character-container">
    <h2>Mint Your Hero. Choose wisely.</h2>
    {/* Only show this when there are characters in state */}
    
    <div className="character-grid">{renderCharacters()}</div>

    {mintingCharacter && (
      <div className="loading">
        <div className="indicator">
          <LoadingIndicator />
          <p>Minting In Progress...</p>
        </div>
        <img
          src="https://drive.google.com/uc?id=1lnYvIvkh4zexXO-xqIxNy3YcuilAD2dk"
          alt="Jumping monster is minting your hero"
        />
      </div>
    )}
    
  </div>
);
}