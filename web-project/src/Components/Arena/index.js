import React, { useEffect, useState } from 'react';

import LoadingIndicator from '../LoadingIndicator';
import { transformCharacterData } from '../../constants';
import './Arena.css';

/*
 * We pass in our characterNFT metadata so we can a cool card in our UI
 */
export const Arena = ({ gameContract, characterNFT, setCharacter }) => {
  // State
  const [boss, setBoss] = useState(null);
  const [attackState, setAttackState] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState('attacking');
        console.log('Attacking boss...');
        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        console.log('attackTxn:', attackTxn);
        setAttackState('hit');
        
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          setIsCritical(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error attacking boss:', error);
      setAttackState('');
    }
  };

  useEffect(() => {
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBigBoss();
      console.log('getting big boss...', bossTxn);
      setBoss(transformCharacterData(bossTxn))
    }

    if(gameContract) {
      fetchBoss()
    }
  },[gameContract])

  useEffect(() => {
    const onAttackComplete = (newBossHp, newPlayerHp, isCriticalHit) => {
      const bossHp = newBossHp.toNumber();
      const playerHp = newPlayerHp.toNumber();
      const isCritical = isCriticalHit;

      console.log('critical', isCritical)

      console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp} was critical ${isCritical}`);

      /*
        * Update both player and boss Hp
        */
      setBoss((prevState) => {
        return { ...prevState, hp: bossHp };
      });

      setCharacter((prevState) => {
        return { ...prevState, hp: playerHp };
      });

      setIsCritical(isCritical)
    };

    if (gameContract) {
			gameContract.on('AttackCompleted', onAttackComplete);
      console.log('event attached!!')
	  }

    return () => {
      if (gameContract) {
        gameContract.off('AttackCompleted', onAttackComplete);
      }
    }
  },[gameContract, setCharacter, setIsCritical])

  return (
    <div className="arena-container">
      {boss && showToast && (
        <div id="toast" className="show">
          <div id="desc">
            {
              isCritical  
              ? `💥 ${boss.name} was a critical hit for ${characterNFT.attackDamage * 2}!`
              : `💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`
            }
          </div>
        </div>
      )}
      {/* Replace your Boss UI with this */}
      {boss && (
        <div className="boss-container">
          <div className={`boss-content ${attackState}`}>
            <h2>🔥 {boss.name} 🔥</h2>
            <div className="image-content">
              <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
              <div className="health-bar">
                <progress value={boss.hp} max={boss.maxHp} />
                <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
              </div>
            </div>
          </div>
          <div className="attack-container">
            <button className="cta-button" onClick={runAttackAction}>
              {`💥 Attack ${boss.name}`}
            </button>
          </div>
          {/* Add this right under your attack button */}
          {attackState === 'attacking' && (
            <div className="loading-indicator">
              <LoadingIndicator />
              <p>Attacking ⚔️</p>
            </div>
          )}
        </div>
      )}

      {/* Character NFT */}
      {/* Replace your Character UI with this */}
      {characterNFT && (
        <div className="players-container">
          <div className="player-container">
            <h2>Your Character</h2>
            <div className="player">
              <div className="image-content">
                <h2>{characterNFT.name}</h2>
                <img
                  src={characterNFT.imageURI}
                  alt={`Character ${characterNFT.name}`}
                />
                <div className="health-bar">
                  <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                  <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                </div>
              </div>
              <div className="stats">
                <h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
              </div>
            </div>
          </div>
          {/* <div className="active-players">
            <h2>Active Players</h2>
            <div className="players-list">{renderActivePlayersList()}</div>
          </div> */}
        </div>
      )}
    </div>
  );
};