var fs = require('fs');

function makeCSV(jsonFile,writeFile){
    var meetings = JSON.parse(jsonFile)
    
    // Wipe text file and add headings
    fs.writeFileSync(writeFile, "Location_Name,Address_Line_1,City,State,Zipcode,Extended_Address,Latitude,Longitude,Score,Zone,Meeting_Name,Details,Day,Start,End,Type,SpecialInterest\n");
    
    for (var locationName in meetings) {
        if (meetings.hasOwnProperty(locationName)) {

            for (var meetingName in meetings[locationName]['meetings']){

                for (let i = 0; i < meetings[locationName]['meetings'][meetingName]['times'].length; i++) { 
                                    
                    var saveString = 
                        '"' + locationName + '"' + ',' +
                        meetings[locationName]['address']['line_1'] + ',' +
                        meetings[locationName]['address']['city'] + ',' +
                        meetings[locationName]['address']['state'] + ',' +
                        meetings[locationName]['address']['zip'] + ',' + '"' +
                        meetings[locationName]['address']['friendly'] + '"' + ',' +
                        meetings[locationName]['address']['coords']['latitude'] + ',' +
                        meetings[locationName]['address']['coords']['longitude'] + ',' +
                        meetings[locationName]['address']['coords']['score'] + ',' +
                        meetings[locationName]['address']['zone'] + ',' +

                        '"' + meetingName + '"' + ',' +
                        '"' + meetings[locationName]['meetings'][meetingName]['details'] + '"' + ',' +
                        meetings[locationName]['meetings'][meetingName]['times'][i]['day'] + ',' +
                        meetings[locationName]['meetings'][meetingName]['times'][i]['start'] + ',' +
                        meetings[locationName]['meetings'][meetingName]['times'][i]['end'] + ',' +
                        meetings[locationName]['meetings'][meetingName]['times'][i]['type'] + ',' + '"' +
                        meetings[locationName]['meetings'][meetingName]['times'][i]['specialInterest'] + '"';
                        
                    // Save CSV into text file
                    fs.appendFileSync(writeFile, saveString + '\n');
                }
            }
        }
    }
}
    
// Read text file with saved HTML data
fs.readFile('data/AA-complete-data.json', 'utf8', (error, data) => {
    if (error) throw error;
    makeCSV(data,'data/AA-complete-data.csv')
});
          
