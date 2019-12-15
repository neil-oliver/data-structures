const parseNewDate = d3.timeParse("%Y-%m-%dT%H")
const parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ")


// for the original unfiltered data
var dbData;
var data;

// for filtered data
var monthWeather;
var weekWeather;
var weatherData

// start and end date settings
var now = new Date().toISOString()
var weekAgo = moment(now).subtract(7, 'days')
var monthAgo = moment(now).subtract(30, 'days')

//filter data by week on user select
$(function(){
    $("input, label").on("click", function(){
      if ($(this).attr('id') == 'Week'){
        //filter data using moment
        data = dbData.filter(d => moment(parseNewDate(d.sensoryear + '-' + d.sensormonth + '-' + d.sensorday + 'T' + d.sensorhour)).isAfter(weekAgo));
        sortWeatherData('Week');
      } else if ($(this).attr('id') == 'Month'){
        //reset data
        data = dbData;
        sortWeatherData('Month');
      } else if ($('#Week').hasClass("active")){
        //do this for the checked box
        data = dbData.filter(d => moment(parseNewDate(d.sensoryear + '-' + d.sensormonth + '-' + d.sensorday + 'T' + d.sensorhour)).isAfter(weekAgo));
        sortWeatherData('Week');
      } else if ($('#Month').hasClass("active")){
        data = dbData;
        sortWeatherData('Month')
      }
      draw()
      //call the dots
      drawDots()

    });
});


function getWeatherData(){
  
  var start = monthAgo.format('Y-M-D')
  var end = moment(now).format('Y-M-D')
  
  // make a request to meteostat for historical weather data
  var baseURL = `https://api.meteostat.net/v1/history/hourly?station=72503&start=${start}&end=${end}&time_zone=America/New_York&time_format=Y-m-d%20H:i&key=qMMTpKxL`

  $.get(baseURL, function(dta){
    monthWeather = dta.data.map(function(d){
      //make new object to match the database data and convert from celcius to fahrenheit 
      return {key:moment(d.time).toISOString(), value:d.temperature * 9 / 5 + 32}
    })
    weatherData = monthWeather

    draw();
    //call the dots
    drawDots()

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
        dbData = d;
        data = d; 
    });
}

function init(){
    getResults("Month")
    getWeatherData("Month")
}

init()


var margin = {top: 20, right: 10, bottom: 20, left: 10};

var width = 600 - margin.left - margin.right,
	height = 600 - margin.top - margin.bottom;
 
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<span style='color:white'>" + d.value.toFixed(2) + " °F</span>";
  })

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz").append("svg")
    	.attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    	
svg.call(tip);

    
var parser;
var formatter;

var colorScale = d3.scaleLinear()
  .domain([25, 80])
  .range([1, 0]);
    
var innerRadius = 140,
    outerRadius = Math.min(width, height) / 2 - 6;

var formatMonth = d3.timeFormat("%d %b");

var fullCircle = 2 * Math.PI;

var x = d3.scaleTime()
    .range([0, fullCircle]);

var y = d3.scaleRadial()
		.range([innerRadius, outerRadius]);
		
function draw(){
  svg.selectAll('*').remove()
  
  var g = svg.append("g")
	  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  /////////////////////////////////////////////////////////////////////////
  // filter the data for daily average
  if ($('#gridCheck').is(":checked") == true ){
    
    formatter = d3.timeFormat("%Y-%m-%d");
    parser = d3.timeParse("%Y-%m-%d")
    
    data = d3.nest()
      .key(function(d) { return formatter(parseNewDate(d.sensoryear + '-' + d.sensormonth + '-' + d.sensorday + 'T' + d.sensorhour));})
        .rollup(function(d) { 
        return d3.mean(d, function(g) {return g.temp_value; });
    }).entries(data);

  } else {
    
    formatter = d3.timeFormat("%Y-%m-%dT%H:%M:%S.%LZ");
    parser = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ")
    
    data = d3.nest()
      .key(function(d) { return formatter(parseNewDate(d.sensoryear + '-' + d.sensormonth + '-' + d.sensorday + 'T' + d.sensorhour));})
        .rollup(function(d) { 
        return d3.mean(d, function(g) {return g.temp_value; });
    }).entries(data);
    
  }


  
var line = d3.lineRadial()
		.angle(function(d) { return x(parser(d.key)); })
		.radius(function(d) { return y(d.value); })
		.curve(d3.curveCardinal);

  
  //////////////////////////////////////////////////////////////////////////

  x.domain(d3.extent(data, function(d) { return parser(d.key); }));
	y.domain([20,80]);
  
  var linePlot = g.append("path")
  	.datum(data)
    .attr("fill", "none")
    .attr("stroke", "#FF007F")
    .attr("stroke-width", 1)
    .attr("d", line);
  
  var yAxis = g.append("g")
      .attr("text-anchor", "middle");

  var yTick = yAxis
    .selectAll("g")
    .data(y.ticks(5))
    .enter().append("g");
  
  yTick.append("circle")
      .attr("fill", "none")
      .attr("stroke", "grey")
  		.attr("opacity", 0.2)
      .attr("r", y);
  
  yAxis.append("circle")
  		.attr("fill", "none")
      .attr("stroke", "grey")
  		.attr("opacity", 0.2)
      .attr("r", function() { return y(y.domain()[0])});


  yTick.append("text")
    .attr("y", function(d) { return -y(d); })
    .attr("dy", "0.35em")
    .style("font-size", 10)
    .text(function(d) { return d + "°F"; })
    .style('fill', 'grey');

  
  var xAxis = g.append("g");

  var xTick = xAxis
    .selectAll("g")
    .data(x.ticks(12))
    .enter().append("g")
      .attr("text-anchor", "middle")
      .attr("transform", function(d) {
        return "rotate(" + ((x(d)) * 180 / Math.PI - 90) + ")translate(" + innerRadius + ",0)";
      });
  
  xTick.append("line")
    .attr("x2", -5)
    .attr("stroke", "grey");

  xTick.append("text")
    .attr("transform", function(d) { 
    var angle = x(d);
    return ((angle < Math.PI / 2) || (angle > (Math.PI * 3 / 2))) ? "rotate(90)translate(0,22)" : "rotate(-90)translate(0, -15)"; })
    .text(function(d) { 
      return formatMonth(d);
    })
  	.style("font-size", 10)
  	.attr("opacity", 0.6)
  	.style('fill', 'white');

  
  var title = g.append("g")
  		.attr("class", "title")
  		.append("text")
  		.attr("dy", "-0.2em")
  		.attr("text-anchor", "middle")
  		.text("Temperature")
  		.style("font-size", 30)
  		.style('fill', 'white');

  
  var subtitle = g.append("text")
  		.attr("dy", "1em")
      .attr("text-anchor", "middle")
  		.attr("opacity", 0.6)
  		.text("New York")
  		.style('fill', 'white');

  setTimeout(function(){ 
      
      x.domain(d3.extent(data, function(d) { return parser(d.key); }));
	    y.domain([20,80]);
	    
    var dots = g.selectAll(".dot")
      .data(data)
      .enter()
        .append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("transform", function(d) {
          return "rotate(" + ((x(parser(d.key)))* 180 / Math.PI - 180) + ")";
        })
        .attr("cy", function(d) { return y(d.value) })
        .attr("r", 2)
        .style("stroke", "#FF007F")   // set the line colour
        .style("fill", "#FF007F")   // set the fill colour 
          .on("mouseover", function(a, b, c) { 
            this.attr('class', 'focus')
    		})
    		.attr('opacity',0)
    		.on('mouseover', tip.show)
        .on('mouseout', tip.hide)
    		.transition()
          .duration(200)
          .ease(d3.easeLinear)
        .attr('opacity',1);
        
  
  }, 1500);
		
 	
  var lineLength = linePlot.node().getTotalLength();
  
  linePlot
    .attr("stroke-dasharray", lineLength + " " + lineLength)
    .attr("stroke-dashoffset", -lineLength)
    .transition()
      .duration(1500)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);
      
  drawWeather()
}

function drawWeather(){
  
    var g = svg.append("g")
	  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
	  
    if ($('#gridCheck').is(":checked") == true ){
  
    formatter = d3.timeFormat("%Y-%m-%d");
    parser = d3.timeParse("%Y-%m-%d")
  
    weatherData = d3.nest()
      .key(function(d) { return formatter(parseDate(d.key));})
        .rollup(function(d) { 
        return d3.mean(d, function(g) {return g.value; });
    }).entries(weatherData);
  }
    
  
  var line = d3.lineRadial()
  		.angle(function(d) { return x(parser(d.key)); })
  		.radius(function(d) { return y(d.value); })
  		.curve(d3.curveCardinal);

  //////////////////////////////////////////////////////////////////////////

  x.domain(d3.extent(data, function(d) { return parser(d.key); }));
	y.domain([20,80]);
  
  setTimeout(function(){
    
    x.domain(d3.extent(data, function(d) { return parser(d.key); }));
	  y.domain([20,80]);
  
    var dots = g.selectAll(".dot")
      .data(weatherData)
      .enter()
        .append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("transform", function(d) {
          return "rotate(" + ((x(parser(d.key)))* 180 / Math.PI - 180) + ")";
        })
        .attr("cy", function(d) { return y(d.value) })
        .attr("r", 2)
        .style("stroke", "#a4de26")   // set the line colour
        .style("fill", "#a4de26")   // set the fill colour 
    		.attr('opacity',0)
    		.on('mouseover', tip.show)
        .on('mouseout', tip.hide)
    		.transition()
          .duration(200)
          .ease(d3.easeLinear)
        .attr('opacity',1);

  }, 1500);

	
  var linePlot = g.append("path")
  	.datum(weatherData)
    .attr("fill", "none")
    .attr("stroke", "#a4de26")
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0.7)
    .attr("d", line);
    
  var lineLength = linePlot.node().getTotalLength();

  linePlot
  .attr("stroke-dasharray", lineLength + " " + lineLength)
  .attr("stroke-dashoffset", -lineLength)
  .transition()
    .duration(1500)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);
}

//////////////////////////////////////////////////////
// The Dots
var h = 600;
var w = 600;

var tip2 = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<span style='color:white'>" + moment(d.id).format('MMMM Do YYYY, h:mm:ss a') + "</span>";
  })
  
svg.call(tip2)

var grid = d3.grid()
  .size([400, 400]);


var size = d3.scaleSqrt()
  .domain([0, 9])
  .range([0, 20]);

var sortBy = {
  id: d3.comparator()
    .order(d3.ascending, function(d) { return d.id; }),
  color: d3.comparator()
    .order(d3.ascending, function(d) { return d.color; })
    .order(d3.descending, function(d) { return d.size; })
    .order(d3.ascending, function(d) { return d.id; }),
  size: d3.comparator()
    .order(d3.descending, function(d) { return d.size; })
    .order(d3.ascending, function(d) { return d.color; })
    .order(d3.ascending, function(d) { return d.id; })
};
  
var svg2 = d3.select("#tempreadings").append("svg")
  .attr("width", w)
  .attr("height", h)
  .append("g")
  .attr("transform", "translate(100,100)")


function drawDots(){

  var data2 = data.map(function(d){
        //make new object to match the database data and convert from celcius to fahrenheit 
        return {id:d.key, size:1+colorScale(d.value)*9 , color: 1-colorScale(d.value) }
      })
  

  console.log(data2)
  
  d3.selectAll(".sort-btn")
    .on("click", function(d) {
      d3.event.preventDefault();
      data2.sort(sortBy[this.dataset.sort]);
      update();
    });
    
        
  update();
  
  function update() {
    
    var node = svg2.selectAll(".node")
      .data(grid(data2), function(d) { return d.id; });
    node.enter().append("circle")
      .attr("class", "node")
      .attr("r", 1e-9)
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .style("fill", function(d) { return d3.interpolateWarm(d.color); })
      .on('mouseover', tip2.show)
      .on('mouseout', tip2.hide);
    node.transition().duration(1000).delay(function(d, i) { return i * 20; })
      .attr("r", function(d) { return size(d.size/3); })
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    node.exit().transition()
      .attr("r", 1e-9)
      .remove();
  }
}