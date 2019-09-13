//  Neil Oliver
//  Week 01 Data Structures Task
//  get request on 10 AA HTML files.

var request = require('request');
var fs = require('fs');

for (let i = 0; i < 10; i++) {
    
    //create a number for use in the url with a leading zero
    let num = 0;
    
    //If the iterator is below 9 
    if (i < 9) {
        num = '0' + (i+1)
    } else {
        num = (i+1)
    };
    

    //request
    request('https://parsons.nyc/aa/m'+ num +'.html', function(error, response, body){
        if (!error && response.statusCode == 200) {
            fs.writeFileSync('/home/ec2-user/environment/week01/data/AA-data-' + num + '.txt', body);
        }
        else {console.log(error)}
    });
};

//first line is after bold until ,
//zipcode directly before any additional formatting
