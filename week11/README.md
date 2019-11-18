# Weekly Assignment 11

## AA
*What will the visualization look like? Will it be interactive? If so, how?*
- Large map of manhattan
- Mapbox [Light/Dark theme](https://www.mapbox.com/maps/light-dark/) (switching at night) 
- List of events on right hand side.
- Search criteria at the top.
- Interaction - Tooltip showing user friendly directions. Link to google maps for directions to venue.

*How will the data need to be mapped to the visual elements?* 
- Pins on map showing location of each meeting. 

*For that mapping, what needs to be done to the data? Be specific and clear. Will it require filtering, aggregation, restructuring, and/or something else? How will this be done?* 
- Filtering by distance (user input location) & time.
- Sorting by distance.

*What is the default view (if any)?*
- Map of all of manhattan. Points for meetings happening that day.
- List of meetings sorted by time.

*What assumptions are you making about the user?*
- Potential need for quick result 
- Potential need for anonymity.
  
  
## Process Blog
*What will the visualization look like? Will it be interactive? If so, how?*  
- Title and short introduction at the top
- Links on the right hand side for category, time periods (month / week)
- Selection for custom time period on the side.
- 
*How will the data need to be mapped to the visual elements?* 
- text based representation. 
- emoji replacement of text based emotions ( ;) )
- 
*For that mapping, what needs to be done to the data? Be specific and clear. Will it require filtering, aggregation, restructuring, and/or something else? How will this be done?*  
- Filtering on time & category
- Sort by date / time

*What is the default view (if any)?*
- Latest blog post

*What assumptions are you making about the user?*
- None

  
## Temperature Sensor
*What will the visualization look like? Will it be interactive? If so, how?*
- Introduction to the project and the New York City heat laws.
- Line graph showing the temperature from the sensor & external temperature data provided by the [National Digital Forecast Database](https://www.nws.noaa.gov/mdl/survey/pgb_survey/dev/rest.php).

*How will the data need to be mapped to the visual elements?* 
- X axis = Time, Y axis = Temperature.
- Line at 50 degrees fahrenheit.
- Color change below 50 degrees.

*For that mapping, what needs to be done to the data? Be specific and clear. Will it require filtering, aggregation, restructuring, and/or something else? How will this be done?*  
- Changeable time period to daily (external data only available on an hourly database).

*What is the default view (if any)?*
- Graph showing average temperature (each day) for the past 30 days.

*What assumptions are you making about the user?*
- They understand fahrenheit!
