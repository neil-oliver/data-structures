# Week 05 Task

Task instructions provided by [Aaron Hill](https://github.com/aaronxhill).

Full instructions for this tasks can be found on the Parsons MSDV [Data Structures GitHub Page](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_05.md).

This task requires a progress blog to be created using AWS DynamoDB. The project uses the [AWS Javascript SDK](https://www.npmjs.com/package/aws-sdk), the [express web framework](http://expressjs.com) and [body-parser](https://www.npmjs.com/package/body-parser) as dependencies.  
  
# Research
  
## Exisiting Blogs
Popular blog and social media interfaces were investigated to see common features that may be useful to include in the design of the progress blog. 
### Wordpress
![](https://github.com/neil-oliver/data-structures/blob/master/week05/images/wordpress-admin-dashboard.png)
![](https://github.com/neil-oliver/data-structures/blob/master/week05/images/wordpress-admin-blogpost.jpg)
### Ghost
![](https://github.com/neil-oliver/data-structures/blob/master/week05/images/ghost-admin.png)
### Tumblr
![](https://github.com/neil-oliver/data-structures/blob/master/week05/images/Tumblr-add-text-post.png)
### Facebook
![](https://github.com/neil-oliver/data-structures/blob/master/week05/images/Facebook-post.png)
## AWS DynamoDB Data Types
![](https://github.com/neil-oliver/data-structures/blob/master/week05/images/DynamoDB-Datatypes.png)
## Initial Database Design
Based on the initial research the initial NoSQL database design is:
![](https://github.com/neil-oliver/data-structures/blob/master/week05/images/process_blog_design.png)  
**Title** : String  
**Author** : String  
**Created** : Javascript Date Format  
**Updated** : Javascript Date Format  
**Content** : String *(HTML)*  
**Category** : String  
**Emotion** : String  
**Food** : [String]  
**Activity** : String  
**Tags** : [String]  
**Images** : [String] *(Hyperlinks)*  
**Publish** : Bool  
  
### Exclusions
Details such as links to social media, comments and different levels of access are not required. If additional links are required they can be included in the HTML of the content field. 

## Partition Keys and Sort Keys
Due to cost limitations, no additional indexes will be placed on the NoSQL DynamoDB database. As the progress blog is quite simplistic, this will not be an issue however consideration does need to be paid to the choice of the the partition key and the sort key. The clearest explanation of the differences between the two keys and how to select them came from a [stack overflow post](https://stackoverflow.com/questions/56166332/what-is-the-difference-between-partition-key-and-sort-key-in-amazon-dynamodb) by [wzdv](https://stackoverflow.com/users/2947592/wvdz).  
![](https://github.com/neil-oliver/data-structures/blob/master/week05/images/partition%26sort_keys.png)

### AWS Dynamo Query Expressions
In addition to the infomation avove. The [AWS Documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html#FilteringResults) gives some very important information about the different posibilities between querying the partition key and the sort key. 
  
**You must specify the partition key name and value as an equality condition.**  
*You can optionally provide a second condition for the sort key (if present). The sort key condition must use one of the following comparison operators:*  
  
*a = b — true if the attribute a is equal to the value b*  
*a < b — true if a is less than b*  
*a <= b — true if a is less than or equal to b*  
*a > b — true if a is greater than b*  
*a >= b — true if a is greater than or equal to b*  
*a BETWEEN b AND c — true if a is greater than or equal to b, and less than or equal to c.*  
  
*The following function is also supported:*  
*begins_with (a, substr)— true if the value of attribute a begins with a particular substring.*  
  
This means that the sort key is in fact **more powerful** than the partition key for querying, as both relational operators and the ```begins_with``` command can be used on it.  
Based on this research the following choices have been made:  
  
**Partition Key** : Category  
**Sort Key** : Created *(Creation Date)*  

# Design
## Admin Page
For easy entry of blog information (and to assist with the database design), first a basic HTML page was created.
![](https://github.com/neil-oliver/data-structures/blob/master/week05/images/admin%20page.png)

This HTML code was then transfered into node and displayed in the browser using the [express web framework](http://expressjs.com) and [body-parser](https://www.npmjs.com/package/body-parser) module to allow for information to be easily transfered between browser and server.
**The webpage that is created is only accessible through the cloud9 server**.

```javascript
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

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});

app.post('/', urlencodedParser, async function (req, res){
    res.send(reply);
 });
```

## Saving to DynamoDB
To ensure condsistent data is saved to the database, a constructor is used to build the information being sent to the DynamoDB database.
```javascript
class BlogEntry {
  constructor(category, created, title, author, content, published, tags, images, emotion, activity, food) {
    this.category = {}; // Partition Key
    this.category.S = category;
    this.created = {}; // Sort Key
    this.created.S = created;
    this.updated = {};
    this.updated.S = Date.now().toString();
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
```
When the submit button is pressed on the admin page, the information is sent back to the server and used to build a blog post using the contructor above. This blog post is then sent to the dynamoDB server.
```javascript
app.post('/', urlencodedParser, async function (req, res){
  
  var post = new BlogEntry(req.body.category, Date.now().toString(), req.body.title, req.body.author, req.body.content, req.body.published, req.body.tags, req.body.images, req.body.emotion, req.body.activity, req.body.food);
  
  var params = {};
  params.Item = post; 
  params.TableName = "process-blog";
  var reply='';
  
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
```
## Post Confirmation
The response from the ```putItem``` request is checked for an error before displaying a message on the admin HTML page. 
  
![](https://github.com/neil-oliver/data-structures/blob/master/week05/images/success-message.png)

The AWS Console also allows for the information to be displayed. This allows for easy confirmation that the information has been saved.  
  
![](https://github.com/neil-oliver/data-structures/blob/master/week05/images/database-screenshot.png)
