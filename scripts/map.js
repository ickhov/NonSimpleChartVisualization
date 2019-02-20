
var svg = d3.select("#map");

var boundingBox = svg.node().getBoundingClientRect();

//  grab the width and height of our containing SVG
var height = boundingBox.height;
var width = boundingBox.width;

var stateCode = {
    'Alabama': 'AL',
    'Alaska': 'AK',
    'American Samoa': 'AS',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'District Of Columbia': 'DC',
    'Federated States Of Micronesia': 'FM',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Guam': 'GU',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Marshall Islands': 'MH',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Northern Mariana Islands': 'MP',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Palau': 'PW',
    'Pennsylvania': 'PA',
    'Puerto Rico': 'PR',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virgin Islands': 'VI',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY'
};

var url1 = "./data/us_states.geojson";
var url2 = "./data/astronauts.csv";

var q = d3_queue.queue(1)
  .defer(d3.json, url1)
  .defer(d3.csv, url2)
  .awaitAll(draw);

function draw(error, data) {

    // important: First argument it expects is error
    if (error) throw error;

    var names = {};

    var da = data[1];

    d3.tsv("./data/us_state_name.tsv", function(error, data) {
        data.forEach(function(d) {
            //d.State = stateCode[d.State];
            names[d.id] = d.code;
        });
    });

    data.forEach(function(d, i) {
        //d.State = stateCode[d.State];
        //names[i] = (d.features[i]).properties.name;
    });

    var x = d3.scaleLinear().range([1, 455]);

    // D3 Projection
    var projection = d3.geoAlbersUsa()
        .translate([width/2, height/2])    // translate to center of screen
        .scale([1000]);

    var path = d3.geoPath()
        .projection(projection);

    var colorScheme = d3.schemeBlues[9];

    // title for the bubble chart
    svg.append("text")
        .attr("x", width / 2.6)
        .attr("y", height / 12)
        .attr("font-size", "30px")
        .text("U.S. Astronauts by State");
    // track clicking
    var isClicked = false;
    var stateSelected = {};

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

        tooltip.html("<strong>" + stateCode[d.properties.name] + "<strong>");
    }

    // hide tooltip function
    var hideTooltip = function(d) {
        tooltip.style('display', 'none');
    }

    // handle mouse click
    var mouseClick = function(d) {
        // if stateSelected is empty
        if (!isClicked) {
            isClicked = true;
            map.attr("opacity", 0.2);
            label.attr("opacity", 0.2);
            d3.select(this).attr("opacity", 1);
            d3.select("#" + d.properties.name).attr("opacity", 1);
        } else {
            isClicked = false;
            map.attr("opacity", 1);
            label.attr("opacity", 1);
        }
    }

    // create and append the map of the US
    var map = svg.selectAll('path')
        .data(data[0].features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr("fill", function(d, i) {
            return colorScheme[i % 9];
        })
        .style('stroke', 'black')
        .style('stroke-width', 0.75)
        .on("click", mouseClick);

    var label = svg.append("g")
        .attr("class", "states-names")
        .selectAll("text")
        .data(data[0].features)
        .enter()
        .append("text")
        .attr("id", function(d){
            return d.properties.name;
        })
        .text(function(d, i){
            return stateCode[d.properties.name];
        })
        .attr("x", function(d){
            return path.centroid(d)[0];
        })
        .attr("y", function(d){
            return  path.centroid(d)[1];
        })
        .attr("text-anchor","middle")
        .attr('fill', 'black')
        .attr("font-size", "13px");
        }
