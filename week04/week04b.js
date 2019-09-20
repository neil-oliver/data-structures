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

fs.readFile('data/AA-complete-data.json', 'utf8', (error, data) => {
    if (error) throw error;
    var meetings = JSON.parse(data);

    async.forEachOf(meetings, function(locationObj,location, callback) {
        const client = new Client(db_credentials);
        client.connect();
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

        client.query(locationQuery, (err, res) => {
            if (error) {
                console.log(err, locationQuery);
            } else {
                client.end();
                console.log(res.rows[0].location_id);
    
                async.forEachOf(meetings[location], function(groupObj,group, callback) {
                    const client = new Client(db_credentials);
                    client.connect();
                        var meetingQuery = escape("INSERT INTO groups VALUES (DEFAULT, %L) RETURNING Group_ID;", meetings[location]['meetings'][group]);

                    client.query(meetingQuery, (err, res) => {
                        if (error) {
                            console.log(err, meetingQuery);
                        } else {
                            console.log(res.rows[0].group_id);
                        }
                        client.end();
                    });
                
                setTimeout(callback, 2000); 
                });
            }
            client.end();
        });
    
    setTimeout(callback, 2000); 
    }); 
});

        
// meetings[location]['meetings'][group][i]['day'] + ',' +
// meetings[location]['meetings'][group][i]['start'] + ',' +
// meetings[location]['meetings'][group][i]['end'] + ',' +
// meetings[location]['meetings'][group][i]['type']