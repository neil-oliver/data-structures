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

var tables = ['locations','groups','events'];

async.eachSeries(tables, function(table, callback) {
    const client = new Client(db_credentials);
    client.connect();
    var thisQuery = "SELECT * FROM " + table + ";";
    client.query(thisQuery, (err, res) => {
        console.log(err, res.rows);
        client.end();
        fs.appendFileSync('data/dbOutput.json', JSON.stringify(res.rows));
    });
    setTimeout(callback, 1000); 
}); 
