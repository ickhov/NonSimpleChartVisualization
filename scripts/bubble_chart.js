var barChart = undefined;
var svg = d3.select("#bubble");

var boundingBox = svg.node().getBoundingClientRect();

//  grab the width and height of our containing SVG
var height = boundingBox.height;
var width = boundingBox.width;

d3.csv("./data/countries_processed.csv", function(error, data) {
    if (error) throw error;

    // format the data
    data.forEach(function(d) {
        d.Population = +d.Population;
        d["GDP ($ per capita)"] = +d["GDP ($ per capita)"];
    });

    // scale for the bubbles
    var scale = d3.scaleSqrt().domain(d3.extent(data, function(d) {return d.Population})).range([30, 80]);

    // key for the region
    var keyRegion = function(d) {
        return d.Region;
    }

    // key for the pop
    var keyPop = function(d) {
        return d.Population;
    }

    // group countries by region and sum the total
    // population for each region using the keys above
    var popByRegion = d3.nest()
        .key(keyRegion)
        .rollup(function(datum) {
            return d3.sum(datum, keyPop);
        })
        .entries(data);

    // color scale for the legend
    var color = d3.scaleThreshold()
        .domain([0, 100000000, 200000000, 300000000, 400000000, 500000000, 600000000, 800000000, 4000000000])
        .range(d3.schemePurples[9]);

    // default region for bar chart
    var defaultRegion = "EASTERN EUROPE";

    // set up bar chart
    barChart = new BarChart(d3.select('#bar'), defaultRegion, data);

    // define the tooltip behavior
    var tooltip = d3.select('#myTooltip');
    tooltip.style('display', 'none');
    
    // track clicking
    var isClicked = false;
    var currentCountry = undefined;

    // show tooltip function
    var showTooltip = function(d) {
        // if nothing is clicked, then show new position
        if (!isClicked && currentCountry != d.key) {
            currentCountry = d.key;
            // make sure our tooltip is going to be displayed
            tooltip.style('display', 'block');

            // set the initial position of the tooltip
            tooltip.style('left', d3.event.pageX + 'px');
            tooltip.style('top', d3.event.pageY + 'px');

            tooltip.html("<strong>" + d.key + "</strong><br />Total Population:<br />" + d3.format(",")(d.value));
        }
    }

    // hide tooltip function
    var hideTooltip = function(d) {
        // if nothing is clicked, then hide
        if (!isClicked) {
            tooltip.style('display', 'none');
            currentCountry = undefined;
        }
    }

    // handle mouse click
    var mouseClick = function(d) {
        if (!isClicked) {

            isClicked = true;
            bubbles.attr("opacity", 0.2);
            d3.select(this).attr("opacity", 1);

            // update bar chart
            defaultRegion = d.key;
            barChart.draw(defaultRegion, data);
        } else {
            isClicked = false;
            bubbles.attr("opacity", 1);
            showTooltip(d);
        }
    }

    // title for the bubble chart
    svg.append("text")
        .attr("x", width / 4.5)
        .attr("y", height / 12)
        .text("Total Population by Region");

    // append the bubbles for each countries
    var bubbles = svg.selectAll("countries")
        .data(popByRegion)
        .enter()
        .append("circle")
        .attr("class", "countries")
        .attr("r", function(d) {
            return scale(d.value);
        })
        .attr("fill", function(d) {
            return color(d.value);
        })
        .attr("stroke", "black")
        .attr("stroke-width", "1px")
        .attr("transform", "translate(" + width / 2.5 + "," + height / 2 + ")")
        .on("mouseover", showTooltip)
        .on("mouseleave", hideTooltip)
        .on("click", mouseClick);

    // make the bubble move a bit at start up
    var simulation = d3.forceSimulation()
        .force("x", d3.forceX(0).strength(0.02))
        .force("y", d3.forceY(0).strength(0.02))
        .force("collide", d3.forceCollide(function(d) {
            return scale(d.value) + 2;
        }));

    // determines the position of each bubble
    var ticked = function() {
        bubbles
        .attr("cx", function(d) {
            return d.x;
        })
        .attr("cy", function(d) {
            return d.y;
        });
    }

    simulation.nodes(popByRegion)
        .on("tick", ticked);

    // the x axis to put the key on
    var y = d3.scaleLinear().range([1, height - 70]);

    // the domain for the x axis
    y.domain(d3.extent(color.domain(), function(d) {
        return d;
    }));

    // legend
    var g = svg.append('g')
        .attr("transform", "translate(" + (width / 1.2) + ",50)")
        .call(d3.axisRight(y).tickValues(color.domain()).tickFormat(d3.format(".0s")));

    var numbers = color.domain();

    // rects for the legend
    g.selectAll("rect")
        .data(numbers)
        .enter()
        .insert("rect", ".tick")
        .attr("width", 8)
        .attr("y", function(d) {return y(d);})
        .attr("height", function(d, i) {
            if (i == 0)
                return y(numbers[i + 1]);
            else if (i == numbers.length - 1)
                return 0;

            return (y(numbers[i + 1]) - y(d));})
        .attr("fill", function(d, i) {return color(numbers[i])});

    // title for legend
    g.append("text")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .attr("y", -10)
        .attr("x", -20)
        .text("Population Size");
});