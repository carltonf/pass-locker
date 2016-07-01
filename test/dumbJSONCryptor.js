// dumb cryptors for test and demo
function dumbEncryptor(json) {
  return JSON.stringify(json);
}

function dumbDecryptor(text) {
  return JSON.parse(text);
}

module.exports = {
  encryptJSON: dumbEncryptor,
  decryptJSON: dumbDecryptor,
};
