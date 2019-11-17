// Express Setup
var express = require('express');
var app = express();

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

app.use(express.static('public'));

// use node to create a webpage
app.get('', function (req, res) {
    var output = "<head><link rel='stylesheet' type='text/css' href='styles.css'/></head><h1>Process Blog</h1><p><a href='/blog'>Go to the Blog</a></p><p><a href='/aa'>AA</a></p><p><a href='/temperature'>It's cold in here!</a></p>";
    res.send(output); 

});

app.get('/blog', function (req, res) {
    
    var output = {};
    output.blogpost = [];
    //what do i want?
    var params = {
        TableName : "process-blog",
        KeyConditionExpression: "category = :categoryName and created between :minDate and :maxDate", // the query expression
        ExpressionAttributeValues: { // the query values
            ":categoryName": {S: "data-structures"},
            ":minDate": {S: new Date("August 20, 2018").toISOString()},
            ":maxDate": {S: new Date("October 11, 2020").toISOString()}
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

            fs.readFile('./blog.html', 'utf8', (error, data) => {
                var template = handlebars.compile(data);
                var html = template(output);
                res.send(html)
            })
        }
    });
});

app.get('/aa', function (req, res) {
    
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
    
    
    var after = "'6:00 PM'";
    var before = "'8:00 PM'";
    
    var thisQuery = "SELECT locations.Extended_Address, groups.Group_Name, events.Start_at ";
    thisQuery +=  "FROM groups ";
    thisQuery +=  "INNER JOIN locations ON groups.Location_ID=locations.Location_ID ";
    thisQuery +=  "INNER JOIN events ON groups.Group_ID=events.Group_ID ";
    thisQuery +=  "WHERE events.Day = 'Mondays' AND events.Start_at BETWEEN time "+ after + " AND time " + before;
    thisQuery +=  ";";
    
    
    client.query(thisQuery, (err, results) => {
        console.log(err);
        
        //print out the rows element of response
        fs.readFile('./aa.html', 'utf8', (error, data) => {
            var template = handlebars.compile(data);
            output.meetings = results.rows
            var html = template(output);
            res.send(html)
        })

        client.end();
    });

});

app.get('/temperature', function (req, res) {
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
    var thisQuery = "SELECT * FROM sensorData;"; // print all values

    client.query(thisQuery, (err, results) => {
        if (err) {console.log(err)}
        else {
            fs.readFile('./temperature.html', 'utf8', (error, data) => {
                var template = handlebars.compile(data);
                output.tempreading = results.rows
                var html = template(output);
                res.send(html)
            })
        }
    });

    
});


//listen for information being sent from the browser (request)
app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});

