const { Client } = require('pg');
const async = require('async');

const dotenv = require('dotenv').config();
const fs = require('fs')

// AWS RDS POSTGRESQL INSTANCE
var db_credentials = new Object();
db_credentials.user = 'AAAdmin';
db_credentials.host = 'database-structures.csjve6pmlqxu.us-east-2.rds.amazonaws.com';
db_credentials.database = 'aa';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

fs.readFile('data/AA-complete-data.json', 'utf8', (error, data) => {
    if (error) throw error;
    var meetings = JSON.parse(data)

    async.forEachOf(meetings, function(locationObj,location, callback) {
        const client = new Client(db_credentials);
        client.connect();
        var thisQuery = "INSERT INTO locations VALUES (DEFAULT,'" + 
        location + "','" +
        meetings[location]['address']['line_1'] + "','" +
        meetings[location]['address']['city'] + "','" +
        meetings[location]['address']['state'] + "'," +
        meetings[location]['address']['zip'] + ',' +
        meetings[location]['address']['wheelchair_access'] + ",'" +
        meetings[location]['address']['friendly'] + "'," +
        meetings[location]['address']['coords']['latitude'] + ',' +
        meetings[location]['address']['coords']['longitude'] + ',' +
        meetings[location]['address']['zone'] +
        ") RETURNING Location_ID;";
        
        client.query(thisQuery, (err, res) => {
            console.log(err, res);
            client.end();
        });
    
    setTimeout(callback, 1000); 
    }); 
});
