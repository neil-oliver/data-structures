# Week 04 Task

Task instructions provided by [Aaron Hill](https://github.com/aaronxhill).

Full instructions for this tasks can be found on the Parsons MSDV [Data Structures GitHub Page](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_04.md).

This is a continuation from [Task 3](https://github.com/neil-oliver/data-structures/tree/master/week03) and part of the [Weekly Data Structures Tasks](https://github.com/neil-oliver/data-structures)

## V.1 Schema for Relational Database
![](https://github.com/neil-oliver/data-structures/blob/master/week04/Relational_Schema.png)

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

## Saving the Previously Saved Information
```javascript

```

## Selecting and Checking Information from the Database
```javascript

```
