# Week 04 Task

Task instructions provided by [Aaron Hill](https://github.com/aaronxhill).

Full instructions for this tasks can be found on the Parsons MSDV [Data Structures GitHub Page](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_04.md).

This is a continuation from [Task 3](https://github.com/neil-oliver/data-structures/tree/master/week03) and part of the [Weekly Data Structures Tasks](https://github.com/neil-oliver/data-structures)

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
