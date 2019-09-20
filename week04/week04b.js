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
                console.log('Location ID: ' + res.rows[0].location_id);
                client.end();

                async.forEachOf(meetings[location]['meetings'], function(groupObj,group, callback) {
                    const client = new Client(db_credentials);
                    client.connect();
                        var meetingQuery = escape("INSERT INTO groups VALUES (DEFAULT, %s, %L, %L) RETURNING Group_ID;", res.rows[0].location_id, group, "");

                    client.query(meetingQuery, (err, res) => {
                        if (error) {
                            console.log(err, meetingQuery);
                        } else {
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
