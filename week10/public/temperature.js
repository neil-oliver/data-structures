var data;

$(function(){
    $("button").on("click", function(){
        getResults($(this).val())
    });
});

function getResults(val){
    var parameters = { period: val };
    $.get( '/temperature',parameters, function(d) {
        $('#tempreadings').html(d)
        data = d;
        draw();
    });
}

function init(){
    getResults("Month")
}

init()

// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = (window.innerWidth*0.6) - margin.left - margin.right,
    height = (window.innerHeight*0.4) - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


// example code from https://www.d3-graph-gallery.com/graph/line_basic.html
function draw(){
    svg.selectAll('*').remove()
    
    var formatter;
    var parser;

    var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ")
    var dateFormat = d3.timeFormat("%Y-%m-%d");
    var parseDay = d3.timeParse("%Y-%m-%d");


    console.log(data)

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
    
    console.log(data)

    // Add X axis --> it is a date format
    var x = d3.scaleTime()
      .domain(d3.extent(data, function(d) { 
      return parser(d.key); }))
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.value; })])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add the line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(parser(d.key)) })
        .y(function(d) { return y(d.value) })
        .curve(d3.curveMonotoneX)
      )
        

}