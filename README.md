<img width="1200" alt="Labs" src="https://user-images.githubusercontent.com/99700157/213291931-5a822628-5b8a-4768-980d-65f324985d32.png">

<p>
 <h3 align="center">Chainstack is the leading suite of services connecting developers with Web3 infrastructure</h3>
</p>

<p align="center">
  <a target="_blank" href="https://chainstack.com/build-better-with-ethereum/"><img src="https://github.com/soos3d/blockchain-badges/blob/main/protocols_badges/Ethereum.svg" /></a>&nbsp;  
  <a target="_blank" href="https://chainstack.com/build-better-with-bnb-smart-chain/"><img src="https://github.com/soos3d/blockchain-badges/blob/main/protocols_badges/BNB.svg" /></a>&nbsp;
  <a target="_blank" href="https://chainstack.com/build-better-with-polygon/"><img src="https://github.com/soos3d/blockchain-badges/blob/main/protocols_badges/Polygon.svg" /></a>&nbsp;
  <a target="_blank" href="https://chainstack.com/build-better-with-avalanche/"><img src="https://github.com/soos3d/blockchain-badges/blob/main/protocols_badges/Avalanche.svg" /></a>&nbsp;
  <a target="_blank" href="https://chainstack.com/build-better-with-fantom/"><img src="https://github.com/soos3d/blockchain-badges/blob/main/protocols_badges/Fantom.svg" /></a>&nbsp;
</p>

<p align="center">
  • <a target="_blank" href="https://chainstack.com/">Homepage</a> •
  <a target="_blank" href="https://chainstack.com/protocols/">Supported protocols</a> •
  <a target="_blank" href="https://chainstack.com/blog/">Chainstack blog</a> •
  <a target="_blank" href="https://docs.chainstack.com/quickstart/">Chainstack docs</a> •
  <a target="_blank" href="https://docs.chainstack.com/quickstart/">Blockchain API reference</a> • <br> 
  • <a target="_blank" href="https://console.chainstack.com/user/account/create">Start for free</a> •
</p>

# Generative music NFT minter tutorial [![using with dotenv-vault](https://badge.dotenv.org/using.svg?r=1)](https://www.dotenv.org/r/github.com/motdotla/dotenv?r=1)
This project contains all tutorial files from the [How to mint a generative music NFT with Chainstack IPFS Storage and Soundraw](https://docs.chainstack.com/docs/how-to-mint-generative-music-nft-with-chainstack-ipfs-storage-soundraw/) tutorial, originally published on the [Chainstack Developer Portal: Web3 [De]Coded](https://docs.chainstack.com/docs/web3-decoded-introduction).

## Project details
This repository contains scripts and contracts needed to create a new wallet, check its balance, compile an NFT contract, and mint music NFTs using generated metadata on the Ethereum network with [Chainstack IPFS Storage](https://chainstack.com/ipfs-storage/), [Soundraw](https://soundraw.io/), Hardhat and Web3js.

## Outcomes
* [Contract: Goerli](https://goerli.etherscan.io/address/0xDBcD1d3A3f21A54322110D45038f60e9B102CA71)
* [Token: Goerli](https://goerli.etherscan.io/token/0xdbcd1d3a3f21a54322110d45038f60e9b102ca71)
* [OpenSea 1: Goerli](https://testnets.opensea.io/assets/goerli/0xdbcd1d3a3f21a54322110d45038f60e9b102ca71/4)  
* [OpenSea 2: Goerli](https://testnets.opensea.io/assets/goerli/0xdbcd1d3a3f21a54322110d45038f60e9b102ca71/5)  
* [OpenSea 3: Goerli](https://testnets.opensea.io/assets/goerli/0xdbcd1d3a3f21a54322110d45038f60e9b102ca71/6)  

## Dependencies
* [Chainstack endpoint](https://console.chainstack.com/user/account/create)  
* [Soundraw API token](https://soundraw.io/)
* [Dotenv](https://github.com/motdotla/dotenv)  
* [Hardhat with Web3js](https://github.com/NomicFoundation/hardhat/tree/main/packages/hardhat-web3)  
* [OpenZeppelin contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)  
* [Axios](https://github.com/axios/axios)  
* [Form data](https://github.com/form-data/form-data)  
* [Canvas](https://github.com/Automattic/node-canvas)
* [Image data URI](https://github.com/DiegoZoracKy/image-data-uri)
* [Jdenticon](https://github.com/dmester/jdenticon)
* [Merge images](https://github.com/lukechilds/merge-images)
* [Random words](https://github.com/apostrophecms/random-words)
* [Text-to-image](https://github.com/bostrom/text-to-image)

## Usage
1. Clone or fork this repo to a preferred location by running in CLI:  

```
git clone https://github.com/chainstacklabs/generative-ai-music-nft-javascript.git
```

2. Install dependencies by running in CLI:  

```sh
npm ci  
```

3. Rename `.env.sample` to `.env` and fill in your endpoint URLs for each network, then your Chainstack and Etherscan API keys:  

```env
GOERLI="https://your-goerli-endpoint-here"
SEPOLIA="https://your-sepolia-endpoint-here"
MAINNET="https://your-mainnet-endpoint-here"
CHAINSTACK="Bearer y0urChainstackAPIkeyHer3"
ETHERSCAN="Y0URETHERSCANAPIKEYHER3"
SOUNDRAW="Bearer Y0urSoundrawAPIt0k3nHere=="
```

4. Generate a new wallet address key pair and fund it from the Chainstack $NETWORK faucet by running in CLI:  

```sh
npx hardhat run scripts/wallet.js --network $NETWORK  
```

5. Check wallet balance by running in CLI:  

```sh
npx hardhat run scripts/balance.js --network $NETWORK  
```

6. Deploy the NFT minter smart contract from the ABI & BIN files by running in CLI:  

```sh
npx hardhat run scripts/deploy.js --network $NETWORK  
```

7. Generate all media files and JSON metadata with Soundraw and other libraries by running in CLI:  

```sh
npx hardhat run scripts/generate.js  
```

8. Pin all media files and JSON metadata with Chainstack IPFS Storage by running in CLI:  

```sh
npx hardhat run scripts/pin.js  
```

9. Mint an NFT with the metadata from the pinned JSON file by running in CLI:  

```sh
npx hardhat run scripts/mint.js --network $NETWORK  
```

## Files
* .env.sample - Sample Dotenv file containing pre-formatted slots needed for key script variables
* contracts/MyFirstMusicNFT.sol - Smart contract supporting functions to mint NFTs with custom tokenURI
* src/ - Sample media files and metadata JSON you can use to test minting
* scripts/wallet.js - Script to generate a wallet address and key pair
* scripts/balance.js - Script to check the balance of a wallet address
* scripts/deploy.js - Script to deploy the NFT minter smart contract from the ABI & BIN files
* scripts/generate.js - Script to generate media files and metadata for the NFTs
* scripts/pin.js - Script to pin relevant media files and JSON metadata with Chainstack IPFS Storage
* scripts/mint.js - Script to mint an NFT with the metadata from pinned JSON metadata file
