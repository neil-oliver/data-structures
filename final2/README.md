## Final Assignment 2
# Blog

Details of the Assignment can be found [here](https://github.com/visualizedata/data-structures/blob/master/final_assignment_2.md).  

Details of the process building up to the final assignment can be found in the 
[Week5](https://github.com/neil-oliver/data-structures/tree/master/week05), 
[Week6](https://github.com/neil-oliver/data-structures/tree/master/week06), 
[Week10](https://github.com/neil-oliver/data-structures/tree/master/week10) & 
[Week11](https://github.com/neil-oliver/data-structures/tree/master/week11) Folders. 

![Blog Screenshot](./blog-screenshot.png)
## Endpoints
An endpoint was created using node express but is not directly accessed by the user.
The user is served a static HTML page and an AJAX call is made using JQuery to request data from the endpoint. 
```javascript
function getResults(){
    
    $.get( '/blog',parameters, function(data) {
    ...
    });
}

function init(){
    getResults()
}
```
The response from the endpoint contains HTML formatted data via handlebars.
This information is then loaded into the HTML using jQuery.
  
## Filtering
### Category Filtering
Query 
Scan

### Time Filtering
Creating dates
Stopping invalid date selections

## Fontend Design
### Custom Design
Slide design
Focus elements

### Handlebars
Creating custom elements

## Data Entry
Custom entry form
bulk importer
