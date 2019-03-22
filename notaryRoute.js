var HashMap = require('hashmap');
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');
const TimeoutRequestsWindowTime = 60 * 5 * 1000;
const blockChainClass = require('./simpleChain.js');
const blockChain = new blockChainClass.Blockchain();
const hex2ascii = require('hex2ascii');
var Web3 = require('web3');


class MemoryPool {
  constructor(timestamp, signature) {
    this.timestamp = timestamp,
      this.signature = signature
  }
}

class Notary {
  constructor(app) {
    this.app = app;
    this.mempool = new HashMap();
    this.requestValidation();
    this.addStar();
    this.signatureValidation();
    this.getBlock();
    this.getBlockByHash();
    this.getBlockByAddress();
  }

  requestValidation() {
    this.app.post("/requestValidation", (req, res) => {
      let address = req.body.address.trim();
      let self = this;
      if (address !== null || address !== "") {
        let timestamp = new Date().getTime().toString().slice(0, -3);
        if (this.mempool.get(address) === undefined) {
          this.mempool.set(address, new MemoryPool(timestamp, false));
          setTimeout(function() {
            self.mempool.delete(address);
          }, TimeoutRequestsWindowTime);
        }
        timestamp = this.mempool.get(address).timestamp;
        let requestObject = this.RequestObject(address, timestamp);
        requestObject.validationWindow = this.validateWindow(timestamp)
        res.send(requestObject);
      } else {
        res.send("Invalid Input");
      }
    });
  }


  RequestObject(address, timestamp) {
    let requestObject = {
      "walletAddress": address,
      "requestTimeStamp": timestamp,
      "message": address + ":" + timestamp + ":" + "starRegistry",
      "validationWindow": 300
    }
    return requestObject;
  }

  ValidRequestObject(address, timestamp) {
    let validRequest = {
      "registerStar": true,
      "status": {
        "address": address,
        "requestTimeStamp": timestamp,
        "message": address + ":" + timestamp + ":" + "starRegistry",
        "validationWindow": this.validateWindow(timestamp),
        "messageSignature": true
      }
    }
    return validRequest;
  }

  signatureValidation() {
    this.app.post("/message-signature/validate", (req, res) => {
      let address = req.body.address.trim();
      let signature = req.body.signature.trim();
      if (this.mempool.get(address) !== undefined) {
        if (this.validateRequestByWallet(address, signature)) {
          let validrequest = this.ValidRequestObject(address, this.mempool.get(address).timestamp);
          this.mempool.get(address).signature = true;
          res.send(validrequest);
        } else {
          res.send("Error : Signature not valid");
        }
      } else {
        res.send("Error : -> Address not present in mempool");
      }
    });
  }

  validateRequestByWallet(address, signature) {
    try {
      let timestamp = this.mempool.get(address).timestamp;
      let message = address + ":" + timestamp + ":" + "starRegistry";
      let isValid = bitcoinMessage.verify(message, address, signature);
      return isValid;
    } catch (err) {
      console.log("Error -> While verifying signature");
      return false;
    }
  }

  validateWindow(timestamp) {
    let timeElapse = (new Date().getTime().toString().slice(0, -3)) - timestamp;
    let timeLeft = (300) - timeElapse;
    return timeLeft;
  }

  createBody(address, star) {
    let body = {
      address: address,
      star: {
        ra: star.ra,
        dec: star.dec,
        mag: star.mag,
        cen: star.cen,
        story: Buffer.from(star.story).toString('hex')
      }
    };
    return body;
  }

  addStar() {
    this.app.post("/block", async (req, res) => {
      let address = req.body.address.trim();
      let star = req.body.star;
      try {
        let body = this.createBody(address, star);
        if (this.mempool.get(address).signature) {
          let block = new blockChainClass.Block(body);
          let blockAddedToChain = JSON.parse(await blockChain.addBlock(block));
          blockAddedToChain.body.star.storyDecoded = hex2ascii(blockAddedToChain.body.star.story);
          this.mempool.delete(address);
          res.send(blockAddedToChain);
        } else {
          res.send("Error : Not a Valid Address");
        }
      } catch (err) {
        res.send("Error : Failed to add Block to BlockChain");
      }
    });
  }

  getBlockByHash(hash) {
    this.app.get("/stars/hash::HASH", async (req, res) => {
      let hash = req.params.HASH;
      console.log(hash);
      try {
        let block = await blockChain.getBlockbyHash(hash);
        res.send(block);
      } catch (err) {
        res.send("Block not present with Hash: " + hash);
      }
    });
  }

  getBlockByAddress(address) {
    this.app.get("/stars/address::ADDRESS", async (req, res) => {
      let address = req.params.ADDRESS;
      try {
        let block = [];
        block.push(await blockChain.getBlockbyAddress(address));
        res.send(block);
      } catch (err) {
        res.send("Block not present with Address: " + address);
      }
    });
  }

  getBlock(key) {
    this.app.get("/block/:HEIGHT", async (req, res) => {
      let id = req.params.HEIGHT;
      try {
        let block = await blockChain.getBlock(id);
        let decodedData = JSON.parse(block);
        decodedData.body.star.storyDecoded = hex2ascii(decodedData.body.star.story);
        res.send(decodedData);
      } catch (err) {
        res.send("Block not present with id: " + id);
      }
    });
  }
}

module.exports = (app) => {
  return new Notary(app);
}
