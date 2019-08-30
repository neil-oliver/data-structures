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
        // Add a new meeting object to the end of the existing meetings aray
        meetings[meetings.length] = {
            'Name' : $(this).find('h4').text(),
            'Location' : $(this).children().eq(0).text(),
            'Times' : $(this).children().eq(1).text(),
        };
        
        // Print confirmation that the meeting details have been added
        console.log('Details for ' + $(this).find('h4').text() + ' have been added.')
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
