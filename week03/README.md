# Week 03 Task
Task instructions provided by [Aaron Hill](https://github.com/aaronxhill).

Full instructions for this tasks can be found on the Parsons MSDV [Data Structures GitHub Page](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_03.md).

An **updated and improved version** of the code for this project is included in the [Week04 Code](https://github.com/neil-oliver/data-structures/blob/master/week04/week04.js). The code not only parses the information from all 10 files but also has improvments to many aspects of the code, including storing additional details and more in depth data cleaning. 

Comments have been removed from code samples within the README file, but detailed comments are present in the javascript files.

## Dependencies & config
First, the dependencies from the [previous task](https://github.com/neil-oliver/data-structures/tree/master/week02) are declaired along with [dotenv](https://www.npmjs.com/package/dotenv) which is used to keep private data (in this case the TAMU API key) in a separate file that is not uploaded to GitHub.
```javascript
var request = require('request');
var fs = require('fs');
const dotenv = require('dotenv');
var cheerio = require('cheerio')

dotenv.config();
const apiKey = process.env.TAMU_KEY;
```
## Information Parsing and Cleaning
Next, the data is parsed by tranversing a cheerio made representation of a DOM model and the information is cleaned, but standardising addresses and removing repetition in meeting names. 
```javascript
var meetings = {};

fs.readFile('/home/ec2-user/environment/week01/data/AA-data-07.txt', 'utf8', (error, data) => {
    if (error) throw error;
          
    const $ = cheerio.load(data);
    
    $('tr tr tr').each(function(i, item) {
        if (i != 0){
            var meetingName = $(this).children().eq(0).find('b').text();
            meetingName = meetingName.split(' - ')
            meetingName = meetingName[0].toLowerCase()
            
            var access = false
            if ($(this).children().eq(0).find('span').text().trim() == "Wheelchair access"){
               access = true 
            }

            $(this).children().eq(0).find('div').remove().html();
            $(this).children().eq(0).find('b').remove().html();
            $(this).children().eq(0).find('span').remove().html();
            
            var location = $(this).children().eq(0).text().split(/\n|,|\(|\)|-/).map(item => item.trim()).filter(Boolean);
            
            location[1] = location[1].replace(" E ", " East ");
            location[1] = location[1].replace(" E. ", " East ");
```
## Object Models
As an update on the previous task design using CSV files, the information is arranged into individual objects for location, meetings and meeting times and pushed to a global ```meetings``` object. 

```javascript           
  var addressObj = {
      line_1 : location[1],
      city : "New York",
      state : "NY",
      zip : location[location.length - 1].replace(/\D+/g, ''),
      friendly: location.join(','),
      wheelchair_access: access,
  };

  if (!(meetings.hasOwnProperty(location[0]))){
      meetings[location[0]] = {
          address : addressObj,
          'meetings':{}
      };
  }
         
  var meetingTimes = $(this).children().eq(1).text().split('\n').map(item => item.trim()).filter(Boolean)

  for (let x = 0; x < meetingTimes.length; x++) { 

      console.log(meetingTimes[x])
      var times = meetingTimes[x].split(' ')
      var timesObj = {
          day : times[0],
          start : times[3]+' '+times[4],
          end : times[6]+' '+times[7],
          type : times[10]
      }

      if (meetings[location[0]]['meetings'].hasOwnProperty(meetingName)) {
          meetings[location[0]]['meetings'][meetingName].push(timesObj)
      } else {
          meetings[location[0]]['meetings'][meetingName] = [timesObj]
      }
  };
 ```
## JSON Structure Design
The location, meetings and meeting times objects are not stored separately, instead they are nested. This model is created while considering ```many-to-one``` relationships, whereby a location can have many meeting, which in turn can be held on multiple days of the week. The resulting empty model is designed as so:

```JSON
"Location Name": {
  "address": {
    "line_1": "",
    "city": "",
    "state": "",
    "zip": "",
    "friendly": "",
    "wheelchair_access": Bool,
    "geocode": {
      "latitude": "",
      "longitude": ""
    }
  },
  "meetings": {
    "Meeting Name": [
      {
        "day": "",
        "start": "",
        "end": "",
        "type": ""
      }
    ]
  }
}  
```
## Geocoding
Once the model is created, the final step is to request the latitude and longitude from the [TAMU Geoservices](https://geoservices.tamu.edu). This code was separated out into a separate function.

The function first checks to see if the location information that has already been stored in the ```meetings``` object already has geocoded information, as making unnecesary requests is counter productive and may cause issues concerning the 2500 request limit for the account. 

Next the API request URL is setup, placing the street name, zipcode and API key in the URL.
```javascript           
getGeocode(location[0],addressObj)

function getGeocode(name, address){
    //Check to see if the address already has the geocode before continue to save unneccesary API calls. 
    if (!(address.hasOwnProperty('geocode'))){
        //Set up the API request
        var apiRequest = 'https://geoservices.tamu.edu/Services/Geocode/WebService/GeocoderWebServiceHttpNonParsed_V04_01.aspx?';
        apiRequest += 'streetAddress=' + address.line_1.split(' ').join('%20');
        apiRequest += '&city=New%20York&state=NY&apikey=' + apiKey;
        apiRequest += '&format=json&version=4.01';
 ```
The reponse from the request is parsed as ```JSON``` and the latitude and longitude values are extracted. A geocode object is created and this is appended the to ```address``` section of the ```meetings``` object.
```javascript       
request(apiRequest, function(err, resp, body) {
    if (err) {throw err;}
    else {
        var tamuGeo = JSON.parse(body);
        var lat = tamuGeo['OutputGeocodes'][0]['OutputGeocode']['Latitude']
        var lon = tamuGeo['OutputGeocodes'][0]['OutputGeocode']['Longitude']

        meetings[name]['address']['geocode'] = {
            latitude : lat,
            longitude : lon
        }
```
The resulting completed ```meetings``` object is then turned into a text based string using ```JSON.stringify()``` and saved into a .json file.
```javascript                
fs.writeFileSync('data/AA-data-07.json', JSON.stringify(meetings));
```

## Data Sample
Below is a small sample of the final ```JSON```. This shows the nested objects including address, geocoding, meetings and meeting times. Each object can be accessed via dot notation when loaded back into javascript. 
```JSON
{
  "Jan Hus Church": {
    "address": {
      "line_1": "351 East 74th Street",
      "city": "New York",
      "state": "NY",
      "zip": "10021",
      "friendly": "Jan Hus Church,351 East 74th Street,2nd Floor,Betw 1st & 2nd Avenues,10021",
      "wheelchair_access": false,
      "geocode": {
        "latitude": "40.7694194",
        "longitude": "-73.9555151"
      }
    },
    "meetings": {
      "a baffled lot": [
        {
          "day": "Saturdays",
          "start": "7:30 AM",
          "end": "8:30 AM",
          "type": "OD"
        }
      ],
      "afternoon awakening": [
        {
          "day": "Mondays",
          "start": "2:30 PM",
          "end": "3:30 PM",
          "type": "B"
        },
        {
          "day": "Tuesdays",
          "start": "2:30 PM",
          "end": "3:30 PM",
          "type": "S"
        },
        {
          "day": "Wednesdays",
          "start": "2:30 PM",
          "end": "3:30 PM",
          "type": "BB"
        },
        {
          "day": "Thursdays",
          "start": "2:30 PM",
          "end": "3:30 PM",
          "type": "S"
        },
        {
          "day": "Fridays",
          "start": "2:30 PM",
          "end": "3:30 PM",
          "type": "S"
        }
      ],
      "eleventh step at jan hus": [
        {
          "day": "Sundays",
          "start": "9:00 AM",
          "end": "10:00 AM",
          "type": "S"
        }
      ],
    }
  },
 ...
```
## Helper File / CSV Information Checking
While the best data structure for the information and its intended use is ```JSON```, checking the completeness and standardisation of the information is much easier in tabular form via a ```CSV```.

A [Helper File](https://github.com/neil-oliver/data-structures/blob/master/week03/helper.js) was created to transpose the saved [JSON](https://github.com/neil-oliver/data-structures/blob/master/week03/data/AA-data-07.json) file into a [CSV](https://github.com/neil-oliver/data-structures/blob/master/week03/data/AA-data-07.csv).

It is important to note that information within the CSV is repeated for each individual meeting time so it is only being created for data validation purposes. 

```javascript
var fs = require('fs');

function makeCSV(jsonFile){
    var meetings = JSON.parse(jsonFile)
    
    fs.writeFileSync('data/AA-data-07.csv', "Location_Name,Address_Line_1,City,State,Zipcode,Extended_Address,Latitude,Longitude,Meeting_Name,Day,Start,End,Type\n");
    
    for (var locationName in meetings) {
        if (meetings.hasOwnProperty(locationName)) {

            for (var meetingName in meetings[locationName]['meetings']){

                for (let i = 0; i < meetings[locationName]['meetings'][meetingName].length; i++) { 
                                    
                    var saveString = 
                        locationName + ',' +
                        meetings[locationName]['address']['line_1'] + ',' +
                        meetings[locationName]['address']['city'] + ',' +
                        meetings[locationName]['address']['state'] + ',' +
                        meetings[locationName]['address']['zip'] + ',' + '"' +
                        meetings[locationName]['address']['friendly'] + '"' + ',' +
                        meetings[locationName]['address']['geocode']['latitude'] + ',' +
                        meetings[locationName]['address']['geocode']['longitude'] + ',' +
                        meetingName + ',' +
                        meetings[locationName]['meetings'][meetingName][i]['day'] + ',' +
                        meetings[locationName]['meetings'][meetingName][i]['start'] + ',' +
                        meetings[locationName]['meetings'][meetingName][i]['end'] + ',' +
                        meetings[locationName]['meetings'][meetingName][i]['type']
                    
                    fs.appendFileSync('data/AA-data-07.csv', saveString + '\n');
                }
            }
        }
    }
}

fs.readFile('data/AA-data-07.json', 'utf8', (error, data) => {
    if (error) throw error;
    makeCSV(data)
});
```
