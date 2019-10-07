# Week 07 Task
Task instructions provided by [Aaron Hill](https://github.com/aaronxhill).

Full instructions for this tasks can be found on the Parsons MSDV [Data Structures GitHub Page](https://github.com/visualizedata/data-structures/blob/master/weekly_assignment_07.md).

This task was completed including a detailed writeup during the [Week 4](https://github.com/neil-oliver/data-structures/tree/master/week03) [Weekly Data Structures Tasks](https://github.com/neil-oliver/data-structures).
A few amendments were suggested during that stage, so these will be addressed and discussed in this weeks code and README.

## Suggested amendments from previous task
### Issue 1
**The code was cleaned to a good level, with the only remaining issues being a very small amount of missing information. This could be rectified in some cases using the TAMU response data to replace insistent data or fill in missing gaps such as zip codes.**

Incorrect initial assessment as TAMU response. While TAMU does respond with an address, it is simply the input address formatted slightly differently (in capitals). 
To validate and retify addresses with missing information, an additional serivice such as the [USPS Web Tools API](https://www.usps.com/business/web-tools-apis/#api) could be used.  

![](https://github.com/neil-oliver/data-structures/blob/master/week07/images/less-than-perfect.png)

To deduce if this step was needed a ```less-than-perfect.csv``` file was created which only listed the addresses with a less than 100% match score. While there are 60 addresses with a less than perfect score, **all addresses are legible, have extracted all original data contained in the AA webpage, and have successfully been geocoded.**
#### Example Issue - missing space

![](https://github.com/neil-oliver/data-structures/blob/master/week07/images/address-issue-1.png)

#### Example Issue - missing zipcode
![](https://github.com/neil-oliver/data-structures/blob/master/week07/images/address-issue-2.png)

I therefore decided that the additional validation and cleaning step was not required and would offer no large benefit to the overall final project.
### Issue 2
**The start and end fields could be time datatype but would not currently accept current JSON value. This should be updated for better searching through the GUI.** 

This was fixed during the implementation of the postgreSQL query in [Task 6](https://github.com/neil-oliver/data-structures/tree/master/week06).

## Additional Changes
### Additional Address Line 1 Clean Up
After manual validation checking (no manual data manipulation). The following changes to clean ```address_line_1``` could be beneficial.

Split at ```@``` symbol.
```javascript
var location = $(this).children().eq(0).text().split(/\n|,|\(|\)|-|@/).map(item => item.trim()).filter(Boolean);
```

Split at ```street.```
```javascript
var newLoc = location[0].split('Street.');
location[0] = newLoc[0];
```
Split at ```Rm```
```javascript
var newLoc = location[0].split('Rm');
location[0] = newLoc[0];
```
Replace ```St.``` if no text after (to avoid replacing St. Marks for example.)
```javascript
if (location[0].substr(location[0].length - 3) == 'St.' || location[0].substr(location[0].length - 2) == 'St' ) {
   location[0] = location[0].replace(" St.", " Street");
   console.log('replaced St.');
}
```

### Include additional details for group
Change in JSON Struture
#### Original
```javascript
"meetings": {
    "Meeting Name": [
        {
            "day": "",
            "start": "",
            "end": "",
            "type": ""
        }
    ]
}
```
#### Updated
```javascript
"meetings": {
    "Meeting Name": {
        "Times" : [
            {
                "day": "",
                "start": "",
                "end": "",
                "type": ""
            }
        "Details" : ""
    ]
}
```
Code changes to get and save meeting details
```javascript
var detailsBox = $(this).children().eq(0).find($('.detailsBox')).text().trim();

if (meetings[locationName]['meetings'].hasOwnProperty(meetingName)) {
    meetings[locationName]['meetings'][meetingName]['times'].push(timesObj);
} else {
    meetings[locationName]['meetings'][meetingName] = {};
    meetings[locationName]['meetings'][meetingName]['times'] = [timesObj];
    meetings[locationName]['meetings'][meetingName]['details'] = detailsBox;
}
```
#### Sample
```javascript
  "Peter Jay Sharpe Building": {
    "address": {
      "line_1": "223 East 117th Street",
      "city": "New York",
      "state": "NY",
      "zip": "10035",
      "friendly": "223 East 117th Street,1st Floor Dining Room,Betw. 2nd & 3rd Avenues,NY 10035",
      "wheelchair_access": true,
      "zone": "09",
      "coords": {
        "latitude": "40.7982106",
        "longitude": "-73.9382769",
        "score": "100"
      }
    },
    "meetings": {
      "East Harlem": {
        "times": [
          {
            "day": "Tuesdays",
            "start": "6:30 PM",
            "end": "7:30 PM",
            "type": "B",
            "specialInterest": "Living Sober"
          }
        ],
        "details": "Living Sober 1st Tuesday."
      }
    }
  }
```
### Include special interests for meeting
```javascript
for (let x = 0; x < meetingTimes.length; x++) { 

    var specialInterest = meetingTimes[x].split(' Special Interest ');
    specialInterest = specialInterest[1];
    if (!specialInterest){
        specialInterest = '';
    }
    
    var times = meetingTimes[x].split(' ');
    var timesObj = {
        day : times[0],
        start : times[3]+' '+times[4],
        end : times[6]+' '+times[7],
        type : times[10],
        specialInterest : specialInterest
    }
}
```
## Update Helper
The Helper file was updated to reflect the changes to the JSON.
