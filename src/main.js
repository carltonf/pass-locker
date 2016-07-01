// NOTE: every pass update should update VERSION_INFO, a good practice as we are
// doing something uncommon here.
var VERSION_INFO = 'Jul-1-2016';
console.log(`** Pass-Locker: Updated at ${VERSION_INFO}.`);

var AntiSpoof = require('./antiSpoof');
var ADMIN_PASS = require('./PASS');
var CM = require('./config-manager');

// NOTE: use https to better fend off spoofin.
var https = require('https');
var dns = require('dns');

var cmd = process.argv.splice(process.execArgv.length + 2)[0];

switch (cmd) {
  case 'status':
    console.log('* Current Task/Reward status: ');
    CM.status();
    process.exit(0);
  break;
  case 'access':
    console.log('* Request access to Admin Pass...');
    if (CM.requestAccess()) {
      console.log(`[PASS] ${ADMIN_PASS}`);
    }
    process.exit(0);
  break;
  case 'checkin':
    // NOTE Most code for antiSpoof only needed at this stage
    console.log('* Tries to checkin...');
    // NOTE we can use local time to fail quick
    if ( !AntiSpoof.isCheckInHour(new Date()) ) {
      console.log('* Error: wrong time. You are not allowed.');
      process.exit(0);
    }
  break;
  default:
    console.info('Usage: status|access|checkin');
    process.exit(0);
}

// TODO the checkIn branch: most code below is needed for antispoof purpose
// Factor them out.
AntiSpoof.assertCSTTZ();

callback = function httpsReqCB (res) {
  var str = '';

  res.on('data', function (chunk) {
    // NOTE: nothing, we do not care about the data
  });

  res.on('end', function () {
    if ( ! AntiSpoof.isValidServerComm(res) ) {
      return;
    }

    var curTime = new Date(res.headers.date);
    console.log(`* Current time: ${curTime}`);
    if (AntiSpoof.isCheckInHour(curTime)) {
      CM.checkIn(curTime);
      process.exit(0);
    }
    else {
      console.log('* Error: wrong time. You are not allowed.');
    }
  });
};

// Make the request
const REMOTE_SITE = 'www.baidu.com';
var serverOptions = {
  // NOTE: can not set host to ip address as it would lead to error:
  //
  // Hostname/IP doesn't match certificate's altnames: "IP: 103.235.46.39 is not in the cert's list: "
  host: REMOTE_SITE,
  method: 'get',
  path: '/',
  port: 443,
};
dns.resolve4(REMOTE_SITE, (err, addrs) => {
  if (err) {
    console.error('* DNS query failed.');
    throw err;
  }

  if ( AntiSpoof.isSuspiciousDNSRes(addrs) ) {
    console.log('* DNS query contains suspicious result.');
    return;
  }

  https.request(serverOptions, callback).end();
});
