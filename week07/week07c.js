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
