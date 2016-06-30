// A tool for testing 'config-manager.js'
var CM = require('./config-manager');

var cmd = process.argv.splice(process.execArgv.length + 2)[0];

switch (cmd) {
  case 'status':
    console.log('* Current Task/Reward status: ');
    CM.status();
    process.exit(0);
  break;
  case 'access':
    console.log('* Request access to Admin Pass: ');
    CM.requestAccess();
    process.exit(0);
  break;
  case 'checkin':
  // NOTE Most code for antiSpoof only needed at this stage
    console.log('* Tries to checkIn');
  break;
  default:
    console.info('Usage: status|access|checkin');
    process.exit(0);
}