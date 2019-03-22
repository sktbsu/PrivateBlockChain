//Importing levelSandbox class
const LevelSandboxClass = require('./levelSandbox.js');

// Creating the levelSandbox class object
const levelSandbox = new LevelSandboxClass.LevelSandbox();

const hex2ascii = require('hex2ascii')
/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');


/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
  constructor(data) {
    this.hash = "",
      this.height = 0,
      this.body = data,
      this.time = 0,
      this.previousBlockHash = ""
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {

  constructor() {
    this.getBlockHeight().then((height) => {
      if (height < 0) {
        console.log("Adding genesis block");
        this.addBlock(new Block("First block in the chain - Genesis block")).then(() => {
          console.log("Genesis block added Successfully")
        }).catch(err => console.log(err));
      }
    }).catch(err => console.log(err));
  }
  // Add new block
  async addBlock(newBlock) {

    let self = this;
    return new Promise(async function(resolve, reject) {
      try {
        // Block height
        let height = await self.getBlockHeight();
        newBlock.height = height + 1;
        console.log(`The Height of the blockchain is: ${height}`);

        // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0, -3);
        // previous block hash
        if (newBlock.height > 0) {
          newBlock.previousBlockHash = JSON.parse(await self.getBlock(height)).hash;
        }

        // Block hash with SHA256 using newBlock and converting to a string
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        console.log(`The value of block addedinitially: ${newBlock.hash}`);
        // Adding block object to chain

        let result = await levelSandbox.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString());
        console.log(`The value of block added: ${result}`);
        resolve((result));
      } catch (err) {
        console.log("Failed to AddBlock" + "Error " + err);
        reject(err);
      }
    });
  }

  // Get data from levelDB with key
  getBlock(key) {
    // Because we are returning a promise, we will need this to be able to reference 'this' inside the Promise constructor
    return new Promise(function(resolve, reject) {
      levelSandbox.db.get(key, function(err, value) {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  }

  getBlockbyHash(hash) {
    let block = null;
    return new Promise(function(resolve, reject) {
      levelSandbox.db.createReadStream().on('data', function(data) {
        if (JSON.parse(data.value).hash === hash) {
          let decodedData = JSON.parse(data.value);
          console.log(decodedData);
          decodedData.body.star.storyDecoded = hex2ascii(decodedData.body.star.story);
          block = decodedData;
          resolve(block);
        }
      }).on('error', function(err) {
        reject("Error -> fail to get block by hash");
      }).on('close', function() {
        if (block === null) {
          resolve("Block Not present");
        } else {
          resolve(block);
        }
      });
    });
  }

  getBlockbyAddress(address) {
    let block = [];
    return new Promise(function(resolve, reject) {
      levelSandbox.db.createReadStream().on('data', function(data) {
        if (JSON.parse(data.value).body.address === address) {
          let decodedData = JSON.parse(data.value);
          decodedData.body.star.storyDecoded = hex2ascii(decodedData.body.star.story);
          block.push(decodedData);
        }
      }).on('error', function(err) {
        reject("Error -> fail to get block by hash");
      }).on('close', function() {
        if (block === undefined) {
          resolve("Block not present");
        } else {
          resolve(block);
        }
      });
    });
  }

  //Not used
  //Length of BlockChain
  getBlockHeight() {
    let height = 0;
    // Add your code here
    return new Promise(function(resolve, reject) {
      levelSandbox.db.createReadStream().on('data', function(data) {
        height++;
      }).on('error', function(err) {
        reject("fail");
        // reject with error
      }).on('close', function() {
        resolve(height - 1);
        //resolve with the count value
      });
    });
  }

  //Not used
  //validate block
  async validateBlock(blockHeight) {
    let self = this;
    return new Promise(async function(resolve, reject) {
      try {
        // get block object
        let block = JSON.parse(await self.getBlock(blockHeight));

        // get block hash
        let blockHash = block.hash;

        // remove block hash to test block integrity
        block.hash = '';
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        // Compare
        if (blockHash === validBlockHash) {
          resolve("Block Validation Successful. Block Id:" + blockHeight);
        } else {
          reject('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
        }
      } catch (err) {
        reject("Failed to validate Block. Block Id:" + blockHeight + " Error " + err);
      }
    });
  }

  //Not used
  // Validate blockchain
  async validateChain() {
    let errorLog = [];
    let self = this;
    return new Promise(async function(resolve, reject) {
      let height = await self.getBlockHeight();
      for (var i = 0; i <= height; i++) {
        try {
          // validate block
          await self.validateBlock(i);
          if (i !== height) {
            // compare blocks hash link
            let blockHash = JSON.parse(await self.getBlock(i)).hash;
            let previousHash = JSON.parse(await self.getBlock(i + 1)).previousBlockHash;

            if (blockHash !== previousHash) {
              errorLog.push(i);
            }
          }
        } catch (err) {
          console.log("Failed to validate Block Chain. Block Id:" + i + "Error " + err);
          errorLog.push(i);
        }
      }
      if (errorLog.length > 0) {
        reject('Blocks: ' + errorLog + "Error length: " + errorLog.length);
      } else {
        resolve('No errors detected. Validate Block Chain Successful');
      }
    });
  }
}

module.exports.Blockchain = Blockchain;
module.exports.Block = Block;
