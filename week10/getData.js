// Express Setup
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });
var moment = require('moment');

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

app.use(express.static('public'));


////////////////////////////////////////////////////////////////////////////////
app.get('/blog', async function (req, res) {
    if (req.query == {}){
        res.send(await processBlog());
    } else {
        res.send(await processBlog(req.query.start,req.query.end));
    }
});



////////////////////////////////////////////////////////////////////////////////
app.get('/temperature', async function (req, res) {
    if (req.query == {}){
        res.send(await temperature());
    } else {
        res.send(await temperature(req.query.period));
    }
});



////////////////////////////////////////////////////////////////////////////////

app.get('/aa', async function (req, res) {
    if (req.query == {}){
        res.send(await aa());
    } else {
        res.send(await aa(req.query.after,req.query.before,req.query.day));
    }
});

 
////////////////////////////////////////////////////////////////////////////////
function aa(after,before,day){
    return new Promise(resolve => {
    
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
    
        
        var thisQuery = "SELECT locations.lat, locations.long, locations.Extended_Address, groups.Group_Name, events.Start_at ";
        thisQuery +=  "FROM groups ";
        thisQuery +=  "INNER JOIN locations ON groups.Location_ID=locations.Location_ID ";
        thisQuery +=  "INNER JOIN events ON groups.Group_ID=events.Group_ID ";
        thisQuery +=  "WHERE events.Day = '" + day +"' AND events.Start_at BETWEEN time '"+ after + "' AND time '" + before;
        thisQuery +=  "';";
        
    
        client.query(thisQuery, async (err, results) => {
            if(err){throw err}
            await fs.readFile('./aa-handlebars.html', 'utf8', (error, data) => {
                var template = handlebars.compile(data);
                output.meetings = results.rows;
                var html = template(output);
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
        
        // Sample SQL statements for checking your work: 
        //var thisQuery = "SELECT * FROM sensorData;"; // print all values
        var thisQuery = "SELECT * FROM sensorData ";
        thisQuery +=  "WHERE sensortime BETWEEN timestamp '"+ start + "' AND timestamp '" + end;
        thisQuery +=  "';";
    
        client.query(thisQuery, async (err, results) => {
            if (err) {
                console.log(err);
            } else {
                await fs.readFile('./temperature-handlebars.html', 'utf8', (error, data) => {
                    var template = handlebars.compile(data);
                    output.tempreading = results.rows;
                    var html = template(output);
                    resolve(results.rows)
                    //resolve(html);
                });
            }
        });
        
    });
     
 }
 
 function processBlog(minDate, maxDate){
    return new Promise(resolve => {
        var output = {};

        minDate = minDate || "September 1, 2019";
        maxDate = maxDate || moment().format('ll');

        output.blogpost = [];
        //what do i want?
        var params = {
            TableName : "process-blog",
            KeyConditionExpression: "category = :categoryName and created between :minDate and :maxDate", // the query expression
            ExpressionAttributeValues: { // the query values
                ":categoryName": {S: "data-structures"},
                ":minDate": {S: new Date(minDate).toISOString()},
                ":maxDate": {S: new Date(maxDate).toISOString()}
            }
        };
        
        //go get it...
        dynamodb.query(params, function(err, data) {
            if (err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            } else {
                console.log("Query succeeded.");
                data.Items.forEach(function(item) {
                    console.log("***** ***** ***** ***** ***** \n", item);
                      // use express to create a page with that data
                    output.blogpost.push({'title':item.title.S, 'body':item.content.S});
                });
    
                fs.readFile('./blog-handlebars.html', 'utf8', (error, data) => {
                    var template = handlebars.compile(data);
                    var html = template(output);
                    resolve(html);
                });
            }
        });
    });
 }
