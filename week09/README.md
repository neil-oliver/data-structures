# Week 09 Task

Task instructions provided by [Aaron Hill](https://github.com/aaronxhill).

Full instructions for this tasks can be found on the Parsons MSDV [Data Structures GitHub Page](https://github.com/visualizedata/data-structures/tree/master/weekly_assignment_09)

## Changes to Sample Code

### setup.js
Create new table in the new AWS RDS database setup foir this task (```temperature-db```)
#### Original
```javascript
var db_credentials = new Object();
db_credentials.user = 'aaron';
db_credentials.host = 'dsdemo.c2g7qw1abcde.us-east-1.rds.amazonaws.com';
db_credentials.database = 'mydb';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

...

query = "CREATE TABLE sensorData ( sensorValue real, sensorTime timestamp DEFAULT current_timestamp );";
```
#### Modified
- Moved some of the credentials to the ```.env``` file for better security.
- Modified the datatype in the table create code to float (real)
- Added simple drop/create toggle using a boolean variable.

```javascript
var db_credentials = new Object();
db_credentials.user = 'tempadmin';
db_credentials.host = process.env.AWSRDS_EP;;
db_credentials.database = 'tempdb';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

var drop = false;
var query;

if (drop == true) {
    // SQL statement to delete a table: 
    query = "DROP TABLE if exists sensordata cascade;";
    
} else {
    // Sample SQL statement to create a table: 
    query = "CREATE TABLE sensorData ( sensorValue real, sensorTime timestamp DEFAULT current_timestamp );";
}
```

### app.js
Get data from the Photon sensor and save it to the AWS RDS Database
#### Original
```javascript
// Convert 1/0 to TRUE/FALSE for the Postgres INSERT INTO statement
var sv_mod; 
if (sv == 1) {
    sv_mod = "TRUE";
}
else if (sv == 0) {
    sv_mod = "FALSE";
}
```
#### Modified
- Added Photon details to the ```.env``` file.
- Removed code to convert boolean value (as temperature value is not boolean)
- Added the ```ecosystem.config.js``` file to the ```.gitignore``` file so it is not uploaded to GitHub.

```javascript
.env
/.c9
.gitignore
ecosystem.config.js
```

### getTempData.js
Get all of the infromation being saved to the new database (for testing purposes).
#### Modified
- Added the requirement to use the ENV package
```javascript
const dotenv = require('dotenv').config();
```
#### Output
![](https://github.com/neil-oliver/data-structures/blob/master/week09/tempdb-output.png)
