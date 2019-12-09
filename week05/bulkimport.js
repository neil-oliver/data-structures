// AWS Setup
var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-2";
var dynamodb = new AWS.DynamoDB();

var moment = require('moment');

const csv = require('csv-parser');
const fs = require('fs');

//constructor class for a blog post entry
class BlogEntry {
  constructor(category, created, title, author, content, link, published, tags, images, emotion, activity, food) {
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
    this.link = {};
    this.link.S = link;
    this.published = {};
    if (published == 'on'){
      this.published.BOOL = true;
    } else {
      this.published.BOOL = false;
    }
    if (tags != "") {
      this.tags = {};
      this.tags.SS = tags;
    }
    if (images != "") {
      this.images = {};
      this.images.SS = images;
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
      this.food.SS = food; 
    }
  }
}


fs.createReadStream('Blog-posts.csv')
  .pipe(csv())
  .on('data', (row) => {
    console.log(row);
    
    // construct the blog post using the data
    // reminder: constructor(category, created, title, author, content, tags published, tags, images, emotion, activity, food) 
    var post = new BlogEntry(row.Category, moment(row.Created).toISOString(), row.Title, row.Author, row.Content, row.Link, true, [row.Tags], [row.Images], row.Emotions, row.Activity, [row.Food]);
    console.log(post)
    // set up putItem for DynamoDB
    var params = {};
    params.Item = post; 
    params.TableName = "process-blog";
    var reply='';
    
    // attempt to save the information and display a message on success or error
    dynamodb.putItem(params, function (err, data) {
    
    if (err != null){console.log(err)}
    
    });
    
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });
