# Week 06 Task

### Changes Made to previous tasks
- Week 5 task - date format change to ISO 8061
- Week 04 task - time changed from string to ```time without timezone``` format.

## Progress Blog Query
Query using both category and allowing a time period (between) for the creation of the post to be specified.
![](https://github.com/neil-oliver/data-structures/blob/master/week06/images/Progress-blog-query-evidence-1.png)
### Additional evidence showing a different time period
![](https://github.com/neil-oliver/data-structures/blob/master/week06/images/Progress-blog-query-evidence-2.png)
### Additional evidence showing a different category
![](https://github.com/neil-oliver/data-structures/blob/master/week06/images/Progress-blog-query-evidence-3.png)
### AWS Setup
The AWS setup and dependencies are the same as from the preious [Week05](https://github.com/neil-oliver/data-structures/tree/master/week05) task.  
```javascript
// AWS Setup
var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-2";
var dynamodb = new AWS.DynamoDB();
```
### Query Parameters
```javascript
var params = {
    TableName : "process-blog",
    KeyConditionExpression: "category = :categoryName and created between :minDate and :maxDate", // the query expression
    ExpressionAttributeValues: { // the query values
        ":categoryName": {S: "data-structures"},
        ":minDate": {S: new Date("August 28, 2019").toISOString()},
        ":maxDate": {S: new Date("October 11, 2019").toISOString()}
    }
};
```
### Executing the DynamoDB query
The code below is taken from the [sample code](https://github.com/visualizedata/data-structures/tree/master/weekly_assignment_06). It takes the paramters that were formed in th ```params``` variable and makes a query request to the DynamoDB. The request will return with either an error, confirmation and data (if there is any matching data to the query).
```javascript
dynamodb.query(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded.");
        data.Items.forEach(function(item) {
            console.log("***** ***** ***** ***** ***** \n", item);
        });
    }
});
```

## AA Meeting Query
Cross Table Query using ```SELECT```,```WHERE```,```BETWEEN```,```ORDER BY``` and using distance calculations based on coordinates. The user can specify a day for the meeting, a window for the meeting to start, an (optional) text based address to order the results by distance.The location information uses the TAMU geolocation system to get the location coordinates.
*The query will work without the location, allowing for anonymity.*
The user is presented with the address (user friendly with additional details such as which avenues it is between), group name and meeting start time.
![](https://github.com/neil-oliver/data-structures/blob/master/week06/images/AA-meeting-query-evidence.png)
### Setup
```javascript
const { Client } = require('pg');
const dotenv = require('dotenv').config();
const async = require('async');
const fs = require('fs')
const apiKey = process.env.TAMU_KEY;
var request = require('request');

// AWS RDS POSTGRESQL INSTANCE
var db_credentials = new Object();
db_credentials.user = 'AAAdmin';
db_credentials.host = 'database-structures.csjve6pmlqxu.us-east-2.rds.amazonaws.com';
db_credentials.database = 'aa';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

// Connect to the AWS RDS Postgres database
const client = new Client(db_credentials);
client.connect();
```
### Optional Distance
The user has the option to enter an address (does not have to be their current location) to be used in ordering the search results.

```javascript
var lat = 0;
var lon = 0;
var address_line_1 = '60 W 90th Street';
var zip = '10024';

if (address_line_1 != '' && zip != '') {
    // Setup the query parameters using distance to sort results
} else {
    // Setup the query paramters without distance
}
```
### Creating the Query
First the address is passed to the TAMU geolocation service to retrieve coordinates as is detailed in the [Week03](https://github.com/neil-oliver/data-structures/tree/master/week03) task. 

```javascript
var after = "'6:00 PM'";
var before = "'8:00 PM'";
var lat = 0;
var lon = 0;

var apiRequest = 'https://geoservices.tamu.edu/Services/Geocode/WebService/GeocoderWebServiceHttpNonParsed_V04_01.aspx?';
apiRequest += 'streetAddress=' + address_line_1.split(' ').join('%20');
apiRequest += '&city=New%20York&state=NY&zip=' + zip + '&apikey=' + apiKey;
apiRequest += '&format=json&version=4.01';

request(apiRequest, function(err, resp, body) {
    if (err) {throw err;}
    else {
        var tamuGeo = JSON.parse(body);
        //Extract the latitude and longitude
        var lat = tamuGeo['OutputGeocodes'][0]['OutputGeocode']['Latitude'];
        var lon = tamuGeo['OutputGeocodes'][0]['OutputGeocode']['Longitude'];
    }
  });
```
These coordinates are used to create a calculated ```distance``` column in the returned results. The calculation could have used [Pythagorean Theorem](https://en.wikipedia.org/wiki/Pythagorean_theorem) to calculate distances that would have been sufficient as the distance is short and only userd for ordering results, however i opted to instead include the calculation that includes taking into account the curvature of the earth.  
**Possible Improvement: Another more useful option for later implementation may be the use of the [Google Maps Directions API](https://developers.google.com/maps/documentation/directions/intro).**
```javascript
            var thisQuery = "SELECT locations.Extended_Address, groups.Group_Name, events.Start_at ";
            thisQuery += ", 2 * 3961 * asin(sqrt((sin(radians((" + lat + " - locations.lat) / 2))) ^ 2 + cos(radians(locations.lat)) * cos(radians(" + lat + ")) * (sin(radians((" + lon + " - locations.long) / 2))) ^ 2)) as distance ";
```
The information being requested is coming from multiple tables so the tables are joined to create a single table of results. The query is then filtered using the time bracket specified by the user in the ```after``` and ```before``` variables on the start time of the event. Finally the query is ordered by the previously created ```distance``` column.
```javascript
thisQuery +=  "FROM groups ";
thisQuery +=  "INNER JOIN locations ON groups.Location_ID=locations.Location_ID ";
thisQuery +=  "INNER JOIN events ON groups.Group_ID=events.Group_ID ";
thisQuery +=  "WHERE events.Day = 'Mondays' AND events.Start_at BETWEEN time "+ after + " AND time " + before;
thisQuery += " ORDER BY distance";
thisQuery +=  ";";
```

### Running the Query
The query is then ran with the query string compiled above and the results are printed to the console in a table form.
```javascript
client.query(thisQuery, (err, res) => {
    console.log(err);

    //print out the rows element of response
    console.table(res.rows);

    client.end();
});
```
