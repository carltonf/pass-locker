/*
 TODOs:
 1. Config file management.
 2. Encryption.
 */
const fs = require('fs');
// const cryptor = require('./simpleJSONCryptor');
const cryptor = require('./dumbJSONCryptor');

// NOTE: encrypted JSON file
const CONFIG_FILE = './pass-locker-config.json';

const ALG_PARAMS = {
  INTERVAL: 7,
};

// NOTE: pre-populated with bootstrap template
const DEFAULT_CONFIG_JSON = {
  numOfChances: 0,
  // NOTE: the date of the last check in
  lastCheckIn: null,
  // NOTE: the number of consecutive checkins during current batch
  batchCount: 0,
  // NOTE: the extended days due to failed tasks, initialized and capped at INTERVAL
  // This is one of the anti-spoof measures.
  batchExtension: ALG_PARAMS.INTERVAL,
};

var configJSON = null;

function _writeConfig () {
  fs.writeFileSync(CONFIG_FILE, cryptor.encryptJSON(configJSON));
}

// NOTE: read config, if config file doesn't exist, use the DEFAULT_CONFIG_JSON and 
// write it to file immediately
try {
  fs.accessSync(CONFIG_FILE, fs.R_OK | fs.W_OK);
}
catch (e){
  if (e.code === 'ENOENT') {
    console.log(`* ${CONFIG_FILE} doesn't exist yet. Use the default JSON.`);
    configJSON = DEFAULT_CONFIG_JSON;
  }
  else {
    console.error('* Unhandled Errors. Abort.');
    process.exit(-1);
  }
}

if ( !configJSON ) {
  console.log('* Read JSON from config file.');
  configJSON = cryptor.decryptJSON(fs.readFileSync(CONFIG_FILE, { encoding: 'utf8' }));
  // NOTE: enforce data types
  configJSON.numOfChances = parseInt(configJSON.numOfChances);
  configJSON.batchCount = parseInt(configJSON.batchCount);
  configJSON.lastCheckIn = configJSON.lastCheckIn && (new Date(configJSON.lastCheckIn));
  configJSON.batchExtension = parseInt(configJSON.batchExtension);
}
else {
  _writeConfig();
}

function _resetBatch () {
  configJSON.batchCount = 1;
  configJSON.lastCheckIn = new Date();
}
function _punish (failedDays) {
  if ( configJSON.numOfChances >= failedDays ) {
    configJSON.numOfChances -= failedDays;
    return;
  }

  failedDays = failedDays - configJSON.numOfChances;
  configJSON.numOfChances = 0;
  configJSON.batchExtension = Math.min(
      ALG_PARAMS.INTERVAL, configJSON.batchExtension + failedDays
    );
}

function checkIn(curDate) {
  var lastCheckIn = configJSON.lastCheckIn;
  // NOTE the first time for checkIn
  if ( !lastCheckIn ) {
    console.log('* This is your first time checkin.')
    _resetBatch();
  }
  else {
    if (curDate.getDay() === lastCheckIn.getDay()) {
      console.log('* You havve already checked in today. Do nothing.')
      return;
    }
    // NOTE A very rough approach to calc the elapsed days
    // use 25 hours, as it's ok to checkin every 23 - 25 hours. 
    var daysElapsed = Math.floor( (curDate - lastCheckIn) / (25 * 60 * 60 * 1000) );
    if ( daysElasped > 0 ) {
      // NOTE More than a day has passed, reset
      _resetBatch();
      // And punish
      _punish();
    }
    else {
      // NOTE normal consecutive check in
      configJSON.batchCount++;
      configJSON.lastCheckIn = new Date();
    }
  }
  
  _writeConfig();
}

function status() {
  // TODO more human-friendly status output
  console.log(configJSON);
}

function requestAccess() {
  if ( configJSON.numOfChances === 0 ) {
    console.log('* No chances are avaible.');
    status();
    return;
  }

  configJSON.numOfChances--;
  _writeConfig();
  status();
  console.log('* Access Granted.');
  console.log(`* Remaining number of chances is ${configJSON.numOfChances}`);
}

module.exports = {
  checkIn: checkIn,
  status: status,
  requestAccess: requestAccess,
};