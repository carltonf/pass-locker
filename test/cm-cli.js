// NOTE A tool for testing 'config-manager.js'
var CM = require('./config-manager');
var args = process.argv.splice(process.execArgv.length + 2);
var cmd = args[0];
var argDate = args[1];

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
    console.log('* Tries to checkIn');
    console.log(`Set argDate: ${argDate}`);
    argDate = (argDate && (new Date(argDate))) || (new Date());
    CM.checkIn(argDate);
  break;
  default:
    console.info('Usage: status|access|checkin <date-str>');
    process.exit(0);
}