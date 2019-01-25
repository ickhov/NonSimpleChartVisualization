// load data with queue
var url1 = "./data/neighborhood.geojson";
var url2 = "./data/listing_count.json";

var q = d3_queue.queue(1)
  .defer(d3.json, url1)
  .defer(d3.json, url2)
  // .defer(d3.csv, url3)
  .awaitAll(draw);

function draw(error, data) {
  "use strict";

  // important: First argument it expects is error
  if (error) throw error;

  // initialize the Bayview as the default neighborhood
  var field = "Bayview";

  var margin = 50,
    width = 450 - margin,
    height = 500 - margin;

  var colorScheme = ["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f"];

  var color = d3.scaleThreshold()
    .domain([1, 25, 50, 100, 200, 300, 700])
    .range(colorScheme);

  // create a projection properly scaled for SF
  var projection = d3.geoMercator()
    .center([-122.433701, 37.767683])
    .scale(175000)
    .translate([width / 1.5, height / 1.74]);

  // create a path to draw the neighborhoods
  var path = d3.geoPath()
    .projection(projection);

  // define the tooltip behavior
  var tooltip = d3.select('#myTooltip');
  tooltip.style('display', 'none');
    
  // show tooltip function
  var showTooltip = function(d) {
    // make sure our tooltip is going to be displayed
    tooltip.style('display', 'block');

    // set the initial position of the tooltip
    tooltip.style('left', d3.event.pageX + 'px');
    tooltip.style('top', d3.event.pageY + 'px');

    tooltip.html("<strong>" + d.properties.neighbourhood.replace(/_/g, ' ') + "</strong>\nNumber of Listings:\n" + d.count);
  }

  // hide tooltip function
  var hideTooltip = function(d) {
    tooltip.style('display', 'none');
  }

  // track clicking
  var isClicked = false;

  // handle mouse click
  var mouseClick = function(d) {
    if (!isClicked) {
      isClicked = true;
      map.attr("opacity", 0.2);
      d3.select(this).attr("opacity", 1);
      drawLineGraph(d.properties.neighbourhood);
    } else {
      isClicked = false;
      map.attr("opacity", 1);
    }
  }

  // create and append the map of SF neighborhoods
  var map = d3.select('#map').selectAll('path')
    .data(data[0].features)
    .enter()
    .append('path')
    .attr('d', path)
    .style('stroke', 'black')
    .style('stroke-width', 0.75)
    .on("mouseover", showTooltip)
    .on("mouseleave", hideTooltip)
    .on("click", mouseClick);

  // // normalize neighborhood names
  map.datum(function(d) {
    var normalized = d.properties.neighbourhood
      .replace(/ /g, '_')
      .replace(/\//g, '_');

    d.properties.neighbourhood = normalized;
    d.count = data[1][d.properties.neighbourhood];
    return d;
  });

  // // add the neighborhood name as its class
  map
    .attr('class', function(d) {
      return d.properties.neighbourhood;
    })
    .attr("fill", function(d) {
      return color(d.count);
    })
    .attr("transform", "translate(60" + ", 50" + ")");

  // the x axis to put the key on
  var x = d3.scaleLinear().range([1, 455]);

  // the domain for the x axis
  x.domain(d3.extent(color.domain(), function(d) {
      return d;
    }));

  var svg = d3.select('#map');

  var g = svg.append('g')
    .attr("transform", "translate(100,580)")
    .call(d3.axisBottom(x).tickValues(color.domain()));

  var numbers = color.domain();

  g.selectAll("rect")
    .data(numbers)
    .enter()
    .insert("rect", ".tick")
      .attr("height", 8)
      .attr("x", function(d) {return x(d);})
      .attr("width", function(d, i) {
        if (i == 0)
          return (x(numbers[i + 1]) - 0);
        else if (i == 6)
          return 0;

        return (x(numbers[i + 1]) - x(d));})
      .attr("fill", function(d, i) {return colorScheme[i]});

  g.append("text")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .attr("y", -6)
      .text("Number of Airbnb Listings");

  drawLineGraph(field);
}
