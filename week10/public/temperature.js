const parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ")
var dbData;
var data;

var monthWeather;
var weekWeather;
var weatherData

var now = new Date().toISOString()
var weekAgo = moment(now).subtract(7, 'days')
var monthAgo = moment(now).subtract(30, 'days')

$(function(){
    $("input, label").on("click", function(){
      if ($(this).attr('id') == 'Week'){
        //filter data using moment
        data = dbData.filter(d => moment(d.sensortime).isAfter(weekAgo));
        sortWeatherData('Week');
      } else if ($(this).attr('id') == 'Month'){
        //reset data
        data = dbData;
        sortWeatherData('Month');
      } else if ($('#Week').hasClass("active")){
        //do this for the checked box
        data = dbData.filter(d => moment(d.sensortime).isAfter(weekAgo));
        sortWeatherData('Week');
      } else if ($('#Month').hasClass("active")){
        data = dbData;
        sortWeatherData('Month')
      }
      draw()
    });
});

function getWeatherData(){
    

  var start = monthAgo.format('Y-M-D')
  
  var end = moment(now).format('Y-M-D')
  
  var baseURL = `https://api.meteostat.net/v1/history/hourly?station=72503&start=${start}&end=${end}&time_zone=America/New_York&time_format=Y-m-d%20H:i&key=qMMTpKxL`

  $.get(baseURL, function(dta){
    monthWeather = dta.data.map(function(d){
      return {key:moment(d.time).toISOString(), value:d.temperature * 9 / 5 + 32}
    })
    weatherData = monthWeather
    drawWeather()
  });
}

function sortWeatherData(period){
  
  var start;
  
  if (period == 'Week') {
    weatherData = monthWeather.filter(d => moment(d.key).isAfter(weekAgo));
  } else {
    weatherData = monthWeather
  }

}

function getResults(val){
    var parameters = { period: val };
    $.get( '/temperature',parameters, function(d) {
        $('#tempreadings').html(d)
        dbData = d;
        data = d;
        draw();
    });
}

function init(){
    getResults("Month")
    getWeatherData("Month")
}

init()

// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = (window.innerWidth*0.6) - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var x;
var y;
var parser;
var formatter;

var colorScale = d3.scaleLinear()
  .domain([32, 80])
  .range([1, 0]);

// example code from https://www.d3-graph-gallery.com/graph/line_basic.html
function draw(){
    svg.selectAll('*').remove()
    
    // filter the data for average
    if ($('#gridCheck').is(":checked") == true ){
      
      formatter = d3.timeFormat("%Y-%m-%d");
      parser = d3.timeParse("%Y-%m-%d")
      
      data = d3.nest()
        .key(function(d) { return formatter(parseDate(d.sensortime));})
          .rollup(function(d) { 
          return d3.mean(d, function(g) {return g.sensorvalue; });
      }).entries(data);
      
    } else {
      
      formatter = d3.timeFormat("%Y-%m-%dT%H:%M:%S.%LZ");
      parser = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ")
      
      data = d3.nest()
        .key(function(d) { return formatter(parseDate(d.sensortime));})
          .rollup(function(d) { 
          return d3.mean(d, function(g) {return g.sensorvalue; });
      }).entries(data);
      
    }
    
    // Add X axis --> it is a date format
    x = d3.scaleTime()
      .domain(d3.extent(data, function(d) { 
      return parser(d.key); }))
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.value; })])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));
      

    // Add the line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(parser(d.key)) })
        .y(function(d) { return y(d.value) })
        .curve(d3.curveMonotoneX)
      )
      .attr("stroke", 'red') 


    
    // only draw the dots if it is on average view  
    if ($('#gridCheck').is(":checked") == true ){  
      svg.selectAll(".dot")
      .data(data)
      .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("cx", function(d) { return x(parser(d.key))})
        .attr("cy", function(d) { return y(d.value) })
        .attr("r", 5)
        .style("stroke", (d) => d3.interpolateRdYlBu(colorScale(d.value)))   // set the line colour
        .style("fill", "white")   // set the fill colour 
          .on("mouseover", function(a, b, c) { 
            this.attr('class', 'focus')
    		})
    }
    
    drawWeather()

}

function drawWeather(){
  
    if ($('#gridCheck').is(":checked") == true ){
      
      formatter = d3.timeFormat("%Y-%m-%d");
      parser = d3.timeParse("%Y-%m-%d")
      
      weatherData = d3.nest()
        .key(function(d) { return formatter(parseDate(d.key));})
          .rollup(function(d) { 
          return d3.mean(d, function(g) {return g.value; });
      }).entries(weatherData);
    }
      // Add the weather line
    svg.append("path")
      .datum(weatherData)
      .attr("fill", "none")
      .attr("stroke", 'blue')
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(parser(d.key)) })
        .y(function(d) { return y(d.value) })
        .curve(d3.curveMonotoneX)
      )
      
    // only draw the dots if it is on average view  
    if ($('#gridCheck').is(":checked") == true ){  
      svg.selectAll(".weatherDot")
      .data(weatherData)
      .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("cx", function(d) { return x(parser(d.key))})
        .attr("cy", function(d) { return y(d.value) })
        .attr("r", 5)
        .style("stroke", (d) => d3.interpolateRdYlBu(colorScale(d.value)))    // set the line colour
        .style("fill", "white")   // set the fill colour 
          .on("mouseover", function(a, b, c) { 
            this.attr('class', 'focus')
    		})
    }
}