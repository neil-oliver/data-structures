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

```javascript
// AWS Setup
var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-2";
var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "process-blog",
    KeyConditionExpression: "category = :categoryName and created between :minDate and :maxDate", // the query expression
    ExpressionAttributeValues: { // the query values
        ":categoryName": {S: "data-structures"},
        ":minDate": {S: new Date("August 28, 2019").toISOString()},
        ":maxDate": {S: new Date("October 11, 2019").toISOString()}
    }
};

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


var after = "'6:00 PM'";
var before = "'8:00 PM'";
var lat = 0;
var lon = 0;
var address_line_1 = '60 W 90th Street';
var zip = '10024';

if (address_line_1 != '' && zip != '') {
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
            var thisQuery = "SELECT locations.Extended_Address, groups.Group_Name, events.Start_at ";
            thisQuery += ", 2 * 3961 * asin(sqrt((sin(radians((" + lat + " - locations.lat) / 2))) ^ 2 + cos(radians(locations.lat)) * cos(radians(" + lat + ")) * (sin(radians((" + lon + " - locations.long) / 2))) ^ 2)) as distance ";
            thisQuery +=  "FROM groups ";
            thisQuery +=  "INNER JOIN locations ON groups.Location_ID=locations.Location_ID ";
            thisQuery +=  "INNER JOIN events ON groups.Group_ID=events.Group_ID ";
            thisQuery +=  "WHERE events.Day = 'Mondays' AND events.Start_at BETWEEN time "+ after + " AND time " + before;
            thisQuery += " ORDER BY distance";
            thisQuery +=  ";";
            
            
            client.query(thisQuery, (err, res) => {
                console.log(err);
                console.table(res.rows);
                client.end();
            });
        }
    });
} else {
    var thisQuery = "SELECT locations.Extended_Address, groups.Group_Name, events.Start_at ";
    thisQuery +=  "FROM groups ";
    thisQuery +=  "INNER JOIN locations ON groups.Location_ID=locations.Location_ID ";
    thisQuery +=  "INNER JOIN events ON groups.Group_ID=events.Group_ID ";
    thisQuery +=  "WHERE events.Day = 'Mondays' AND events.Start_at BETWEEN time "+ after + " AND time " + before;
    thisQuery +=  ";";
    
    
    client.query(thisQuery, (err, res) => {
        console.log(err);
        
        //print out the rows element of response
        console.table(res.rows);
    
        client.end();
    });
}
```
