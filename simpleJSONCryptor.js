// Borrowed from https://github.com/chris-rock/node-crypto-examples

var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = require('./PASS');

// accept `json`, output encrypted hex text.
function encrypt(json){
  var cipher = crypto.createCipher(algorithm, password);
  var crypted = cipher.update(JSON.stringify(json), 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

// accept encrypted hex text, output `json`.
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm, password);
  var dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return JSON.parse(dec);
}

module.exports = {
  encryptJSON: encrypt,
  decryptJSON: decrypt,
};
