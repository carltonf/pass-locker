function assertCSTTZ() {
    // NOTE: Verify that we are not sproofing Time Zone, as the rest call depends
    // on locale. UTC doesn't make sense here as we need local time
    var timeZoneOffset = - ( (new Date()).getTimezoneOffset() / 60 );
    if ( timeZoneOffset !== 8 ) {
        console.error(`* Error: Time zone is incorrect: UTC + (${timeZoneOffset})`);
        console.error('* Abort: environment is tempered.');
        process.exit(0);
    }
}

function isCheckInHour (curTime) {
  const HOURS = [5];      // Only Early morning
  console.log(`** Checkin time is ${HOURS[0]}-${HOURS[HOURS.length -1 ] + 1} with *CST, GMT+8*.`);

  var curDay = curTime.getDay();
  var curHour = curTime.getHours();

  return (curDay === WEEKDAY && HOURS.indexOf(curHour) > -1);
}

function isValidServerComm(res) {
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

module.exports = {
    assertCSTTZ: assertCSTTZ,
    isCheckInHour: isCheckInHour,
    isValidServerComm: isValidServerComm,
    isSuspiciousDNSRes: isSuspiciousDNSRes,
};
