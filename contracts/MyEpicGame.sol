// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

// NFT contract to inherit from.
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Helper functions OpenZeppelin provides.
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "hardhat/console.sol";

import "./libraries/Base64.sol";

contract MyEpicGame is ERC721 {
    struct CharacterAttributes {
        string name;
        string imageURI;
        uint characterIndex;
        uint attackDamage;
        uint hp;
        uint maxHp;
    }

    struct BigBoss {
        string name;
        string imageURI;
        uint attackDamage;
        uint hp;
        uint maxHp;
    }

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIDs;

    /*
     * We will be using this below to help generate a random number
     */
    uint256 private seed;

    uint private criticalHitChance;
    address private owner;

    CharacterAttributes[] defaultCharacters;
    BigBoss public bigBoss;

    mapping (uint256 => CharacterAttributes) public nftHolderAttributes;

    mapping (address => uint256) public nftHolders;

    event CharacterCreated(address sender, uint256 tokenId, uint256 characterIndex);
    event AttackCompleted(uint newBossHP, uint newPlayerHP, bool isCriticalHit);

    constructor(
        string [] memory characterNames,
        string [] memory characterImageURIs,
        uint [] memory characterHPs,
        uint [] memory characterAttackDamages,
        string memory bossName, // These new variables would be passed in via run.js or deploy.js.
        string memory bossImageURI,
        uint bossHp,
        uint bossAttackDamage
    )
        ERC721("Fluffymon", "MONSTER")
    {
        bigBoss = BigBoss(
            bossName,
            bossImageURI,
            bossAttackDamage,
            bossHp,
            bossHp
        );

        console.log("Done initializing boss %s w/ HP %s, img %s", bigBoss.name, bigBoss.hp, bigBoss.imageURI);

        for(uint i = 0; i < characterNames.length; i++) {
            defaultCharacters.push(
                CharacterAttributes(
                    characterNames[i],
                    characterImageURIs[i],
                    i,
                    characterAttackDamages[i],
                    characterHPs[i],
                    characterHPs[i]
                )
            );

            CharacterAttributes memory c = defaultCharacters[i];
            console.log("Initialization for %s with HP %s, img %s", c.name, c.hp, c.imageURI);
        }
        seed = block.timestamp;
        criticalHitChance = 85;

        owner = msg.sender;

        _tokenIDs.increment(); 
    }

    function mint(uint _characterIndex) external {
        uint256 newItemID = _tokenIDs.current();

        _safeMint(msg.sender, newItemID);

        nftHolderAttributes[newItemID] = CharacterAttributes(
            defaultCharacters[_characterIndex].name,
            defaultCharacters[_characterIndex].imageURI,
            defaultCharacters[_characterIndex].characterIndex,
            defaultCharacters[_characterIndex].attackDamage,
            defaultCharacters[_characterIndex].hp,
            defaultCharacters[_characterIndex].maxHp
        );

        console.log("Minted NFT with tokenID %s and characterIndex", newItemID, _characterIndex);

        console.log("Minted %s with HP %s, img %s", nftHolderAttributes[newItemID].name, nftHolderAttributes[newItemID].hp, nftHolderAttributes[newItemID].imageURI);

        nftHolders[msg.sender] = newItemID;

        _tokenIDs.increment();

        emit CharacterCreated(msg.sender, newItemID, _characterIndex);
    }

    function tokenURI(uint256 _tokenID) public view override returns (string memory) {
        CharacterAttributes memory attributes = nftHolderAttributes[_tokenID];

        string memory strHP = Strings.toString(attributes.hp);
        string memory strMaxHp = Strings.toString(attributes.maxHp);
        string memory strAttackDamage = Strings.toString(attributes.attackDamage);

        string memory json = Base64.encode(
        bytes(
            string(
                abi.encodePacked(
                    '{"name": "',
                    attributes.name,
                    ' -- NFT #: ',
                    Strings.toString(_tokenID),
                    '", "description": "This is an NFT that lets people play in the game Metaverse Fluffy monsters!", "image": "',
                    attributes.imageURI,
                    '", "attributes": [ { "trait_type": "Health Points", "value": ',strHP,', "max_value":',strMaxHp,'}, { "trait_type": "Attack Damage", "value": ',
                    strAttackDamage,'} ]}'
                    )
                )
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
        
        return output;
    }

    function attackBoss() public {
        uint256 tokenID = nftHolders[msg.sender];

        CharacterAttributes storage player = nftHolderAttributes[tokenID];

        console.log("\nPlayer with character %s about to attack. Has %s HP and %s AD", player.name, player.hp, player.attackDamage);
        console.log("Boss %s has %s HP and %s AD", bigBoss.name, bigBoss.hp, bigBoss.attackDamage);

        require(player.hp > 0, "This character is dead :-(");

        require(bigBoss.hp > 0, "The boss was defeated already!");

        uint256 rand = getSeudoRandomNumber();

        bool isCritical = rand > criticalHitChance;

        uint realDamage = isCritical ? player.attackDamage * 2 : player.attackDamage;

        if (bigBoss.hp <= realDamage) {
            bigBoss.hp = 0;
        } else {
            bigBoss.hp -= realDamage;
        }

        if (player.hp <= bigBoss.attackDamage) {
            player.hp = 0;
        } else {
            player.hp -= bigBoss.attackDamage;
        }

        if (isCritical) {
            console.log("Critical hit! %s did %s damage to %s", player.name, realDamage, bigBoss.name);
        } 

        console.log("%s attacked Boss. New boss hp: %s", player.name, bigBoss.hp);
        console.log("Boss attacked player. New player hp: %s\n", player.hp);

        emit AttackCompleted(bigBoss.hp, player.hp, isCritical);
    }

    function userHasNFT() public view returns (CharacterAttributes memory) {
        uint256 tokenID = nftHolders[msg.sender];

        if (tokenID > 0) {
            return nftHolderAttributes[tokenID];
        }

        CharacterAttributes memory empty;
        return empty;
    }

    function getAllDefaultCharacters() public view returns (CharacterAttributes[] memory) {
        return defaultCharacters;
    }

    function getBigBoss() public view returns (BigBoss memory) {
        return bigBoss;
    }

    /*
    * Generate a Psuedo random number between 0 and 100
    */
    function getSeudoRandomNumber() internal returns (uint256) {
        uint result = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, seed))) % 100;
        seed = result + block.timestamp;
        return result;
    }

    function setCriticalHitChance(uint _criticalHitChance) public {
        require(msg.sender == owner, "Only the owner can set the critical hit chance");
        require(_criticalHitChance <= 100, "Critical hit chance must be between 0 and 100");
        criticalHitChance = _criticalHitChance;
    }
}