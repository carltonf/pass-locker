// NOTE: every pass update should update VERSION_INFO
var ADMIN_PASS = 'xxxxxxxxxxxxxxxxxxxx';
var VERSION_INFO = 'Jun-7-2016'
console.log(`** Updated at ${VERSION_INFO}.`);

var http = require('http');

// allowed day and hours
var SATURDAY = 6;             // Saturday
var HOURS = [5, 6, 7, 8];     // Only Early morning
console.log(`** Allowed time is 5-8 am on Saturday.`);


// NOTE we only need a good web server to read the date field from its response
// header.
var options = {
    host: 'www.baidu.com',
};

callback = function(response) {
    var str = '';

    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
        // str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
        if (response.statusCode !== 200) {
            console.error(`Network error: ${response.statusCode}`);
            return;
        }

        var curTime = new Date(response.headers.date);
        console.log(`* Current time: ${curTime}`);
        // Check whether we should give the pass
        var curDay = curTime.getDay();
        var curHour = curTime.getHours();

        if (curDay === SATURDAY || HOURS.indexOf(curHour) > -1) {
            console.log('Pass: ' + ADMIN_PASS);
        }
        else {
            console.log('* Error: wrong time. You are not allowed.')
        }
    });
}

http.request(options, callback).end();
