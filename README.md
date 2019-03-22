## Project Overview
Your own private Block Chain to store star data in encoded format.

You can input your star data which will get added to the Block Chain and get stored in a encoded format.

#Installation
npm install to download the project dependencies

node app.js to start the application

Node.js Framework -> express.js

Functions ->  addBlock(newBlock)
          ->  getBlock(key)  
          ->  getBlockbyHash(hash)
          ->  getBlockbyAddress(address)
          ->  getBlockHeight()                 --not required as per project rubic
          ->  validateBlock(blockHeight)       --not required as per project rubic
          ->  validateChain()                  --not required as per project rubic
          ->  addStar()
          ->  createBody(address, star)
          ->  validateWindow(timestamp)
          ->  validateRequestByWallet(address, signature)
          ->  signatureValidation()
          ->  ValidRequestObject(address, timestamp)
          ->  RequestObject(address, timestamp)
          ->  requestValidation()
          ->  getBlockChainLength()
          ->  getBlockByIndex()

Api       ->  /requestValidation      --post      request:->{ "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL" }     
              response:-> "walletAddress" "requestTimeStamp" "message" "validationWindow"

          ->  /message-signature/validate    --post     request:->{ "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
            "signature":"H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="}       
            signature is created by signing your walletAddress from your wallet  

            Checks if requestValidation call for the same address is within the mentioned time period and signature is valid.

            response:-> "registerStar": true, "status": {"address" "requestTimeStamp" "message" "validationWindow""messageSignature": true}}                

          ->  /addStar      --post    request:->{ "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL","star": {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "Found star using https://www.google.com/sky/"
                }
              }

              Checks if the address is validated in the previous method. if validated then adds star data to the Block Chain(star story in encoded format )

              response:-> Returns Block which is added to Block Chain

          ->  /stars/hash/:HASH      --get      --getBlockbyHash(hash)   Returns Block  according to it's hash

          ->  /stars/address/:ADDRESS   --get   --getBlockbyAddress(address)   Return Blocks  according to it's address

          ->  /block/:HEIGHT        --get       -- getBlock(key)   Returns Block object according to it's height

Used levelDB to persist data of BlockChain          

## Testing
To Test the API's:

server-endpoint   -> localhost:8000

1. start the server using node app.js
2. use postman or curl to test the API's with the request and method type as mentioned in Api description
