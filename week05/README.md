# Week 05
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
