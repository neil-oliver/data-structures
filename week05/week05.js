// Express Setup
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });

// AWS Setup
var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-2";
var dynamodb = new AWS.DynamoDB();

//constructor class for a blog post entry
class BlogEntry {
  constructor(category, created, title, author, content, published, tags, images, emotion, activity, food) {
    this.category = {}; // Partition Key
    this.category.S = category;
    this.created = {}; // Sort Key
    this.created.S = created;
    this.updated = {};
    this.updated.S = new Date().toISOString();
    this.title = {};
    this.title.S = title;
    this.author = {};
    this.author.S = author;
    this.content = {};
    this.content.S = content;
    this.published = {};
    if (published == 'on'){
      this.published.BOOL = true;
    } else {
      this.published.BOOL = false;
    }
    if (tags != "") {
      this.tags = {};
      this.tags.SS = '[' + tags + ']';
    }
    if (images != "") {
      this.images = {};
      this.images.SS = '[' + images + ']';
    }
    if (emotion != "") {
      this.emotion = {};
      this.emotion.S = emotion;
    }
    if (activity != "") {
      this.activity = {};
      this.activity.S = activity;
    }
    if (food != "") {
      this.food = {};
      this.food.SS = '[' + food + ']'; 
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// use node to create a webpage
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
            <input type="text" name="category" placeholder="Required"><br>\
            Content<br>\
            <textarea name="content" rows="10"></textarea><br>\
            Images<br>\
            <input type="text" name="images" placeholder="Optional"><br>\
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

//listen for information being sent from the browser (request)
app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});

app.post('/', urlencodedParser, async function (req, res){
  
  // construct the blog post using the data
  // reminder: constructor(category, created, title, author, content, published, tags, images, emotion, activity, food) 
  var post = new BlogEntry(req.body.category, new Date().toISOString(), req.body.title, req.body.author, req.body.content, req.body.published, req.body.tags, req.body.images, req.body.emotion, req.body.activity, req.body.food);
  console.log(post)
  // set up putItem for DynamoDB
  var params = {};
  params.Item = post; 
  params.TableName = "process-blog";
  var reply='';
  
  // attempt to save the information and display a message on success or error
  dynamodb.putItem(params, function (err, data) {
    
    if (err != null){
      console.log(err, err.stack); // an error occurred
      reply += "There was a problem saving your blog post.";
      reply += '<br><input type="button" value="Go back and try again!" onclick="history.back()">';
    }else {
      console.log('success!');// successful response
      reply += "Your blog post '" + req.body.title + "' has been successfully stored";
      reply += '<br><input type="button" value="Write another post!" onclick="history.back()">';
    }
    
    res.send(reply);
  });
 });
