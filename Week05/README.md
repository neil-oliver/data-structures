# Week 05
## Research
Three popular blog interfaces were investigated to see common features that may be useful to include in the design of the progress blog. 
### Wordpress
![](https://github.com/neil-oliver/data-structures/blob/master/Week05/wordpress-admin-dashboard.png)
![](https://github.com/neil-oliver/data-structures/blob/master/Week05/wordpress-admin-blogpost.jpg)
### Ghost
![](https://github.com/neil-oliver/data-structures/blob/master/Week05/ghost-admin.png)
### Tumblr
![](https://github.com/neil-oliver/data-structures/blob/master/Week05/Tumblr-add-text-post.png)
## Initial Database Design
Based on the initial research the initial NoSQL database design is:

**Title** : String
**Author** : String
**Created** : Javascript Date Format
**Updated** : Javascript Date Format
**Content** : String *(HTML)*
**Category** : [String]
**Tags** : [String]
**Images** : [String] *(Hyperlinks)*
**Publish** : Bool

### Exclusions
Details such as links to social media, comments and different levels of access are not required. If additional links are required they can be included in the HTML of the content field. 
