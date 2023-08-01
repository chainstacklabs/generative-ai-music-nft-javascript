// Process dependencies
require('dotenv').config();
require("@nomiclabs/hardhat-web3");

const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const https = require('https');
const randomWords = require('random-words'); // 1.3.0
const textToImage = require('text-to-image'); 
const jdenticon = require('jdenticon');
const { Canvas, Image } = require('canvas');
const ImageDataURI = require('image-data-uri');
const mergeImages = require('merge-images');
const axios = require('axios');

// Load environment variables
const address = process.env.WALLET;
const soundraw = process.env.SOUNDRAW;

// Initialize generation parameters
let randomHex;
let randomStr;
let wordNrs;
let digiRoot;
let wordsOut = '';
let colorHex = '#';
let bgColorHex = '#';
let shapeSides = '';
let shapeSize = '';
let shapeCtrX = '';
let shapeCtrY = '';
let shapeStroke = '#';
let shapeFill = '#';
let idHex = '';

// Soundraw parameters
const moods = ["Angry", "Busy & Frantic", "Dark", "Dreamy", "Elegant", "Epic", "Euphoric", "Fear", "Funny & Weird", "Glamorous", "Happy", "Heavy & Ponderous", "Hopeful", "Laid back", "Mysterious", "Peaceful", "Restless", "Romantic", "Running", "Sad", "Scary", "Sentimental", "Sexy", "Smooth", "Suspense"];
const genres = ["Acoustic", "Hip Hop", "Beats", "Funk", "Pop", "Drum n Bass", "Trap", "Tokyo night pop", "Rock", "Latin", "House", "Tropical House", "Ambient", "Orchestra", "Electro & Dance", "Electronica", "Techno & Trance"];
const themes = ["Ads & Trailers", "Broadcasting", "Cinematic", "Corporate", "Comedy", "Cooking", "Documentary", "Drama", "Fashion & Beauty", "Gaming", "Holiday season", "Horror & Thriller", "Motivational & Inspiring", "Nature", "Photography", "Sports & Action", "Technology", "Travel", "Tutorials", "Vlogs", "Wedding & Romance", "Workout & Wellness"];
const length = 77
const fileFormat = "mp3";
const tempo = ["low", "normal", "high"];
const energyLevels = ["Low", "Medium", "High", "Very High"];

const generator = async() => {

    // Random generator layer 0: Seed preparations
    console.log('\nSeed generation started...\n');

    // Generate random hex with 20 bytes for symbols (same as wallet addresses)
    randomHex = web3.utils.randomHex(20).concat(address.slice(2));
    console.log('Random hex generated: ' + randomHex + '\n');

    // Generate ids for filenames to organize easier
    idHex = randomHex.slice(2, 5).concat(randomHex.slice(79, 82))
    console.log('Used hex to generate ID: ' + idHex + '\n');

    // Generate random hex color value by picking random characters from the generated hex string
    for (var i = 0; i < 6; i++) {
        colorHex = colorHex.concat(randomHex.slice(2).charAt(Math.floor(Math.random() * randomHex.slice(2).length)));
        bgColorHex = bgColorHex.concat(randomHex.slice(2).charAt(Math.floor(Math.random() * randomHex.slice(2).length)));
    }
    console.log('Used hex to generate text color: ' + colorHex + ' & background color: ' + bgColorHex + '\n');

    // Generate new string by combining the random hex output with wallet address and converting it to number string
    wordNrs = web3.utils.hexToNumberString(randomHex);
    console.log('Transformed hex into number string: ' + wordNrs + '\n');

    // Select Soundraw parameters based on the wordNrs number string
    let categories = [moods, genres, themes, tempo];
    let categoryNames = ['Mood', 'Genre', 'Theme', 'Tempo'];
    let numberOfTimeframes = 3;

    let requestPayload = {};

    // Create a loop to generate a random index for the current category
    for (let i = 0; i < 4; i++) {

        // Create an array that will hold the randomIndex value for each iteration of the following loop
        let randomIndices = []

        // Iterate loop three times to reach all possible options with double-digit values
        for (let index = 0; index < 3; index++) {
            randomIndices[index] = parseInt(0 + wordNrs.charAt(Math.floor(Math.random() * wordNrs.length)))
        }

        // Sum the results from each iteration abd make sure they match the category length 
        let randomIndex = randomIndices.reduce((a, b) => a + b, 0);
        if (randomIndex >= categories[i].length) {
            randomIndex = parseInt(0 + wordNrs.charAt(Math.floor(Math.random() * wordNrs.length)))
            if (randomIndex >= categories[i].length || randomIndex < 0) {
                randomIndex = 0
            }
        } else if (randomIndex < 0) {
            randomIndex = parseInt(0 + wordNrs.charAt(Math.floor(Math.random() * wordNrs.length)))
            if (randomIndex >= categories[i].length || randomIndex < 0) {
                randomIndex = 0
            }
        }

        let categorySelected = categories[i][randomIndex];

        if (categoryNames[i] !== 'Tempo') {
            requestPayload[categoryNames[i].toLowerCase()] = categorySelected;
        } else {
            requestPayload.tempo = categorySelected;
        }
    }

    // Create arrays for holding the energy level objects and their lengths 
    let energyLevelsArray = []; 

    let lengths = [];
    for (let j = 0; j < numberOfTimeframes - 1; j++) {
        lengths.push(Math.random());
    }
    lengths.sort();

    // Adjust the lengths so they are proportional and add up to the audio length accordingly
    let previous = 0;
    for (let j = 0; j < numberOfTimeframes; j++) {
        lengths[j] = lengths[j] * length - previous;
        previous = lengths[j];
        lengths[j] = parseFloat(lengths[j].toFixed(1));
    }

    let currentTime = 0;

    // Generate different energy levels for different timeframes
    for (let j = 0; j < numberOfTimeframes; j++) {
        let energyStart = parseFloat(currentTime.toFixed(1));
        let energyEnd = j < numberOfTimeframes - 1 ? parseFloat((currentTime + lengths[j]).toFixed(1)) : length;
        currentTime = energyEnd;

        // Apply the same logic as for randomIndex previously without the tripple iteration
        let randomEnergyIndex
            randomEnergyIndex = parseInt(0 + wordNrs.charAt(Math.floor(Math.random() * wordNrs.length)))
            if (randomEnergyIndex >= energyLevels.length) {
                randomEnergyIndex = parseInt(0 + wordNrs.charAt(Math.floor(Math.random() * wordNrs.length)))
                if (randomEnergyIndex >= energyLevels.length || randomEnergyIndex < 0) {
                    randomEnergyIndex = 0
                }
            } else if (randomEnergyIndex < 0) {
                randomEnergyIndex = parseInt(0 + wordNrs.charAt(Math.floor(Math.random() * wordNrs.length)))
                if (randomEnergyIndex >= energyLevels.length || randomEnergyIndex < 0) {
                    randomEnergyIndex = 0
                }
            }

        let selectedEnergy = energyLevels[randomEnergyIndex];

        energyLevelsArray.push({
            start: energyStart,
            end: energyEnd,
            energy: selectedEnergy
        });
    }

    // Update the request payload
    requestPayload.energy_levels = energyLevelsArray; 
    requestPayload.length = length;
    requestPayload.file_format = fileFormat;

    // Print selected parameters and make them the audio filename
    let filename = `${idHex} ${requestPayload.mood} ${requestPayload.genre} ${requestPayload.theme} ${requestPayload.tempo} [${length}s].mp3`;

    // Submit an axios request to the Soundraw API and fetch the audio file
    console.log(`Attempting to submit request to Soundraw API with parameters ${JSON.stringify(requestPayload, null, 2)}\n`);
    axios({
        method: 'post',
        url: 'https://soundraw.io/api/v2/musics/compose',
        data: requestPayload,
        headers: {
            "Content-Type": "application/json",
            "Authorization": soundraw
        }
    })
        .then(async function (response) {
            const audioFilePath = path.join('audio', filename);
            console.log(`Soundraw request successful. Response: ${JSON.stringify(response.data)}`);
            const formattedAudioFilePath = './src/' + audioFilePath.replace(/\\/g, "/"); // replace backslashes with forward slashes
            const file = fs.createWriteStream(path.join(__dirname, '../src', audioFilePath));
            const request = https.get(response.data.mp3_url, function (response) {
                response.pipe(file).on('finish', async function () {
                    // Call the function to update the JSON file
                    try {
                        console.log(`\nSoundraw audio saved to: ${formattedAudioFilePath}`);
                        await updateLocalMetadata(idHex, mergePath, formattedAudioFilePath, wordsOut, colorHex, digiRoot, requestPayload, length);
                    } catch (err) {
                        console.error(err);
                    }
                });
            });
            request.on('error', (err) => {
                console.error(`Request error: ${err}`);
                file.end();
            });
            file.on('error', (err) => {
                console.error(`File error: ${err}`);
                file.end();
            });
        })
        .catch(function (error) {
            console.log(error);
        });

    // Begin calculations for random shape layer generation parameters

    // Randomize shape parameters but ensure they are never zero

    // Find out the number of sides the shape has by picking a random number from the number string 
    shapeSides = parseInt(1 + wordNrs.charAt(Math.floor(Math.random() * wordNrs.length)));
    console.log('Used number string to determine polygon shape sides count: ' + shapeSides + '\n');

    // Combine the first three digits of one of the two hex color values picked earlier with the last three of the other for greater variation
    shapeStroke = shapeStroke.concat(colorHex.slice(4, 7).concat(bgColorHex.slice(1, 4)));
    shapeFill = shapeFill.concat(bgColorHex.slice(4, 7).concat(colorHex.slice(1, 4)));
    console.log('Used text & background colors to generate new border: ' + shapeStroke + ' & fill: ' + shapeFill + '\n');

    // Loop following calculations twice to generate double or higher digit values for the shape
    for (var i = 0; i < 2; i++) {

        // Avoid negative results by converting result to absolute value

        // Pick a random digit from the number string earlier, add the current shapeSize value, serve as float, multiply by Pi and add 10 for sizes between ~50 and ~150 for greater balance
        shapeSize = Math.abs(10 + Math.PI * parseFloat(shapeSize + parseInt(wordNrs.charAt(Math.floor(Math.random() * wordNrs.length)))));

        // Same as above except you substract 100 instead of adding 10. This will make the shape roll around the middle
        shapeCtrX = Math.abs(Math.PI * parseFloat(shapeCtrX + parseInt(wordNrs.charAt(Math.floor(Math.random() * wordNrs.length)))) - 100);
        shapeCtrY = Math.abs(Math.PI * parseFloat(shapeCtrY + parseInt(wordNrs.charAt(Math.floor(Math.random() * wordNrs.length)))) - 100);
    }

    console.log('Used number string to determine polygon shape size: ' + shapeSize + ' X-axis center value: ' + shapeCtrX + ' & Y-axis center value: ' + shapeCtrY + '\n');


    // Reduce number string to single digit with the digital root formula
    function digitalRoot(input) {
        var nrStr = input.toString(),
            i,
            result = 0;

        if (nrStr.length === 1) {
            return +nrStr;
        }
        for (i = 0; i < nrStr.length; i++) {
            result += +nrStr[i];
        }
        return digitalRoot(result);
    }

    // Print digital root result
    digiRoot = digitalRoot(wordNrs);
    console.log('Calculated digital root of number string: ' + digiRoot + '\n');

    // Check if result is odd or even
    function NrChk(nr) {
        return nr % 2;
    }

    console.log('Checking if digital root is odd or even: ' + NrChk(digiRoot) + '\n');

    if (NrChk(digiRoot) > 0) {
        console.log('Generating 3 random words - digital root is odd\n');
    } else {
        console.log('Generating 2 random words - digital root is even\n');
    }
  
    // Random generator layer 1: Text

    // Generate set of random words - 2 for even 3 for odd. Since result will always be 0 or 1 easiest and fastest way is to just add 2. Replace "," with space for natural appeal
    randomStr = (randomWords(NrChk(digiRoot) + 2).toString()).split(',');
    console.log('Random words generated are: ' + randomStr + '\n');

    // Capitalize word set and join them as single string
    for (var i = 0; i < randomStr.length; i++) {
        randomStr[i] = (randomStr[i].charAt(0)).toUpperCase() + randomStr[i].slice(1);
    }
    wordsOut = randomStr.join(' ');
    
    console.log('Capitalizing random words string: ' + wordsOut + '\n');

    // Generate image from the random words, while using the library's debug mode to render to file
    var textPath = './src/texts/' + idHex + ' ' + wordsOut + ' ' + colorHex + ' [Text Layer].png';
    console.log('Exporting random words string as image to: ' + textPath + '\n');
    const dataUri = await textToImage.generate(idHex + ' ' + wordsOut, {
        debug: true,
        debugFilename: textPath,
        maxWidth: 330,
        customHeight: 33,
        fontSize: 18,
        fontFamily: 'Arial',
        lineHeight: 22,
        margin: 5,
        bgColor: bgColorHex,
        textColor: colorHex,
        textAlign: 'center',
        verticalAlign: 'top',
    });

    // Random generator layer 2: Icon

    // Set icon parameters
    var iconSize = 350;
    var iconSeed = wordsOut;

    // Export icon to png
    const iconExport = jdenticon.toPng(iconSeed, iconSize);
    var iconPath = './src/icons/' + idHex + ' ' + wordsOut + ' ' + colorHex + ' [Icon Layer].png';
    
    console.log('Using random words string as seed to generate icon at: ' + iconPath + '\n');

    fs.writeFileSync(iconPath, iconExport);

    // Random generator Layer 3: Shape

    // Create new canvas object and set the context to 2d
    const shapeCanvas = new Canvas(350, 350);
    const shapeContext = shapeCanvas.getContext('2d');

    // Start drawing path on canvas
    console.log('Using polygon settings to draw path points & paint shape...\n');
    shapeContext.beginPath();

    // Pick four incomprehensively generated points for the drawing path. Feel free to play around with the formula until you get desireable results
    shapeContext.moveTo(shapeCtrX + shapeSize * (Math.floor(Math.random() * 100 * Math.cos(shapeSides))), shapeCtrY + shapeSize * (Math.floor(Math.random() * 10 * Math.sin(shapeSides * shapeSize))), shapeCtrX + shapeSize * (Math.floor(Math.random() * 1000 * Math.tan(shapeCtrY * shapeSides))), shapeCtrY + shapeSize * (Math.floor(Math.random() * (1 / Math.tan(shapeCtrX * shapeSides)))));

    // Connect the path points according to randomly picked number of sides for the polygon
    for (var i = 1; i <= shapeSides; i++) {
        shapeContext.lineTo(shapeCtrX + shapeSize * Math.cos(i * 2 * Math.PI / shapeSides), shapeCtrY + shapeSize * Math.sin(i * 2 * Math.PI / shapeSides));
    }

    // Close drawing path to complete the drawn object then proceed with applying border width and color, as well as fill color
    shapeContext.closePath();
    shapeContext.strokeStyle = shapeStroke;
    shapeContext.fillStyle = shapeFill;
    shapeContext.fill();
    shapeContext.lineWidth = shapeSides;
    shapeContext.stroke();

    // Record shape data URI to image buffer then render to preferred path
    const shapeBuffer = shapeCanvas.toBuffer("image/png");
    var shapePath = './src/shapes/' + shapeSides + ' ' + shapeStroke + '.png';
    console.log('Exporting polygon shape as image to: ' + shapePath + '\n');
    fs.writeFileSync(shapePath, shapeBuffer);

    // Merge existing layers by combining them in image buffer as data URI then output to file
    var mergePath = './src/merged/' + idHex + ' ' + wordsOut + ' ' + colorHex + ' [Merged].png';
    console.log('Merging all layers & exporting image to: ' + mergePath + '\n');
    mergeImages([shapePath, iconPath, textPath], {
        Canvas: Canvas,
        Image: Image
    }).then(function(response) {
        ImageDataURI.outputFile(response, mergePath)
    });

    // Create a JSON with the locations of each generated set of media metadata 
    const updateLocalMetadata = async (idHex, coverPath, audioPath, wordsOut, colorHex, digiRoot, requestPayload, length) => {

        console.log(`\nAttempting to create JSON with local metadata details...`);

        const filePath = path.join(__dirname, '../src/output/local-metadata.json');

        try {
            const data = await fsPromises.readFile(filePath, 'utf8');

            // If the file exists, parse its content, add the new object, and write it back to the file
            const json = data ? JSON.parse(data) : {};
            json[idHex] = {
                name: `${idHex}: ${wordsOut}`,
                description: `A generative music NFT created with metadata seeds. Words: ${wordsOut}, Color: ${colorHex}, Digital Root: ${digiRoot}, Mood: ${requestPayload.mood}, Genre: ${requestPayload.genre}, Theme: ${requestPayload.theme}, Tempo: ${requestPayload.tempo}, Length: [${length}s]`,
                cover: coverPath,
                audio: audioPath
            };
            await fsPromises.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8');

            console.log(`\nLocal metadata JSON created at ${filePath}...\n`);

        } catch (err) {
            if (err.code === 'ENOENT') {

                // If the file doesn't exist, initialize it as an empty object
                await fsPromises.writeFile(filePath, JSON.stringify({
                    [idHex]: {
                        name: `${idHex}: ${wordsOut}`,
                        description: `A generative music NFT created with metadata seeds. Words: ${wordsOut}, Color: ${colorHex}, Digital Root: ${digiRoot}, Mood: ${requestPayload.mood}, Genre: ${requestPayload.genre}, Theme: ${requestPayload.theme}, Tempo: ${requestPayload.tempo}, Length: [${length}s]`,
                        cover: coverPath,
                        audio: audioPath
                    }
                }, null, 2), 'utf8');

                console.log(`\nLocal metadata JSON created at ${filePath}...\n`);

            } else {
                throw err;
            }
        }
    };
};

// Don't forget to run the entire process!
generator();