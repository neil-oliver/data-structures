var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });

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
            <input type="text" name="title"><br>\
            Categories (separated by commas)<br>\
            <input type="text" name="catergories"><br>\
            Content<br>\
            <textarea name="content" rows="10"></textarea><br>\
            Featured Image<br>\
            <input type="featured_img" placeholder="Optional"><br>\
            Tags<br>\
            <input type="text" name="tags "placeholder="Optional"><br>\
            Publish &nbsp;\
            <input type="checkbox" name="published"><br>\
            <input type="submit">\
        </form>\
    </body>\
</html>'

  res.send(html); 
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
  //call this app from https://<workspace name>-<user name>.c9users.io
});

app.post('/', urlencodedParser, function (req, res){
  var reply='';
  reply += "Your blog post " + req.body.title + " has been successfully stored";
  reply += '<br><input type="button" value="Write another post!" onclick="history.back()">';

  postIt(req.body)

  res.send(reply);
 });
 
 function postIt(data){
     console.log(data)
 }