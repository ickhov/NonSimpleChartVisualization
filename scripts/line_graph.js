// set the dimensions and margins of the graph
var margin = {
    top: 0,
    right: 20,
    bottom: 10,
    left: 40
  },
  width = 600 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// parse the date / time
var parseTime = d3.timeParse("%Y");

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var drawLineGraph = function(field) {
  d3.select('#chart').select('path').remove();
  d3.select('#chart').select('.graph').remove();
  d3.select('#chart').select('.yaxis').remove();
  d3.select('#chart').select('.axisLabel').remove();
  d3.select('#chart').select('.title').remove();

  // define the line
  var valueline = d3.line()
  .x(function(d) {
    return x(d.years);
  })
  .y(function(d) {
    return y(d[field]);
  });

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin

  var svg = d3.select("#chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);


  // Get the data
  d3.csv("./data/2010-2017_review.csv", function(error, data) {
  if (error) throw error;

  // format the data
  data.forEach(function(d) {
    d.year = parseTime(d.years);
    d[field] = +d[field];
  });

  // Scale the range of the data
  x.domain(d3.extent(data, function(d) { return d.years; }));
  y.domain([0, d3.max(data, function(d) { return d[field]; })]).nice();

  var bisectDate = d3.bisector(function(d) { return d.years; }).left;

  // show label and dots function
  var showLabel = function(d, i) {
    var x0 = x.invert(d3.mouse(this)[0]);
    var i = bisectDate(data, x0, 1);
    var d0 = data[i - 1];
    var d1 = data[i];
    var d = x0 - d0.years > d1.years - x0 ? d1 : d0;

    removeLabel();

    svg.append("circle")
      .attr("class", "dot")
      .attr("transform", "translate(" + (x(d.years) + 42) + "," + (y(d[field]) + 70) + ")")
      .attr("r", 5)

    svg.append("text")
      .attr("class", "name")
      .attr("fill", "black")
      .attr("transform", "translate(" + (x(d.years) + 52) + "," + (y(d[field]) + 75) + ")")
      .text(d[field]);
  }

  // remove label and dot function
  var removeLabel = function() {
    // remove dot if already exist
    if (svg.select(".dot") != null)
      svg.select(".dot").remove();

    // remove label if already exist
    if (svg.select(".name") != null)
      svg.select(".name").remove();
  }

  // Add the valueline path.
  svg.append("path")
    .data([data])
    .attr("class", "line2")
    .attr("d", valueline)
    .attr("transform", "translate(42" + ", 70" + ")");
  
  svg.on("mouseover", showLabel)
    .on("mouseleave", removeLabel);

  // Add the X Axis
  var marginB = 460;

  svg.append("g")
    .attr('class', 'graph')
    .attr("transform", "translate(40," + marginB + ")")
    .call(d3.axisBottom(x).tickFormat(d3.format(".4r")));

  // Add the Y Axis
  svg.append("g")
    .attr('class', 'yaxis')
    .attr("transform", "translate(40" + ", 70" + ")")
    .call(d3.axisLeft(y)
      .ticks(5));

  // X Axis Label
  svg.append("text")
    .attr("class", "axisLabel")
    .attr("transform",
      "translate(" + (width / 2.5 + 110) + " ," +
      (height + 110) + ")")
    .style("text-anchor", "middle")
    .text("Years");

  // Y Axis Label
  svg.append("text")
    .attr("class", "axisLabel")
    .attr("transform", "rotate(-90)")
    .attr("y", -3)
    .attr("x", -margin.left - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Number of Reviews");

  // Chart Title
  svg.append("text")
    .attr("class", "title")
    .attr("font-family", "sans-serif")
    .attr("font-size", "16px")
    .attr("transform",
    "translate(" + (width / 2.5 + 110) + " ," +
    (margin.bottom + 25) + ")")
    .attr("text-anchor", "middle")
    .text(field.replace(/_/g, ' '));
  });
}