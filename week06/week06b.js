// AWS Setup
var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-2";
var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "process-blog",
    KeyConditionExpression: "category = :categoryName and created between :minDate and :maxDate", // the query expression
    ExpressionAttributeValues: { // the query values
        ":categoryName": {S: "data-structures"},
        ":minDate": {S: new Date("August 28, 2019").toISOString()},
        ":maxDate": {S: new Date("October 11, 2019").toISOString()}
    }
};

dynamodb.query(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded.");
        data.Items.forEach(function(item) {
            console.log("***** ***** ***** ***** ***** \n", item);
        });
    }
});