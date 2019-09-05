//  Neil Oliver
//  Week 02 Data Structures Task
//  Parse saved data save new file

// Dependencies
const fs = require('fs')
var cheerio = require('cheerio')


// Wipe text file and add headings
fs.writeFileSync('data/AA-data-07.csv', "Location_Name,Address_Line_1,State,Zipcode,Extended_Address\n");

// Read text file with saved HTML data
fs.readFile('/home/ec2-user/environment/week01/data/AA-data-07.txt', 'utf8', (error, data) => {
    if (error) throw error;
          
    // Load the file data into the cheerio parser
    const $ = cheerio.load(data);
    
    // Traverse the DOM model produced by Cheerio down three table rows deep
    $('tr tr tr').each(function(i, item) {
        if (i != 0){
            
            // Delete additional html code within the table row
            $(this).children().eq(0).find('div').remove().html();
            $(this).children().eq(0).find('b').remove().html();
            $(this).children().eq(0).find('span').remove().html();
            
            // Extract the location details. Split at a new line, deleting white space and blank lines
            var location = $(this).children().eq(0).text().split(/\n|,|\(|\)/).map(item => item.trim()).filter(Boolean);
    
            // Combine variables togther in a comma deliminated string
            var saveString = location[0] + ',' + location[1] + ',' + 'NY,' + location[location.length - 1].replace(/\D+/g, '') + ',' + "\"" + location.join(',') + "\"";
            
            // Save CSV into text file
            fs.appendFileSync('data/AA-data-07.csv', saveString + '\n');
        };
    });
});

