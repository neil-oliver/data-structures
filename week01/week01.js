//  Neil Oliver
//  Week 01 Data Structures Task
//  get request on 10 AA HTML files.

var request = require('request');
var fs = require('fs');

for (var i = 0; i < 10; i++) {
    
    //create a number for use in the url with a leading zero
    var num = 0;
    
    //If the iterator is below 9 
    if (i < 9) {
        num = '0' + (i+1)
    } else {
        num = (i+1)
    };
    
    var saveCounter = 1    //separate counter for the save as the iterator will have moved on before the file is saved.
    
    //request
    request('https://parsons.nyc/aa/m'+ num +'.html', function(error, response, body){
        if (!error && response.statusCode == 200) {
            fs.writeFileSync('/home/ec2-user/environment/week01/data/AA-data-' + saveCounter + '.txt', body);
            saveCounter++   //increase the save counter so the next file has a new name
        }
        else {console.log(error)}
    });
};
