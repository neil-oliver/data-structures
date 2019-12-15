// Express Setup
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });
var moment = require('moment');

//TAMU service
var request = require('request');
const apiKey = process.env.TAMU_KEY;


// AWS Setup
var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-2";
var dynamodb = new AWS.DynamoDB();

//Postgres setup
const { Client } = require('pg');
const cTable = require('console.table');
const dotenv = require('dotenv').config();

//template setup
var fs = require('fs');
var handlebars = require('handlebars');

////////////////////////////////////////////////////////////////////////////////
//listen for information being sent from the browser (request)
app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});

//use the public folder to serve index.html and other required html files.
app.use(express.static('public'));


////////////////////////////////////////////////////////////////////////////////
// end point to return blog entries in HTML format (via handlebars)
app.get('/blog', async function (req, res) {
    // on initial load use the default values of the processBlog function.
    if (req.query == {}){
        res.send(await processBlog());
    } else {
        // when any value is changed in the HTML (via a jQuery listener) use the selected values to recall the processBlog function. 
        res.send(await processBlog(req.query.start, req.query.startyear, req.query.end, req.query.endyear, req.query.category));
        console.log(req.query)
    }
});



////////////////////////////////////////////////////////////////////////////////
// end point to return temperature data in JSON format
app.get('/temperature', async function (req, res) {
    if (req.query == {}){
        res.send(await temperature());
    } else {
        res.send(await temperature(req.query.period));
    }
});



////////////////////////////////////////////////////////////////////////////////
// end point to return AA meeting data in both JSON format and HTML format (via handlebars)
app.get('/aa', async function (req, res) {
    if (req.query == {}){
        res.send(await aa());
    } else {
        res.send(await aa(req.query.after,req.query.before,req.query.day));
    }
});

 
////////////////////////////////////////////////////////////////////////////////
function aa(after,before,day){
    //asynchonous function returns once a result from the data query has been achieved. 
    return new Promise(resolve => {
        
        // set up default values to use.
        after = after || moment().format('LT');
        before = before || "11:59 PM";
        day = day || moment().format('dddd') + 's'; 

        var output = {};
        
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
        
        // setup the query using the parameters using the default values or from the HTML passed via the express endpoint
        var thisQuery;
        thisQuery = `SELECT locations.lat, locations.long, locations.Extended_Address, locations.Location_Name, locations.Address_Line_1, locations.Zipcode, json_agg(json_build_object('group', groups.Group_Name, 'start', events.Start_at, 'end', events.End_at)) as meeting 
        FROM groups 
        INNER JOIN locations ON groups.Location_ID=locations.Location_ID 
        INNER JOIN events ON groups.Group_ID=events.Group_ID 
        WHERE events.Day = '${day}' AND events.Start_at BETWEEN time '${after}' AND time '${before}' 
        GROUP BY locations.lat, locations.long, locations.Extended_Address, locations.Location_Name, locations.Address_Line_1, locations.Zipcode;`
        
        // make a request to the database
        client.query(thisQuery, async (err, results) => {
            if(err){throw err}
            // load the handlebars template data
            await fs.readFile('./aa-handlebars.html', 'utf8', (error, data) => {
                var template = handlebars.compile(data);
                // add the data from the database request to the handlebars parameters object
                output.meetings = results.rows;
                // add the parameters to handlebars
                var html = template(output);
                // return the resulting html to the endpoint to be sent to the browser.
                resolve([html,results.rows]);
            });
            client.end();
        });
    });
 }

function temperature(period){
    return new Promise(resolve => {
    
        period = period || 'Month'
        
        var start;
        var end = new Date().toISOString();
        
        // check if either a week or month has been selected and use moment to create the correct from date.
        if (period == 'Month'){
            start = moment(end).subtract(30, 'days').format();
        } else {
            start = moment(end).subtract(7, 'days').format();
        }

        var output = {};
        // AWS RDS POSTGRESQL INSTANCE
        var db_credentials = new Object();
        db_credentials.user = 'tempadmin';
        db_credentials.host = process.env.AWSRDS_EP;
        db_credentials.database = 'tempdb';
        db_credentials.password = process.env.AWSRDS_PW;
        db_credentials.port = 5432;
        
        // Connect to the AWS RDS Postgres database
        const client = new Client(db_credentials);
        client.connect();
        
        var secondQuery = `WITH newSensorData as (SELECT * FROM sensorData WHERE sensortime BETWEEN timestamp '${start}' AND timestamp '${end}')
                  
                        SELECT
                        EXTRACT (YEAR FROM sensortime) as sensorYear,
                        EXTRACT (MONTH FROM sensortime) as sensorMonth, 
                        EXTRACT (DAY FROM sensortime) as sensorDay,
                        EXTRACT (HOUR FROM sensortime) as sensorHour, 
                        AVG(sensorValue::int) as temp_value
                        FROM newSensorData
                        GROUP BY sensorYear, sensorMonth, sensorDay, sensorHour
                        ORDER BY sensorYear, sensorMonth, sensorDay, sensorHour;`;

        var thisQuery = "SELECT * FROM sensorData ";
        thisQuery +=  "WHERE sensortime BETWEEN timestamp '"+ start + "' AND timestamp '" + end;
        thisQuery +=  "';";
    
        client.query(secondQuery, async (err, results) => {
            if (err) {
                console.log(err);
            } else {
                console.log(results.rows)
                resolve(results.rows)
            }
        });
    });
 }
 
 function processBlog(minMonth, minYear, maxMonth, maxYear, category){
    return new Promise(resolve => {
        var output = {};
        
        minMonth = minMonth || "January";
        maxMonth = maxMonth || "December";
        minYear = minYear || "2019";
        maxYear = maxYear || "2019";
        category = category || 'all';

        var minDate = minMonth+' 1,'+minYear
        var maxDate = maxMonth+' 1,'+maxYear


        output.blogpost = [];
        
        // If all categories are selected, a 'scan' request is needed instead of a query 
        if (category != 'all'){
            var params = {
                TableName : "process-blog",
                KeyConditionExpression: "category = :categoryName and created between :minDate and :maxDate", // the query expression
                ExpressionAttributeValues: { // the query values
                    ":categoryName": {S: category},
                    ":minDate": {S: new Date(minDate).toISOString()},
                    ":maxDate": {S: new Date(maxDate).toISOString()}
                }
            };
            
            dynamodb.query(params, onScan)

        // if only one category is selected, use a query as it is quicker
        } else {
            var params = {
                TableName: "process-blog",
                ProjectionExpression: "created, category, content, title, link",
                FilterExpression: "created between :minDate and :maxDate",
                 ExpressionAttributeValues: { // the query values
                    ":minDate": {S: new Date(minDate).toISOString()},
                    ":maxDate": {S: new Date(maxDate).toISOString()}
                }
            };
            
            dynamodb.scan(params, onScan)

        }
        
        // deal with the result of the scan or query            
        function onScan(err, data) {
            if (err) {
                console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
                throw(err);
            } else {
                // print all the movies
                console.log("Scan succeeded.");
                
                data.Items.sort(function(a,b){
                  return new Date(b.created.S) - new Date(a.created.S);
                });
                
                data.Items.forEach(function(item) {
                     console.log("***** ***** ***** ***** ***** \n", item);
                       // use express to create a page with that data
                     output.blogpost.push({'title':item.title.S, 'content':item.content.S, 'category':item.category.S,'created':moment(item.created.S).format('LL'), 'link': item.link.S});
                 });
                fs.readFile('./blog-handlebars.html', 'utf8', (error, data) => {
                    var template = handlebars.compile(data);
                    var html = template(output);
                    resolve(html);
                });
            }
        };
    });
 }
