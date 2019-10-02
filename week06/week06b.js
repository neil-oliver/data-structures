// AWS Setup
var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-2";
var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "process-blog",
    KeyConditionExpression: "category = :categoryName and created = :created", // the query expression
    ExpressionAttributeValues: { // the query values
        ":categoryName": {S: "development"},
        ":created": {S: "1569609251575"}
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