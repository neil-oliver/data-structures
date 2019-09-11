# Week 02 Task
Task instructions provided by [Aaron Hill](https://github.com/aaronxhill).

The project has three dependencies, [request](https://www.npmjs.com/package/request), [fs](https://www.npmjs.com/package/fs) and [Cheerio](https://www.npmjs.com/package/cheerio).

Full instructions for this tasks can be found on the Parsons MSDV [Data Structures GitHub Page](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_02.md).
This task focuses on parsing a single HTML file (saved in a [previous task](https://github.com/neil-oliver/data-structures/tree/master/week01)) and resaving the data in a reusable format. 

**The solution detailed below creates a saved CSV file containing the addresses of 53 AA Meetings, which matches the number of meetings listed in the [M07.html](https://parsons.nyc/aa/m07.html) file.**

## Reloading Saved Data
The information from the previous task can be reloaded into a string variable with the file system module.

```javascript
fs.readFile('/home/ec2-user/environment/week01/data/AA-data-07.txt', 'utf8', (error, data) => {
  if (error) throw error;
  ...
});
```

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

This is achieved with the following code:

```javascript
$('tr tr tr').each(function(i, item) {
});
```

The first set of data that is received is the table headings. These can be skipped using the index value
```javascript
if (i != 0){
    ...
}
```

## Breaking down the data
Within the resulting data there are three table data sections, the location details, the times of the meeting and additional details and links.
The data from each of these sections is extracted using the following code (changing the index to access each section).
The first of these sections contains all of the information we require for this task, plus some additional details. This section can be accessed through the following code:
```javascript
$(this).children().eq(0)
``` 

Once within this ```td``` section, three sections of HTML are removed. The bold meeting description, wheelchair access and additional information.
```javascript
$(this).children().eq(0).find('div').remove().html();
$(this).children().eq(0).find('b').remove().html();
$(this).children().eq(0).find('span').remove().html();
```
*This information can be saved into separate variables before deleting with the same code without the ```.remove()``` keyword.*

The remaining code is then saved into a variable
```javascript
var location = $(this).children().eq(0).text().split(/\n|,|\(|\)/).map(item => item.trim()).filter(Boolean);
```

The data is then split at each line break, comma and bracket, creating an array of separate items.
```javascript
.split(/\n|,|\(|\)/)
``` 

Whitespace (additional spaces) are then stripped out of the remaining text.
```javascript
.map(item => item.trim())
``` 

Finally any additional blank entries that are remaining in the array created by the ```.split()``` command are removed.
```javascript
.filter(Boolean)
```

## Creating a save string
At the top of the .js file a new file is created with a single line of text containing comma separted headings.
```javascript
fs.writeFileSync('data/AA-data-07.csv', "Location_Name,Address_Line_1,State,Zipcode,Extended_Address\n");
```

The details that are required to be saved are then extracted from the array and combined into a comma separated string.
The location name and the first line of the address are always the first two elements in the array. As all of the data originates from New York, this is entered manually (not manipulating the original data) as this is missing in some instances of the address.
```javascript
var saveString = location[0] + ',' + location[1] + ',' + 'NY,' + location[location.length - 1].replace(/\D+/g, '') + ',' + "\"" + location.join(',') + "\"";
```

Finally the zipcode is always the final item in the HTML, however it sometimes included the NY state code at the start. The NY code is removed with the following code.
```javascript
.replace(/\D+/g, '')
```
The ```\D``` represents all non digits. This solution was provided by [Molecular Man](https://stackoverflow.com/questions/9309278/javascript-regex-replace-all-characters-other-than-numbers)

## Saving the information
The final step was to save the information into the previously created file. In order to not overwrite the previous information, it must be *appended*.
```javascript
fs.appendFileSync('data/AA-data-07.csv', saveString + '\n');
```
The ```\n``` code at the end of the request starts a new line in the file for each entry.
