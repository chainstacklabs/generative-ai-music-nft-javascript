// Process dependencies
require('dotenv').config();
require("@nomiclabs/hardhat-web3");
const fs = require('fs');
const path = require('path');

// Initialize your wallet address and private key
const address = process.env.WALLET;
const privKey = process.env.PRIVATE_KEY;

// Initialize your deployed smart contract address for the selected network
let contractAdrs;
if (network.name == 'sepolia') {
  const contractENV = process.env.SEPOLIA_CONTRACT
  contractAdrs = contractENV;
} else if (network.name == 'goerli') {
  const contractENV = process.env.GOERLI_CONTRACT;
  contractAdrs = contractENV;
} else {
  const contractENV = process.env.MAINNET_CONTRACT;
  contractAdrs = contractENV;
}

// Replace 'MyFirstMusicNFT' with your contract's name.
const contractName = 'MyFirstMusicNFT';

// Find the compiled smart contract to get the ABI
const artifactPath = path.resolve(__dirname, `../artifacts/contracts/${contractName}.sol/${contractName}.json`);
const contractArtifact = JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));
const contractABI = contractArtifact.abi;

// Load metadata URLs from file
const metadataUrls = require('../src/output/metadataURLs.json');

// Create a new contract object and set interactions origin to the owner address
const contractObj = new web3.eth.Contract(contractABI, contractAdrs, {
  from: address,
});

// Define the minting function
const startMint = async () => {
  console.log(`\nAttempting to mint on ${network.name} to: ${address}...\n`);

  // Create an array to store all transaction URLs
  let txUrls = [];

  // Get the current transaction count, which will serve as the initial nonce
  let nonce = await web3.eth.getTransactionCount(address);

  // Iterate over each metadata URL to mint NFT
  for (const metadata of metadataUrls) {

    // Estimate the gas costs needed to process the transaction
    const gasCost = await contractObj.methods.safeMint(address, metadata).estimateGas((err, gas) => {
      if (!err) console.log(`Estimated gas: ${gas} for metadata: ${metadata}\n`);
      else console.error(`Error estimating gas: ${err} for metadata: ${metadata}\n`);
    });

    // Define the transaction details and sign it
    const mintTX = await web3.eth.accounts.signTransaction(
      {
        from: address,
        to: contractAdrs,
        data: contractObj.methods.safeMint(address, metadata).encodeABI(),
        gas: gasCost,
        nonce: nonce, 
      },
      privKey,
    );

    // Get transaction receipt
    const createReceipt = await web3.eth.sendSignedTransaction(mintTX.rawTransaction);

    // Provide appropriate network for Etherscan link
    let etherscanUrl;
    if (network.name !== 'mainnet') {
      etherscanUrl = `https://${network.name}.etherscan.io/tx/${createReceipt.transactionHash}`;
      console.log(`NFT successfully minted on ${network.name} with hash: ${createReceipt.transactionHash}\n\nView the transaction on Etherscan: ${etherscanUrl}\n`);
    } else {
      etherscanUrl = `https://etherscan.io/tx/${createReceipt.transactionHash}`;
      console.log(`NFT successfully minted on ${network.name} with hash: ${createReceipt.transactionHash}\n\nView the transaction on Etherscan: ${etherscanUrl}\n`);
    }

    // Push the transaction URL to the array
    txUrls.push(etherscanUrl);

    // Increment the nonce for the next transaction
    nonce++;

    // Wait before the next mint
    console.log(`Allowing time for network propagation...`);
    await new Promise((resolve) => setTimeout(resolve, 22222));
  }

  // Write all the transaction URLs to the JSON file
  console.log(`Writing transaction URLs to ./src/output/mintTXs.json...\n`);
  fs.writeFileSync('./src/output/mintTXs.json', JSON.stringify(txUrls, null, 2));
};

// Don't forget to run the main function!
startMint();

