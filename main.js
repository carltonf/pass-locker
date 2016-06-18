// NOTE: every pass update should update VERSION_INFO, a good practice as we are
// doing something uncommon here.
var ADMIN_PASS = 'xxxxxxxxxxxxxxxxxxxx';
var VERSION_INFO = 'Jun-13-2016';
console.log(`** Updated at ${VERSION_INFO}.`);

// NOTE: use https to better fend off spoofing
var https = require('https');
var dns = require('dns');

// NOTE: Verify that we are not sproofing Time Zone, as the rest call depends
// on locale. UTC doesn't make sense here as we need local time
var timeZoneOffset = - ( (new Date()).getTimezoneOffset() / 60 );
if ( timeZoneOffset !== 8 ) {
  console.error(`* Error: Time zone is incorrect: UTC + (${timeZoneOffset})`);
  console.error('* Abort: environment is tempered.');
  process.exit(0);
}

// allowed day and hours
function isAllowedTime (curTime) {
  const WEEKDAY = 0;           // Sunday
  const HOURS = [5, 6, 7];      // Only Early morning
  console.log(`** Allowed time is ${HOURS[0]}-${HOURS[HOURS.length -1 ] + 1} am on Sunday(${WEEKDAY}) *CST, GMT+8*.`);

  var curDay = curTime.getDay();
  var curHour = curTime.getHours();

  return (curDay === WEEKDAY && HOURS.indexOf(curHour) > -1);
}

function validateServerComm(res) {
  if (res.statusCode !== 200) {
    console.error(`* Network error: ${res.statusCode}`);
    return false;
  }

  // NOTE is `authorized` field alone enough?
  if ( !res.socket.authorized ) {
    console.error(`* ERROR: The Server is NOT authorized. Something weird happened.`);
    return false;
  }
  return true;
}

// FIX: the following DNS check is basically useless, with HTTPS we might not
// need DNS checking anymore.
function isSuspiciousDNSRes(addrs) {
  const wrongAddrs = ["127.0.0.1", "108.61.162.93"];

  return addrs.some( addr => (wrongAddrs.indexOf(addr) > -1) );
}


callback = function httpsReqCB (res) {
  var str = '';

  res.on('data', function (chunk) {
    // NOTE: nothing, we do not care about the data
  });

  res.on('end', function () {
    if ( ! validateServerComm(res) ) {
      return;
    }

    var curTime = new Date(res.headers.date);
    console.log(`* Current time: ${curTime}`);
    if (isAllowedTime(curTime)) {
      console.log('Pass: ' + ADMIN_PASS);
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

  if ( isSuspiciousDNSRes(addrs) ) {
    console.log('* DNS query contains suspicious result.');
    return;
  }

  https.request(serverOptions, callback).end();
});
