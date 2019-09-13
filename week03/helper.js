var fs = require('fs');

function makeCSV(jsonFile){
    var meetings = JSON.parse(jsonFile)
    
    // Wipe text file and add headings
    fs.writeFileSync('data/AA-data-07.csv', "Location_Name,Address_Line_1,City,State,Zipcode,Extended_Address,Meeting_Name,Day,Start,End,Type\n");
    
    for (var locationName in meetings) {
        if (meetings.hasOwnProperty(locationName)) {

            for (var meetingName in meetings[locationName]['meetings']){

                for (let i = 0; i < meetings[locationName]['meetings'][meetingName].length; i++) { 
                                    
                    var saveString = 
                        locationName + ',' +
                        meetings[locationName]['address']['line_1'] + ',' +
                        meetings[locationName]['address']['city'] + ',' +
                        meetings[locationName]['address']['state'] + ',' +
                        meetings[locationName]['address']['zip'] + ',' + '"' +
                        meetings[locationName]['address']['friendly'] + '"' + ',' +
                        meetingName + ',' +
                        meetings[locationName]['meetings'][meetingName][i]['day'] + ',' +
                        meetings[locationName]['meetings'][meetingName][i]['start'] + ',' +
                        meetings[locationName]['meetings'][meetingName][i]['end'] + ',' +
                        meetings[locationName]['meetings'][meetingName][i]['type']
                    
                    // Save CSV into text file
                    fs.appendFileSync('data/AA-data-07.csv', saveString + '\n');
                }
            }
        }
    }
}

// Read text file with saved HTML data
fs.readFile('data/AA-data-07.json', 'utf8', (error, data) => {
    if (error) throw error;
    makeCSV(data)
});
