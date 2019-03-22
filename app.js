const express = require("express");

const bodyparser = require("body-parser");

var Web3 = require('web3');

class NotaryApi {

  constructor() {
    this.app = express();
    this.initExpress();
    this.initExpressMiddleWare();
    this.initControllers();
    this.start();
    this.Web3;
    console.log(JSON.stringify(this.Web3));
  }

  initExpress() {
    var express = "asdada";
    console.log(express);
    this.app.set("port", 8000);
  }

  initExpressMiddleWare() {
    this.app.use(bodyparser.urlencoded({
      extended: true
    }));
    this.app.use(bodyparser.json());
  }

  initControllers() {
    require("./notaryRoute.js")(this.app);
  }

  start() {
    let self = this;
    this.app.listen(this.app.get("port"), () => {
      console.log(`Server Listening for port: ${self.app.get("port")}`);
    });
  }

}

new NotaryApi();
