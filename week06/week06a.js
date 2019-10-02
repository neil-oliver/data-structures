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

var thisQuery = "SELECT locations.Extended_Address, groups.Group_Name, events.Start_at ";
thisQuery +=  "FROM groups ";
thisQuery +=  "INNER JOIN locations ON groups.Location_ID=locations.Location_ID ";
thisQuery +=  "INNER JOIN events ON groups.Group_ID=events.Group_ID ";
thisQuery +=  "WHERE events.Day = 'Mondays'";
thisQuery +=  ";";


client.query(thisQuery, (err, res) => {
    console.log(err);
    
    //print out the rows element of response
    console.table(res.rows);

    client.end();
});

