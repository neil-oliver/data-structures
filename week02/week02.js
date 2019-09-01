//  Neil Oliver
//  Week 02 Data Structures Task
//  Parse saved data

//Dependencies
const fs = require('fs')
var cheerio = require('cheerio')

////////////////////////////////////////////////////////////////////////////////

function getData(meetings){
    for(let i=0; i < 10; i++){
        
        //Create a number for use in the url with a leading zero
        let num = 0;
        
        // If the iterator is below 9 
        if (i < 9) {
            num = '0' + (i+1)
        } else {
            num = (i+1)
        };
        
        // Opens each of the files and calls the getMeetings function to parse the data
        fs.readFile('/home/ec2-user/environment/week01/data/AA-data-'+ num +'.txt', 'utf8', (error, data) => {
          if (error) throw error;
          // Pass the data and the existings meetings to the function
          getMeetings(data, meetings);
        });
    }
}

function getMeetings(file, meetings){
    // Load the file data into the cheerio parser
    const $ = cheerio.load(file);
    
    // Traverse the DOM model produced by Cheerio down three table rows deep
    $('tr tr tr').each(function(i, item) {
        
        var name = $(this).find('h4').text();
        var location = $(this).children().eq(0).text().split('\n').map(item => item.trim()).filter(Boolean);
        var times = $(this).children().eq(1).text().split('\n').map(item => item.trim()).filter(Boolean);
        
        // Add a new meeting object to the end of the existing meetings aray
        meetings[meetings.length] = {
            'Name' : name,
            'Location' : location,
            'Times' : times
        };
        
        // Print confirmation that the meeting details have been added
        console.log('Details for ' + name + ' have been added.')
        //console.log('The address is: ' + location.join(' '))
        //console.log('The times of the meetings are: ' + times.join( ))
    });
    
    // Return updated meetings array    
    return meetings;
};

function printMeetings(meetings) {
    meetings.forEach(function(meeting){
        console.log(meeting['Name'])
        console.log(meeting['Location'])
        console.log(meeting['Times'])
    });
};

////////////////////////////////////////////////////////////////////////////////

var meetings = [];
getData(meetings);
