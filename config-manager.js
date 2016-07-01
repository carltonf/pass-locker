const fs = require('fs');
const cryptor = require('./simpleJSONCryptor');
// const cryptor = require('./dumbJSONCryptor');

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

function _resetBatch (date) {
  configJSON.batchCount = 1;
  configJSON.lastCheckIn = date;
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
    console.log('* [OK] This is your first time checkin.')
    _resetBatch(curDate);
  }
  else {
    // NOTE crude way to calculate hours
    var hoursElapsed = Math.floor( (curDate - lastCheckIn) / (60 * 60 * 1000) );
    // NOTE the right time to check in is between 23 hours to 25 hours
    if (hoursElapsed <= 0) {
      console.log(`* The last checkin date: ${lastCheckIn}`);
      console.log('* [FAILED] Did you just time traveled to the past ;P');
      return;
    }
    else if (hoursElapsed < 23) {
      console.log('* [FAILED] You have already checked in today. Do nothing.');
      return;
    }
    else if (hoursElapsed > 25) {
      console.log('* [WARNING] You have failed to checkin consecuitively.');
      // NOTE More than a day has passed, reset
      _resetBatch(curDate);
      // And punish
      _punish(hoursElapsed/24);
    }
    else {
      console.log('* [OK] Successfully checkin.')
      // NOTE normal consecutive check in
      configJSON.batchCount++;
      configJSON.lastCheckIn = curDate;
      // NOTE calculate chances
      var nextChanceInterval = ALG_PARAMS.INTERVAL + configJSON.batchExtension;
      if (configJSON.batchCount === nextChanceInterval) {
        console.log('* Congratulations! You have just earned a chance!')
        configJSON.numOfChances++;
        configJSON.batchCount = 0;
        configJSON.batchExtension = 0;
      }
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
    console.log('* No chances are available.');
    return false;
  }

  configJSON.numOfChances--;
  _writeConfig();
  console.log('* Access Granted.');
  console.log(`* Remaining number of chances is ${configJSON.numOfChances}`);
  return true;
}

module.exports = {
  checkIn: checkIn,
  status: status,
  requestAccess: requestAccess,
};