# Week 02 Task
Task instructions provided by [Aaron Hill](https://github.com/aaronxhill).

The project has three dependencies, [request](https://www.npmjs.com/package/request), [fs](https://www.npmjs.com/package/fs) and [Cheerio](https://www.npmjs.com/package/cheerio).

The task requires the information from [Task 01](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_01.md) to be broken down into a usable data structure. 

Details of the previous solution can be found [here](https://github.com/neil-oliver/data-structures/tree/master/week01)

## Reloading Saved Data
The reloading code was separated out into a function for easier implementation or resuse within future developments.
The code used the same loop approach as the previous task, with the save code being replaced with the following code.

```javascript
fs.readFile('/home/ec2-user/environment/week01/data/AA-data-'+ num +'.txt', 'utf8', (error, data) => {
  if (error) throw error;
  getMeetings(data, meetings);
});
```
On loading the saved data, a scraping function is called, passing it both the saved data and an (initially empty) array of meeting details.

## Finding the usable data
The data is loaded into Cheerio ```const $ = cheerio.load(file);``` to parse the data into a traverable DOM model.
The saved data not only contains the meeting details, but also the addition HTML for the page. The first step is therefore is to traverse through the model to find the meeting details.
The details are within three table rows.

```html
<table>
    <tr>
        <tr>
            <tr>
              Meeting Details Here
            </tr>
        </tr>
    </tr>
</table>
```

This is achieved with the following code

```javascript
$('tr tr tr').each(function(i, item) {
});
```

## Breaking down the data
Within the resulting data there are three table data sections, the location details, the times of the meeting and additional details and links.
The data from each of these sections is extracted using ```var location = $(this).children().eq(0).text().split('\n').map(item => item.trim()).filter(Boolean)``` changing the index to access each section.

```$(this).children().eq(0).text()``` accesses the initial information in each table data section.
```.split('\n')``` Splits the data at each line break creating an array of separate items.
```.map(item => item.trim())``` strips out the additional whitespace around each of the items.
```.filter(Boolean)``` ensures that no blank elements are saved into the array.

The name of each of the meetings is seapated out separately by searching for the ```<h4> tag in the table data ```var name = $(this).find('h4').text();```

The name, location and meeting times are combined into an object and added to the meetings array. The array is then returned.

```javascript
meetings[meetings.length] = {
    'Name' : name,
    'Location' : location,
    'Times' : times
};
 
return meetings;
```

The details for each meeting can now be accessed by looping through the meetings array and using the key for ```['Name]```,```['Location']``` and ```['Times']```.
