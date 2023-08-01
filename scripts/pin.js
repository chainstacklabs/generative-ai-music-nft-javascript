// Process dependencies
require('dotenv').config();
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Define the media files to be pinned
async function generateContent() {
  const data = await fsPromises.readFile(path.join(__dirname, '../src/output/local-metadata.json'), 'utf8');
  const json = JSON.parse(data);

  let allContent = [];

  for (const key in json) {
    if (json.hasOwnProperty(key)) {
      const element = json[key];
      const content = [];

      const coverTitle = path.basename(element.cover);
      const audioTitle = path.basename(element.audio);
      const tokenTitle = element.name;
      const tokenDescr = element.description;

      content.push({
        file: fs.createReadStream(path.join(__dirname, '..', element.cover)),
        title: coverTitle
      });

      content.push({
        file: fs.createReadStream(path.join(__dirname, '..', element.audio)),
        title: audioTitle
      });

      allContent.push({
        content: content,
        tokenTitle: tokenTitle,
        tokenDescr: tokenDescr
      });
    }
  }

  return allContent;
}

// Define a function to pin files with Chainstack IPFS Storage
const addFiles = async (source, single = false) => {
  const url = single ? "https://api.chainstack.com/v1/ipfs/pins/pinfile"
    : "https://api.chainstack.com/v1/ipfs/pins/pinfiles";
  const pubIDs = [];
  const maxRetries = 7;
  const retryTimeout = 22222;

  for (let file of source) {
    let retries = 0;

    while (retries < maxRetries) {
      try {
        console.log(`Attempting to pin ${file.title} with Chainstack IPFS Storage... Attempt number: ${retries + 1}\n`);

        const data = new FormData();
        data.append('bucket_id', process.env.BUCKET_ID);
        data.append('folder_id', process.env.FOLDER_ID);
        data.append('file', file.file);
        data.append('title', file.title);

        const config = {
          method: 'POST',
          url: url,
          headers: {
            "Content-Type": 'multipart/form-data;',
            "Authorization": process.env.CHAINSTACK,
            ...data.getHeaders()
          },
          data: data
        };

        const response = await axios(config);

        let id;
        if (single) {
          console.log(`Successfully pinned ${file.title} with Chainstack IPFS Storage using public ID: ${JSON.stringify(response.data.id)}\n`);
          id = response.data.id;
          id = Array.isArray(id) ? id : [id];
        } else {
          console.log(`Successfully pinned ${file.title} with Chainstack IPFS Storage using public ID: ${JSON.stringify(response.data[0].id)}\n`);
          id = response.data[0].id;
        }

        pubIDs.push(id);

        // If successful, break the loop
        break;
      } catch (error) {
        console.error(`Error in addFiles: ${error.message}.. Attempting to retry...\n`);

        // Retry after the timeout if unsuccessful
        retries++;
        console.log(`Retrying after error. Current retry count is: ${retries}`);
        await new Promise((resolve) => setTimeout(resolve, retryTimeout));

        // If max retries is reached and still failing, throw the error
        if (retries === maxRetries) {
          throw new Error(`Failed after ${maxRetries} attempts. ${error.message}`);
        }
      }
    }
  }

  return pubIDs;
};



// Define a function to find CIDs for files pinned with Chainstack IPFS Storage
const findCIDs = async (fileID, single = false) => {
  if (single) {
    fileID = fileID.replace(/"/g, '');
    fileID = Array.isArray(fileID) ? fileID : [fileID];

  }

  // Define the maximum retries and the timeout between retries
  const maxRetries = 7;
  const retryTimeout = 22222;

  if (!single) {
    let cid = [];
    let name = [];

    // Loop through all the pinned files
    for (var i = 0; i < fileID.length; i++) {

      // Get the CID and filename for the file
      const result = await findCIDs(fileID[i], true);
      cid.push(result[0]);
      name.push(result[1]);
    }

    // Print the CIDs found and return the cid and name values
    console.log(`All CIDs found: ${cid.join(', ')}\n`);
    return [cid, name];
  } else {
    let cid;
    let name;
    let retries = 0;

    // Set up the retry loop
    while (retries < maxRetries) {
      try {
        console.log(`Attempting to find CID using public ID: ${fileID} with Chainstack IPFS Storage...\n`);

        // Define the Axios configuration
        const url = "https://api.chainstack.com/v1/ipfs/pins/" + fileID;
        var config = {
          method: 'GET',
          url: url,
          headers: {
            "Content-Type": 'text/plain',
            "Authorization": process.env.CHAINSTACK,
            "Accept-Encoding": 'identity',
          },
          decompress: false 
        };

        // Store the Axios response
        const response = await axios(config);
        console.log(`CID found: ${response.data.cid} Filename: ${response.data.title}\n`);

        cid = response.data.cid;
        name = response.data.title;

        // Throw an error if the cid and name values are not valid
        if (cid != null && cid !== 'error' && name != null && name !== 'error') {
          break;
        } else {

          // Throw an error if the CID and filename are not valid
          throw new Error('CID or name values are not valid.');
        }
      } catch (error) {
        console.error(`Error in findCIDs: ${error.message}.. Attempting to retry...\n`);

        // Retry after the timeout if unsuccessful
        retries++;
        await new Promise((resolve) => setTimeout(resolve, retryTimeout));
      }
    }
    return [cid, name];
  }
};

// Define a function to write the metadata to a .json file
const writeJSON = async (pinCID, pinName, tokenTitle, tokenDescr) => {
  let audioIPFS;
  let coverIPFS;
  if (pinCID && pinName) {
    for (var i = 0; i < pinName.length; i++) {
      if (pinName[i].includes('mp3')) {
        audioIPFS = "https://ipfsgw.com/ipfs/" + pinCID[i];
      } else {
        coverIPFS = "https://ipfsgw.com/ipfs/" + pinCID[i];
      }
    }

    // Write the metadata to the file ./src/NFTmetadata.json
    fs.writeFileSync(`./src/jsons/${tokenTitle.replace(/:/g, '')}.json`, JSON.stringify({
      "description": tokenDescr,
      "external_url": "https://chainstack.com/nfts/",
      "image": coverIPFS,
      "animation_url": audioIPFS,
      "name": tokenTitle
    }));

    let jsonMeta;
    if (fs.existsSync(`./src/jsons/${tokenTitle.replace(/:/g, '')}.json`)) {
      jsonMeta = {
        file: fs.createReadStream(`./src/jsons/${tokenTitle.replace(/:/g, '')}.json`),
        title: `${tokenTitle.replace(/:/g, '')}.json`
      };
    }
    return jsonMeta;
  }
};

// Define the main function that executes all necessary functions to pin the NFT metadata
const pinNFT = async () => {
  try {

    // Generate the content from local metadata file
    const allNFTs = await generateContent();

    // Initialize array to store the pinned metadata urls
    let nftURLs = [];

    for (let nft of allNFTs) {
      const { content, tokenTitle, tokenDescr } = nft;
      let pinCIDs = [];
      let pinNames = [];

      // Ensure all files for this entry are pinned before moving on to the next
      for (let file of content) {
        const ids = await addFiles([file]);
        await new Promise((resolve) => setTimeout(resolve, 22222));

        const [pinCID, pinName] = await findCIDs(ids);
        pinCIDs.push(pinCID[0]);
        pinNames.push(pinName[0]);
        await new Promise((resolve) => setTimeout(resolve, 22222));
      }

      const jsonMeta = await writeJSON(pinCIDs, pinNames, tokenTitle, tokenDescr);
      await new Promise((resolve) => setTimeout(resolve, 22222));

      const id = await addFiles([jsonMeta]);
      await new Promise((resolve) => setTimeout(resolve, 22222));

      const jsonCID = await findCIDs(id);
      console.log(`NFT metadata for ${tokenTitle} successfully pinned with Chainstack IPFS Storage!\n`);

      // Add the metadata URL to the nftURLs array
      nftURLs.push(`https://ipfsgw.com/ipfs/${jsonCID[0]}`);
    }

    // Write the metadata URLs to JSON 
    console.log(`Writing metadata URL to ./src/output/metadataURLs.json...\n`);
    fs.writeFileSync('./src/output/metadataURLs.json', JSON.stringify(nftURLs, null, 2));
  } catch (error) {
    console.error(`Error during NFT pinning: ${JSON.stringify(error)}`);
  }
};

// Don't forget to run the main function!
pinNFT();
