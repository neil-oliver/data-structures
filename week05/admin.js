// Express Setup
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });

// AWS Setup
var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-1";

var dynamodb = new AWS.DynamoDB();

 class BlogEntry {
  constructor(category, created, title, author, content, published, tags, images, emotion, activity, food) {
    this.category = {}; // Partition Key
    this.category.S = category;
    this.created = {}; // Sort Key
    this.created.S = new Date(created).toDateString();
    this.updated = {};
    this.updated.S = Date.now().toDateString();
    this.title = {};
    this.title.S = title;
    this.author = {};
    this.author.S = author;
    this.content = {};
    this.content.S = content;
    this.published = {};
    this.published.BOOL = published; 
    if (tags != null) {
      this.tags = {};
      this.tags.SS = tags;
    }
    if (images != null) {
      this.images = {};
      this.images.SS = images;
    }
    if (emotion != null) {
      this.emotion = {};
      this.emotion.S = emotion;
    }
    if (activity != null) {
      this.activity = {};
      this.activity.S = activity;
    }
    if (food != null) {
      this.food = {};
      this.food.SS = food; 
    }
  }
}

////////////////////////////////////////////////////////////////////////////////

app.get('/', function (req, res) {
  var html='<!DOCTYPE html>\
<html>\
    <head>\
        <title>Progress Blog Admin Page</title>\
        <style>\
            input, textarea {width : 50%;}\
        </style>\
    </head>\
    <body>\
        <form action="/" method="POST">\
            Author<br>\
            <input type="text" value="Admin" name="author"><br>\
            Title<br>\
            <input type="text" name="title" placeholder="required"><br>\
            Category<br>\
            <input type="text" name="catergory" placeholder="Required"><br>\
            Content<br>\
            <textarea name="content" rows="10"></textarea><br>\
            Images<br>\
            <input type="images" placeholder="Optional"><br>\
            Tags<br>\
            <input type="text" name="tags" placeholder="Optional"><br>\
            How are you feeling?<br>\
            <input type="text" name="emotion" placeholder="Optional"><br>\
            What are you doing?<br>\
            <input type="text" name="activity" placeholder="Optional"><br>\
            What are you eating?<br>\
            <input type="text" name="food" placeholder="Optional"><br>\
            Publish &nbsp;\
            <input type="checkbox" name="published"><br>\
            <input type="submit">\
        </form>\
    </body>\
</html>';

  res.send(html); 
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
  //call this app from https://<workspace name>-<user name>.c9users.io
});

app.post('/', urlencodedParser, function (req, res){
  //constructor(category, created, title, author, content, published, tags, images, emotion, activity, food) 

  var post = new BlogEntry(req.body.category, Date.now().toDateString(), req.body.title, req.body.author, req.body.content, req.body.published, [req.body.tags], [req.body.images], req.body.emotion, req.body.activity, [req.body.food]);
  var result = postIt(post);
  var reply='';
  if (result == true){
  reply += "Your blog post " + req.body.title + " has been successfully stored";
  } else {
    reply += "There was a problem saving your blog post.";
  }
  reply += '<br><input type="button" value="Go back" onclick="history.back()">';

  res.send(reply);
 });
 
 ///////////////////////////////////////////////////////////////////////////////
 
 function postIt(data){
  var params = {};
  params.Item = data; 
  params.TableName = "process-blog";
  
  dynamodb.putItem(params, function (err, data) {
    if (err){
      console.log(err, err.stack); // an error occurred
      return false;
    }else {
      console.log(data);// successful response
      return true;
    }
  });
 }