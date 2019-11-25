# Weekly Assignment 10

## Express

### Static Files
Static HTML files are set up for the landing page (```index.html```) and links to three other static HTML files (```aa.html```,```blog.html``` & ```temperature.html```).
All files are located in the public folder and included using the following code.
```javascript
app.use(express.static('public'));

```
### Endpoints
Three endpoints are set up to receive information from an AJAX call.
When a call is received, the information is passed to one of the asynchronous functions (which handle the database requests).
The first call contains no data no no parameters are passed to the function.

```javascript
app.get('/aa', async function (req, res) {
    if (req.query == {}){
        res.send(await aa());
    } else {
        res.send(await aa(req.query.after,req.query.before,req.query.day));
    }
});
```

### Asynchronous Functions 
Three asynchronous functions are used to get the information from the database and return the result to the endpoint.To achieve the asynchronousity, the database call is wrapped in a promise.
```javascript
return new Promise(resolve => {
    ...
    resolve(result)
});
```
#### Optional Parameters
When no parameters are passed to the asynchronous functions, default values are used for each function. 
```javascript
after = after || moment().format('LT');
before = before || "11:59 PM";
day = day || moment().format('dddd') + 's'; 
```
## Handlebars
Before the information is passed back to the endpoint, handlebars is used to create blocks of HTML that can be directly inserted into the existing page. 
```html
{{#meetings}}
    <h1>{{extended_address}}</h1>
      {{group_name}}
      Starts at : {{start_at}}
 {{/meetings}}
```

Along with the resulting HTML data, the original JSON data is also returned for use with graphs and maps.
```javascript
var template = handlebars.compile(data);
output.meetings = results.rows;
var html = template(output);
resolve([html,results.rows]);
```
## jQuery & AJAX
jQuery and AJAX are used to monitor when any of the selection boxes are changed within the HTML and send all of the values back to an endpoint. The returned data is then inserted into an already exisiting DIV. The raw JSON values are used to build the map for the AA page and the Graph for the temperature page. 
```javascript
$(function(){
    $('select').change(function() {
        getResults()
    });
});

function getResults(){
    var parameters = { day: $('select[name="day"]').val(), after: $('select[name="after"]').val(), before: $('select[name="before"]').val() };
    $.get( '/aa',parameters, function(data) {
        $('#meetings').html(data[0])
    });
}
```

## Queries
### AA
The AA query allows the infomation to be filtered by Day, Start & End time. The default values are the current day and start time until the end of the day.
An additional query can be used to sort the results by promimity to a user given location.
```javascript
after = after || moment().format('LT');
before = before || "11:59 PM";
day = day || moment().format('dddd') + 's'; 

// optional query for use with location based sorting.
var lat = 0;
var lon = 0;
var address_line_1 = '60 W 90th Street';
var zip = '10024';

if (address_line_1 != '' && zip != '') {
    var apiRequest = 'https://geoservices.tamu.edu/Services/Geocode/WebService/GeocoderWebServiceHttpNonParsed_V04_01.aspx?';
    apiRequest += 'streetAddress=' + address_line_1.split(' ').join('%20');
    apiRequest += '&city=New%20York&state=NY&zip=' + zip + '&apikey=' + apiKey;
    apiRequest += '&format=json&version=4.01';
    
    request(apiRequest, function(err, resp, body) {
        if (err) {throw err;}
        else {
            var tamuGeo = JSON.parse(body);
            //Extract the latitude and longitude
            var lat = tamuGeo['OutputGeocodes'][0]['OutputGeocode']['Latitude'];
            var lon = tamuGeo['OutputGeocodes'][0]['OutputGeocode']['Longitude'];
            var locationQuery = "SELECT locations.Extended_Address, groups.Group_Name, events.Start_at ";
            locationQuery += ", 2 * 3961 * asin(sqrt((sin(radians((" + lat + " - locations.lat) / 2))) ^ 2 + cos(radians(locations.lat)) * cos(radians(" + lat + ")) * (sin(radians((" + lon + " - locations.long) / 2))) ^ 2)) as distance ";
            locationQuery +=  "FROM groups ";
            locationQuery +=  "INNER JOIN locations ON groups.Location_ID=locations.Location_ID ";
            locationQuery +=  "INNER JOIN events ON groups.Group_ID=events.Group_ID ";
            locationQuery +=  "WHERE events.Day = 'Mondays' AND events.Start_at BETWEEN time "+ after + " AND time " + before;
            locationQuery += " ORDER BY distance";
            locationQuery +=  ";";
        }
    });
}

var thisQuery = "SELECT locations.lat, locations.long, locations.Extended_Address, groups.Group_Name, events.Start_at ";
thisQuery +=  "FROM groups ";
thisQuery +=  "INNER JOIN locations ON groups.Location_ID=locations.Location_ID ";
thisQuery +=  "INNER JOIN events ON groups.Group_ID=events.Group_ID ";
thisQuery +=  "WHERE events.Day = '" + day +"' AND events.Start_at BETWEEN time '"+ after + "' AND time '" + before;
thisQuery +=  "';";


client.query(thisQuery, async (err, results) => {
    if(err){throw err}
    await fs.readFile('./aa-handlebars.html', 'utf8', (error, data) => {
        var template = handlebars.compile(data);
        output.meetings = results.rows;
        var html = template(output);
        resolve([html,results.rows]);
    });
    client.end();
});
```
### Blog
The blog query allows for filtering by start and end date. The default values are from the start of the first blog entries through to the current date.
```javascript
minDate = minDate || "September 1, 2019";
maxDate = maxDate || moment().format('ll');
        
var params = {
    TableName : "process-blog",
    KeyConditionExpression: "category = :categoryName and created between :minDate and :maxDate", // the query expression
    ExpressionAttributeValues: { // the query values
        ":categoryName": {S: "data-structures"},
        ":minDate": {S: new Date(minDate).toISOString()},
        ":maxDate": {S: new Date(maxDate).toISOString()}
    }
};

dynamodb.query(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded.");
        data.Items.forEach(function(item) {
            console.log("***** ***** ***** ***** ***** \n", item);
              // use express to create a page with that data
            output.blogpost.push({'title':item.title.S, 'body':item.content.S});
        });

        fs.readFile('./blog-handlebars.html', 'utf8', (error, data) => {
            var template = handlebars.compile(data);
            var html = template(output);
            resolve(html);
        });
    }
});
```

### Temperature Sensor
The temperature sensor query requests all of the information from either the previous week (7 days) or previous 30 days. The default value is set to the previous 30 days.
Two querys are available to be able to switch from using every data point to the average of each hour.

```javascript
period = period || 'Month'

var start;
var end = new Date().toISOString();

if (period == 'Month'){
    start = moment(end).subtract(30, 'days').format();
} else {
    start = moment(end).subtract(7, 'days').format();
}

//use this query results to be average of each hour.
var averageQuery = `WITH newSensorData as (SELECT sensorTime - INTERVAL '5 hours' as adjSensorTime, * FROM sensorData)
SELECT
EXTRACT (MONTH FROM adjSensorTime) as sensorMonth, 
EXTRACT (DAY FROM adjSensorTime) as sensorDay,
EXTRACT (HOUR FROM adjSensorTime) as sensorHour, 
AVG(sensorValue::int) as temp_value
FROM newSensorData
WHERE sensortime BETWEEN timestamp '${start}' AND timestamp '${end}'
GROUP BY sensorMonth, sensorDay, sensorHour
ORDER BY sensorMonth, sensorDay, sensorHour;`;
        
var thisQuery = "SELECT * FROM sensorData ";
thisQuery +=  "WHERE sensortime BETWEEN timestamp '"+ start + "' AND timestamp '" + end;
thisQuery +=  "';";

client.query(thisQuery, async (err, results) => {
    if (err) {
        console.log(err);
    } else {
        await fs.readFile('./temperature-handlebars.html', 'utf8', (error, data) => {
            var template = handlebars.compile(data);
            output.tempreading = results.rows;
            var html = template(output);
            resolve(results.rows)
            //resolve(html);
        });
    }
});
```

