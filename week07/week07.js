//  Neil Oliver
//  Week 03 Data Structures Task
//  Add geographic info to parsed data

// dependencies
var request = require('request'); // npm install request
var async = require('async'); // npm install async
var fs = require('fs');
const dotenv = require('dotenv'); // npm install dotenv
var cheerio = require('cheerio')

// TAMU api key
dotenv.config();
const apiKey = process.env.TAMU_KEY;

var meetings = {};

fs.writeFileSync('data/less-than-perfect.csv', "matchScore,street,city,state,zip,name,line_1,state,zip\n");

for (let i = 0; i < 10; i++) {
    
    console.log("processing file No." + (i+1));
    
    //create a number for use in the url with a leading zero
    let num = 0;
    
    //If the iterator is below 9 
    if (i < 9) {
        num = '0' + (i+1);
    } else {
        num = (i+1);
    }
    
    // Read text file with saved HTML data
    fs.readFile('/home/ec2-user/environment/week01/data/AA-data-' + num + '.txt', 'utf8', (error, data) => {
        if (error) throw error;
              
        // Load the file data into the cheerio parser
        const $ = cheerio.load(data);
        
        // Traverse the DOM model produced by Cheerio down three table rows deep
        $('tr tr tr').each(function(i, item) {
            if (i != 0){
                //Extract meeting name
                var meetingName = $(this).children().eq(0).find('b').text();
                meetingName = meetingName.split(' - ');
                meetingName = meetingName[0].toLowerCase();
                meetingName = toTitleCase(meetingName);
                
                //Extract if Wheelchair access is available
                var access = false;
                if ($(this).children().eq(0).find('span').text().trim() == "Wheelchair access"){
                   access = true ;
                }
                
                //Extract the meeting additional details
                var detailsBox = $(this).children().eq(0).find($('.detailsBox')).text().trim();

                // Delete additional html code within the table row
                $(this).children().eq(0).find('div').remove().html();
                $(this).children().eq(0).find('b').remove().html();
                $(this).children().eq(0).find('span').remove().html();
                
                //Extract the name in the H4 and check that the location has a name
                var locationName = $(this).children().eq(0).find('h4').text();
                $(this).children().eq(0).find('h4').remove().html();
                
                // Extract the location details. Split at a new line, deleting white space and blank lines
                var location = $(this).children().eq(0).text().split(/\n|,|\(|\)|-|@/).map(item => item.trim()).filter(Boolean);
                
                // Replace E in address with East
                location[0] = location[0].replace(" E ", " East ");
                location[0] = location[0].replace(" E. ", " East ");
                location[0] = location[0].replace(" W ", " West ");
                location[0] = location[0].replace(" W. ", " West ");
                location[0] = location[0].replace(" St ", " Street ");
                location[0] = location[0].replace(" Av ", " Avenue ");
                location[0] = location[0].replace(" Av. ", " Avenue ");
                location[0] = location[0].replace(" Ave ", " Avenue ");
                location[0] = location[0].replace(" street ", " Street ");

               
               //Check is address line 1 only contains digits, if so, join the next line
               if ((location[0].replace(/\D+/g, '').length == 0) || (location[0].replace(/\d/g,'').length == 0)){
                   location[0] = location[0]+" "+location[1];
                   location.splice(1,1);
               }
               
               //Split after 'Street.' and take the first part of the array
               var newLoc = location[0].split('Street.');
               location[0] = newLoc[0];
               
               //Split after 'Rm' and take the first part of the array
               newLoc = location[0].split('Rm');
               location[0] = newLoc[0];
               
               //Replace 'St.' with Street at the END of the address only
               if (location[0].substr(location[0].length - 3) == 'St.' || location[0].substr(location[0].length - 2) == 'St') {
                   location[0] = location[0].replace(" St.", " Street");
               }
               
               // Some location names are blank so use the first line of the address
                if (locationName == "") {
                    locationName = location[0];
                }
                
                var zipcode = location[location.length - 1].slice(-5).replace(/\D+/g, '');
                
                //Create an address object
                var addressObj = {
                    line_1 : location[0],
                    city : "New York",
                    state : "NY",
                    zip : zipcode,
                    friendly: location.join(','),
                    wheelchair_access: access,
                    zone : num
                };
                
                //If the meetings object does not contain this address, add it.
                if (!(meetings.hasOwnProperty(locationName))){
                    meetings[locationName] = {
                        address : addressObj,
                        'meetings':{}
                    };
                }
                
                //Extract the meeting times into an array
                var meetingTimes = $(this).children().eq(1).text().split('\n').map(item => item.trim()).filter(Boolean);
                
                //For each meeting time, itterate through and extract the details into an object.
                for (let x = 0; x < meetingTimes.length; x++) { 
                    // avoid the issues where some entries seem to have left the template in place. 
                    var times = meetingTimes[x].split(' ');

                    if (times[0] != 's'){
                        var specialInterest = meetingTimes[x].split(' Special Interest ');
                        specialInterest = specialInterest[1];
                        if (!specialInterest){
                            specialInterest = '';
                        }
                        
                        var timesObj = {
                            day : times[0],
                            start : times[3]+' '+times[4],
                            end : times[6]+' '+times[7],
                            type : times[10],
                            specialInterest : specialInterest
                        };
                        
                        //If the meeting has already been created, append the meeting times, else add the meeting and times.
                        if (meetings[locationName]['meetings'].hasOwnProperty(meetingName)) {
                            meetings[locationName]['meetings'][meetingName]['times'].push(timesObj);
                        } else {
                            meetings[locationName]['meetings'][meetingName] = {};
                            meetings[locationName]['meetings'][meetingName]['times'] = [timesObj];
                            meetings[locationName]['meetings'][meetingName]['details'] = detailsBox;
    
                        }
                    }
                }
                
                //Call the geocode function
               geocode(locationName, zipcode, addressObj);
                
                //temp writeFile as not to use up all geocode requests
                //fs.writeFileSync('data/AA-complete-data.json', JSON.stringify(meetings));
            }
        });
    });
}



function geocode(name, zip, address){
    //Check to see if the address already has the coords before continue to save unneccesary API calls. 
    if (!(address.hasOwnProperty('coords'))){
        //Set up the API request
        var apiRequest = 'https://geoservices.tamu.edu/Services/Geocode/WebService/GeocoderWebServiceHttpNonParsed_V04_01.aspx?';
        apiRequest += 'streetAddress=' + address.line_1.split(' ').join('%20');
        apiRequest += '&city=New%20York&state=NY&zip=' + zip + '&apikey=' + apiKey;
        apiRequest += '&format=json&version=4.01';
        
        request(apiRequest, function(err, resp, body) {
            if (err) {throw err;}
            else {
                var tamuGeo = JSON.parse(body);
                //Extract the latitude and longitude
                var lat = tamuGeo['OutputGeocodes'][0]['OutputGeocode']['Latitude'];
                var lon = tamuGeo['OutputGeocodes'][0]['OutputGeocode']['Longitude'];
                var matchScore = tamuGeo['OutputGeocodes'][0]['OutputGeocode']['MatchScore'];
                
                //Save a coords object to the meetings object
                meetings[name]['address']['coords'] = {
                    latitude : lat,
                    longitude : lon,
                    score : matchScore
                };
                
                if (matchScore < 100){
                    var compare = matchScore + ',' + tamuGeo['InputAddress']['StreetAddress'] + ',' + tamuGeo['InputAddress']['City'] + ',' + tamuGeo['InputAddress']['State'] + ',' + tamuGeo['InputAddress']['Zip'];
                    compare += ',"' + name + '",' + address.line_1 + ',' + address.state + ',' + zip;
                    fs.appendFileSync('data/less-than-perfect.csv', compare + '\n' );
                }
                
                //Save the meetings object to file
                fs.writeFileSync('data/AA-complete-data.json', JSON.stringify(meetings));
            }
        });
    } else {
        //Save the existing data to file
        fs.writeFileSync('data/AA-complete-data.json', JSON.stringify(meetings));
    }
}

// Title case function provided by Greg Dean
// https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript/196991#196991
function toTitleCase (str) {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}
