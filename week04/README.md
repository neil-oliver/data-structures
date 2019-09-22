# Week 04 Task

Task instructions provided by [Aaron Hill](https://github.com/aaronxhill).

Full instructions for this tasks can be found on the Parsons MSDV [Data Structures GitHub Page](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_04.md).

This is a continuation from [Task 3](https://github.com/neil-oliver/data-structures/tree/master/week03) and part of the [Weekly Data Structures Tasks](https://github.com/neil-oliver/data-structures)

## Update from Week 03
### Parsing All 10 Zones
The code from [Week 03](https://github.com/neil-oliver/data-structures/tree/master/week03) was updated to now parse and save all 10 files. The process of iterating through all 10 files was very similar to the method used in the [Week 01](https://github.com/neil-oliver/data-structures/tree/master/week01) task. The parsing of the data is the same as described in the [Week 03 code](https://github.com/neil-oliver/data-structures/blob/master/week03/week03.js). 


```javascript
for (let i = 0; i < 10; i++) {
    
    console.log("processing file No." + (i+1))
    
    //create a number for use in the url with a leading zero
    let num = 0;
    
    //If the iterator is below 9 
    if (i < 9) {
        num = '0' + (i+1)
    } else {
        num = (i+1)
    };
    
    // Read text file with saved HTML data
    fs.readFile('/home/ec2-user/environment/week01/data/AA-data-' + num + '.txt', 'utf8', (error, data) => {
        if (error) throw error;
              
        // Load the file data into the cheerio parser
        const $ = cheerio.load(data);
        ...
     });
```

### Cleaning the Data
#### Cleaning the Group Name
Many of the Group names were repeated in capitals after a dash. The Group name was split, turned to lower case and then the first letter of each line is capitalized using code provided by [Greg Dean](https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript/196991#196991).
```javascript
meetingName = meetingName.split(' - ')
meetingName = meetingName[0].toLowerCase()
meetingName = toTitleCase(meetingName)

// Title case function provided by Greg Dean
function toTitleCase (str) {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}
```

#### Removing inconsistencies in Address_Line_1
A wide range of abbreviations are used in the street address so these are all replaced to the full word to ensure consistency. 
```javascript
  location[0] = location[0].replace(" E ", " East ");
  location[0] = location[0].replace(" E. ", " East ");
  location[0] = location[0].replace(" W ", " West ");
  location[0] = location[0].replace(" W. ", " West ");
  location[0] = location[0].replace(" St ", " Street ");
  location[0] = location[0].replace(" Av ", " Avenue ");
  location[0] = location[0].replace(" Av. ", " Avenue ");
```

Some addresses (incorrectly) used a comma in the address line. This meant that the address was split at an earlier stage of the parsing. To rectify this, the address line is evaluated to see if it only contains a number and then joins the next column if neccessary.

```javascript
 if ((location[0].replace(/\D+/g, '').length == 0) || (location[0].replace(/\d/g,'').length == 0)){
     location[0] = location[0]+" "+location[1]
     location.splice(1,1)
 }
```

#### Including additional Details
For easier checking of the data, both the zone of the location and the TAMU match score were included in the results. 

```javascript
var access = false
if ($(this).children().eq(0).find('span').text().trim() == "Wheelchair access"){
   access = true 
}

...

var addressObj = {
    line_1 : location[0],
    city : "New York",
    state : "NY",
    zip : zipcode,
    friendly: location.join(','),
    wheelchair_access: access,
    zone : num
};

...

var matchScore = tamuGeo['OutputGeocodes'][0]['OutputGeocode']['MatchScore']

meetings[name]['address']['coords'] = {
    latitude : lat,
    longitude : lon,
    score : matchScore
}       
```
The resulting saved data was the complete dataset with only 3 results with a TAMU match score of under 95%.  
**Note for improvement: The code was cleaned to a good level, with the only remaining issues being a very small amount of missing information. This could be rectified in some cases using the TAMU response data to replace insistent data or fill in missing gaps such as zip codes.**

# Week04
## V.1 Schema for Relational Database
Initial proposal for the database schema based on the previously saved json file structure, with a few additions such as the ability to save additional details for the groups and events.
![](https://github.com/neil-oliver/data-structures/blob/master/week04/Relational_Schema.png)
```JSON
"Location Name": {
  "address": {
    "line_1": "",
    "city": "",
    "state": "",
    "zip": "",
    "friendly": "",
    "wheelchair_access": false,
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

## V.2 Schema for Relational Database
The schema was simplified on the reflection that the additional ```Types``` table was only being created to save repetition of the type description in the database, however the descriptions can be included within the ```HTML``` with only the codes stored in the database. This was the method that was originally used in the AA HTML files.
![](https://github.com/neil-oliver/data-structures/blob/master/week04/Relational_Schema_2.png)

## Setup and Connect to the Database
The database connection code was adapted from the [sample code](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_04.md), with sensitive details contained within a .env file.
A new npm package is used called [pg](https://www.npmjs.com/package/pg).

```javascript
const { Client } = require('pg');
const dotenv = require('dotenv').config();

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

## Creating the Database Structure
### Building a create table query string
To avoid calling the database multiple times with different requests, one long request string is created and ther requests are concatinated.
Each of the field names and data types are the same as listed database schema V.2 above.
All three tables include dynamically generated primary keys with the ```Groups``` and ```Events``` tables also including foreign keys to create realtionships between the tables.  
**Note for improvement: The start and end fields could be time datatype but would not currently accept current JSON value. This should be updated for better searching through the GUI.**
```javascript
var query = "";

query += "CREATE TABLE locations (Location_ID serial primary key,\
                                    Location_Name varchar(100),\
                                    Address_Line_1 varchar(100),\
                                    City varchar(100),\
                                    State varchar(2),\
                                    Zipcode varchar(5),\
                                    Accessible BOOL,\
                                    Extended_Address varchar(200),\
                                    lat double precision,\
                                    long double precision,\
                                    Zone smallint);";
    
query += "CREATE TABLE groups (Group_ID serial primary key,\
                                Location_ID int references locations(Location_ID),\
                                Group_Name varchar(100),\
                                Details varchar(100));";

query += "CREATE TABLE events (Event_ID serial primary key,\
                                Group_ID int references groups(Group_ID),\
                                Day varchar(100),\
                                Start_at varchar(10),\
                                End_at varchar(10),\
                                Type_ID varchar(20),\
                                Details varchar(100));";
```
### Deleting a table
If updates are made to any of the saved data and the database needs to be reset, each of the tables can be 'dropped'. This is done with the same method as the creation of the tables, building a single SQL query string. This was done in a small if statement to make it easy to switch between building the tables of dropping the tables.

```javascript
var drop = false;

if (drop == true) {    
    query += "DROP TABLE if exists events cascade;";
    query += "DROP TABLE if exists groups cascade;";
    query += "DROP TABLE if exists locations cascade;";
} else {
    // Build the create table query...
}
```

### Run the Query String
Regardless of if the drop of create query string has been built, either can be passed to the code below for execution.
```javascript
client.query(query, (err, res) => {
    console.log(err, res);
    client.end();
});
```
### Testing the Dastabase Schema
Once the tables have been created, they can be quickly tested using the query string below. This overrides either of the other two query strings that had been created earlier in the code.
```javascript
query = 'SELECT * FROM INFORMATION_SCHEMA.COLUMNS';
```

## Saving the Previously Saved Information

Once the database tables have been created, the information from the previously saved json file is saved into the database, one record at a time.

Due to the structure of the json file, with a location containing groups information and a group containing event information; a nested loop is used to parse each entry and a time.

The process of this loop is as follows:
1. For each location in the json, save the address data to the location table.
2. Take the data for the first group within the location object, save the group data to the group table.
3. For each event in the group, save the event data to the event table. 
4. Repeat steps 2 & 3 for any additions groups within the location.
5. When all groups and events for the location have been added, proceed to the next location.

Each of the three stages are similar code, with the differences being the building of the different query strings and the output statements.  
**Note for improvement: While the nested loop approach works for such a small number of nested objects, a recursive function may have been a more efficient way of coding the solution.**

```javascript
const { Client } = require('pg');
const async = require('async');
var escape = require('pg-escape');

const dotenv = require('dotenv').config();
const fs = require('fs');

// AWS RDS POSTGRESQL INSTANCE
var db_credentials = new Object();
db_credentials.user = 'AAAdmin';
db_credentials.host = 'database-structures.csjve6pmlqxu.us-east-2.rds.amazonaws.com';
db_credentials.database = 'aa';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

//Read the previously saved json file
fs.readFile('data/AA-complete-data.json', 'utf8', (error, data) => {
    if (error) throw error;
    //parse the json so it cant be used as an object
    var meetings = JSON.parse(data);

    //for each element in the json, extract the location name
    async.forEachOf(meetings, function(locationObj,location, callback) {
        const client = new Client(db_credentials);
        client.connect();
        
        //create a query string with the values from the json to be entered into the locations table (values are enetered in order), returning the assigned location id to be used for the groups table
        var locationQuery = escape("INSERT INTO locations VALUES (DEFAULT, %L,%L,%L,%L,%L,%s,%L,%s,%s,%s) RETURNING Location_ID;",
        location,
        meetings[location]['address']['line_1'],
        meetings[location]['address']['city'],
        meetings[location]['address']['state'],
        meetings[location]['address']['zip'],
        meetings[location]['address']['wheelchair_access'],
        meetings[location]['address']['friendly'],
        meetings[location]['address']['coords']['latitude'],
        meetings[location]['address']['coords']['longitude'],
        meetings[location]['address']['zone']);
        
        //create a query using the query string
        client.query(locationQuery, (err, res) => {
            if (error) {
                console.log(err, locationQuery);
            } else {
                // in the information has been enetered correct and a new location ID has been created, continue to add the groups associated with that location
                console.log('Location ID: ' + res.rows[0].location_id);
                client.end();
                // for each of the nested groups, create a query string and add them to the groups table
                async.forEachOf(meetings[location]['meetings'], function(groupObj,group, callback) {
                    const client = new Client(db_credentials);
                    client.connect();
                        var meetingQuery = escape("INSERT INTO groups VALUES (DEFAULT, %s, %L, %L) RETURNING Group_ID;", res.rows[0].location_id, group, "");

                    client.query(meetingQuery, (err, res) => {
                        if (error) {
                            console.log(err, meetingQuery);
                        } else {
                            // in the information has been enetered correct and a new group ID has been created, continue to add the events associated with that group
                            console.log('Group ID: ' + res.rows[0].group_id);
                            client.end();
                            
                            async.forEachOf(meetings[location]['meetings'][group], function(eventObj,event, callback) {
                                const client = new Client(db_credentials);
                                client.connect();
                                    var eventQuery = escape("INSERT INTO events VALUES (DEFAULT, %s, %L, %L, %L, %L, %L) RETURNING Event_ID;",
                                    res.rows[0].group_id,
                                    meetings[location]['meetings'][group][event]['day'],
                                    meetings[location]['meetings'][group][event]['start'],
                                    meetings[location]['meetings'][group][event]['end'],
                                    meetings[location]['meetings'][group][event]['type'],
                                    "");

                                client.query(eventQuery, (err, res) => {
                                    if (error) {
                                        console.log(err, eventQuery);
                                    } else {
                                        //confirm that the events have been created
                                        console.log('Event ID: ' + res.rows[0].event_id);
                                        client.end();
                                    }
                                });
                            
                            setTimeout(callback, 2000); 
                            });
                        }
                    });
                
                setTimeout(callback, 2000); 
                });
            }
        });
    
    setTimeout(callback, 2000); 
    }); 
});
```
## Selecting and Checking Information from the Database

The first method of checking that the console and correct information has been saved to the database is through the print statements in the ```week04b.js ``` file.
The print statements output the newly created ID numbers for the events, with the final print out showing Event_ID number **1206** being created. 
![](https://github.com/neil-oliver/data-structures/blob/master/week04/Console_Output.png)  

The [CSV helper file](https://github.com/neil-oliver/data-structures/blob/master/week04/data/AA-complete-data.csv) that is generated from the same json file shows a total of **1207** rows, however this is due to the addition of a header row. *Note that the 1208 lines is in reference to a blank line in the CSV file containing no data*

![](https://github.com/neil-oliver/data-structures/blob/master/week04/CSV_Data_Count_1.png)
![](https://github.com/neil-oliver/data-structures/blob/master/week04/CSV_Data_Count_2.png)  

### Database Select and Saving Database Output
The ```week04c.js ``` file contains another database query. This query loops through each of the tables and gets all of the fields (using the ```* ``` selector.
The information is output the the console and also saved back into a [new json file](https://github.com/neil-oliver/data-structures/blob/master/week04/data/dbOutput.json) so the information can more easily be validated.   


```javascript
  
const { Client } = require('pg');
const dotenv = require('dotenv').config();
const async = require('async');
const fs = require('fs')


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

//array of the names of the three tables to iterate through
var tables = ['locations','groups','events'];

//Asynchronous loop through the table names
async.eachSeries(tables, function(table, callback) {
    const client = new Client(db_credentials);
    client.connect();
    //Select everything from the current table
    var thisQuery = "SELECT * FROM " + table + ";";
    client.query(thisQuery, (err, res) => {
        //print out the rows element of response
        console.log(err, res.rows);
        client.end();
        //append the information to a json file for error checking
        fs.appendFileSync('data/dbOutput.json', JSON.stringify(res.rows));
    });
    setTimeout(callback, 1000); 
}); 
```
