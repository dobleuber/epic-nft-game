export const CONTRACT_ADDRESS = '0x4fA19c600f2B27033A8c290773f0FD164919CBc9'

/*
 * Add this method and make sure to export it on the bottom!
 */
export const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
  };
};