# Week 01 Task
Task instructions provided by [Aaron Hill](https://github.com/aaronxhill) can be found [here](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_01.md)

The project has two dependencies, [request](https://www.npmjs.com/package/request) and [fs](https://www.npmjs.com/package/fs)

The task requires 10 URL's to be requested and saved as text files programatically. 

The 10 URLs are as follows:
```
https://parsons.nyc/aa/m01.html  
https://parsons.nyc/aa/m02.html  
https://parsons.nyc/aa/m03.html  
https://parsons.nyc/aa/m04.html  
https://parsons.nyc/aa/m05.html  
https://parsons.nyc/aa/m06.html  
https://parsons.nyc/aa/m07.html  
https://parsons.nyc/aa/m08.html  
https://parsons.nyc/aa/m09.html  
https://parsons.nyc/aa/m10.html   
```

The following code example was also provided as a starting point to the problem:

```javascript
// npm install request
// mkdir data

var request = require('request');
var fs = require('fs');

request('https://parsons.nyc/thesis-2019/', function(error, response, body){
    if (!error && response.statusCode == 200) {
        fs.writeFileSync('/home/ec2-user/environment/data/thesis.txt', body);
    }
    else {console.log("Request failed!")}
});
```
## Solution

The solution uses a for loop to iterate through a request 10 times (from index 0-9).

```javascript
for (var i = 0; i < 10; i++) {
    //request    
}
```

The URLs are all the same apart from the numbering system before the .html file extension.
Therefore the index for each iteration can be used to modify the URL string to call a different file each time.
In order to do this, a new variable `num` is created and a leading zero is added to the start of any single digit number.

```javascript
var num = 0;

if (i < 9) {
    num = '0' + (i+1)
} else {
    num = (i+1)
};
```
The URL is then split with the new `num` variable placed in the correct place: `'https://parsons.nyc/aa/m'+ num +'.html'`

The request is made using the provided sample code, using the new URL string.
The reponse from the request is either saved if valid data is returned or the resulting error message is printed.

```javascript
    request('https://parsons.nyc/aa/m'+ num +'.html', function(error, response, body){
        if (!error && response.statusCode == 200) {
            //Save the file
        } else {console.log(error)}
    });
```
## Initial Issue (resolved)
The fs module was used to assist with saving the file. To ensure that each request is saved with a new file name, the `num` variable was used within the filename.

```javascript
fs.writeFileSync('/home/ec2-user/environment/data/AA-data-' + num + '.txt', body);
```

This issue with this approach is that the requested data is not returned before the next request is made. This means that the initial index value has changed.
In mulitple tests, all requests using the `num` value of 10 (all requests completed), which meant that it constantly overwrote the previously saved file.

## (previous) Solution
To overcome this issue a sepatate counter was implemented, which was increased every time a file was saved, ensuring that all files are given a unique filename.

```javascript
    var saveCounter = 1
    
    request('https://parsons.nyc/aa/m'+ num +'.html', function(error, response, body){
        if (!error && response.statusCode == 200) {
            fs.writeFileSync('/home/ec2-user/environment/data/AA-data-' + saveCounter + '.txt', body);
            saveCounter++
        }
        else {console.log(error)}
    });

```

## Solution Update
This update is in reference to the latest commit dated 08/29/2019
While the solution detailed above functioned correctly, the use of an additional variable for incrementing the save filename was unnecessary. The initial problem where the iterator being used in the filename was changing between loop iterations can be overcome by changing the method of the iterator declaration. 

[Javascript ES6]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_2015_support_in_Mozilla) included the support for the `let` variable declaration which has the following advantages for use in this task:

_***let*** allows you to declare variables that are limited in scope to the block, statement, or expression on which it is used. This is unlike the ***var*** keyword, which defines a variable globally, or locally to an entire function regardless of block scope._ 
[source](https://medium.com/front-end-developers/es6-variable-scopes-in-loops-with-closure-9cde7a198744)

This means that by implementing the `let` declaration in place of `var`, the iterator value will remain the same for both the request and the save command. The resulting code is as follows:

```javascript
for (let i = 0; i < 10; i++) {
        let num = 0;
...
```

All code is commented in addition to this README.
