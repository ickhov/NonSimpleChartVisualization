var treeMap = {};
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
    'District of Columbia': 'DC',
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

    var astronautsData = data[1];
    var stateCount = {};

    astronautsData.forEach(function(d) {
        var index = d.State;

        if (stateCount[index] == undefined) {
            stateCount[index] = 1;
        } else {
            stateCount[index] = stateCount[index] + 1;
        }
    });

    // D3 Projection
    var projection = d3.geoAlbersUsa()
        .translate([width/2, height/2])    // translate to center of screen
        .scale([1000]);

    var path = d3.geoPath()
        .projection(projection);

    // title for the bubble chart
    svg.append("text")
        .attr("x", width / 3.5)
        .attr("y", height / 15)
        .attr("font-size", "20px")
        .attr("fill", "black")
        .attr("font-weight", "bold")
        .text("Number of U.S. Astronauts per State");

    var stateSelected = {};
    var size = 0;

    // handle mouse click
    var mouseClick = function(d) {
        var index = stateCode[d.properties.name];
        // stateSelected is empty && the current clicked state is not highlighted
        // first state clicked so make all labels and map opaque out
        if (stateCount[index] == 0) {
            return;
        }

        if (size == 0 && stateSelected[index] == undefined) {
            d3.select(this).style('stroke', 'yellow').style('stroke-width', 4);
            stateSelected[index] = d.properties.name;
            size++;
            updateTree("add", index);
        }
        // stateSelected is not empty && the current clicked state is not highlighted
        else if (size > 0 && stateSelected[index] == undefined) {
            d3.select(this).style('stroke', 'yellow').style('stroke-width', 4);
            stateSelected[index] = d.properties.name;
            size++;
            updateTree("add", index);
        }
        // stateSelected is not empty && the current clicked state is already highlighted
        else if (size > 1 && stateSelected[index] != undefined) {
            d3.select(this).style('stroke', 'white').style('stroke-width', 0.75);
            stateSelected[index] = undefined;
            size--;
            updateTree("remove", index);
        }
        // user deselected the last state
        else if (size == 1 && stateSelected[index] != undefined){
            map.style('stroke', 'white').style('stroke-width', 0.75);
            stateSelected[index] = undefined;
            size--;
            updateTree("remove", index);
        }
    }

    // color scale for the legend
    var color = d3.scaleThreshold()
        .domain([0, 1, 1.5, 5, 10, 15, 20, 25, 30])
        .range(d3.schemePurples[9]);

    // create and append the map of the US
    var map = svg.selectAll('path')
        .data(data[0].features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr("fill", function(d){
            var index = stateCode[d.properties.name];

            if (stateCount[index] == undefined) {
                stateCount[index] = 0;
            }

            return color(stateCount[index]);
        })
        .attr("id", function(d){
            return "map" + stateCode[d.properties.name];
        })
        .style('stroke', 'white')
        .style('stroke-width', 0.75)
        .on("click", mouseClick);

    var label = svg.selectAll("g")
        .data(data[0].features)
        .enter()
        .append("g")
        .append("text")
        .attr("text-anchor","middle")
        .attr('fill', function(d){

            if (stateCount[stateCode[d.properties.name]] < 20) {
                return "black";
            }

            return "white";
        })
        .attr("font-size", "12px")
        .attr("pointer-events", "none");

    // state name of label
    label.append("tspan")
        .text(function(d){
            var index = stateCode[d.properties.name];

            if (stateCount[index] == undefined) {
                stateCount[index] = 0;
            }

            return index;
        })
        .attr("x", function(d){
            return path.centroid(d)[0];
        })
        .attr("y", function(d){
            return  path.centroid(d)[1] - 7;
        });

    // astronaut count of label
    label.append("tspan")
        .text(function(d){
            var index = stateCode[d.properties.name];

            if (stateCount[index] == undefined) {
                stateCount[index] = 0;
            }

            return stateCount[index];
        })
        .attr("x", function(d){
            return path.centroid(d)[0];
        })
        .attr("y", function(d){
            return  path.centroid(d)[1] + 7;
        });

    // handle mouse click
    var reset = function(d) {
        map.style('stroke', 'white').style('stroke-width', 0.75);
        stateSelected = {};
        size = 0;
        clearAll();

        // initialize map with CA highlighted
        d3.select("#mapCA").style('stroke', 'yellow').style('stroke-width', 4);
        stateSelected["CA"] = "California";
        size++;
        updateTree("add", "CA");
    }

    var g = svg.append("g")
        .attr("transform", function(d) { 
            return "translate(" + width / 4.8 + "," + (height * 0.03) + ")"; 
        })
        .on("click", reset);

    g.append("rect")
        .attr("width", 60)
        .attr("height", 25);

    g.append("text")
        .attr("x", 9)
        .attr("y", 17)
        .text("Reset")
        .attr("fill", "white")
        .attr("cursor", "pointer");

    var treeBox = d3.select("body").select("#treeBox");

    treeBox.append("p")
        .html("Background Information of U.S. Astronauts in the Selected State");

    var clearAll = function(d) {
        d3.selectAll(".tree").remove();
    }

    // clear the state from tree map
    var clearStateFromTree = function(name) {
        d3.select("#" + name + ".tree").remove();
    }

    // update the tree to match current selection
    var updateTree = function(operation, state) {
        
        if (operation == "add") {
            treeMap[state] = new TreeMap(state, data[1]);
        } else if (operation == "remove") {
            treeMap[state] = null;
            clearStateFromTree(state);
        }
    }

    // initialize map with CA highlighted
    d3.select("#mapCA").style('stroke', 'yellow').style('stroke-width', 4);
    stateSelected["CA"] = "California";
    size++;
    updateTree("add", "CA");
/*
    // find the index where the state name is at
    var findIndexOfState = function(name) {
        return stateNames.findIndex(function(obj) {
            return obj == name;
        });
    }*/
}
