/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {
  // Declaring the class constructor
  constructor() {
    this.db = level(chainDB);
  }

  // Add data to levelDB with key/value pair
  addLevelDBData(key, value) {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.db.put(key, value, function(err) {
        if (err) {
          console.log('Block ' + key + ' submission failed', err);
          reject(err);
        }
        resolve(value);
      });
    });
  }

  // Add data to levelDB with value
  // Not used
  addDataToLevelDB(value) {
    let i = 0;
    let self = this;
    self.db.createReadStream().on('data', function(data) {
      i++;
    }).on('error', function(err) {
      return console.log('Unable to read data stream!', err)
    }).on('close', function() {
      console.log('Block #' + i);
      self.addLevelDBData(i, value);
    });
  }

}

module.exports.LevelSandbox = LevelSandbox;
