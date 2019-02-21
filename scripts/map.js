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
        .attr("x", width / 4)
        .attr("y", height / 15)
        .attr("font-size", "24px")
        .attr("fill", "white")
        .attr("font-weight", "bold")
        .text("Number of U.S. Astronauts per State");

    var stateSelected = {};
    var size = 0;

    // handle mouse click
    var mouseClick = function(d) {
        var index = stateCode[d.properties.name];
        // stateSelected is empty && the current clicked state is not highlighted
        // first state clicked so make all labels and map opaque out
        if (size == 0 && stateSelected[index] == undefined) {
            map.attr("opacity", 0.5);
            label.attr("opacity", 0.5);
            d3.select(this).attr("opacity", 1);
            d3.select("#" + index).attr("opacity", 1);
            stateSelected[index] = d.properties.name;
            size++;
            addState(index);
            updateTree("remove", "CA");
            updateTree("add", index);
        }
        // stateSelected is not empty && the current clicked state is not highlighted
        else if (size > 0 && stateSelected[index] == undefined) {
            d3.select(this).attr("opacity", 1);
            d3.select("#" + index).attr("opacity", 1);
            stateSelected[index] = d.properties.name;
            size++;
            addState(index);
            updateTree("add", index);
        }
        // stateSelected is not empty && the current clicked state is already highlighted
        else if (size > 1 && stateSelected[index] != undefined) {
            d3.select(this).attr("opacity", 0.5);
            d3.select("#" + index).attr("opacity", 0.5);
            stateSelected[index] = undefined;
            size--;
            removeState(index);
            updateTree("remove", index);
        }
        // user deselected the last state
        else if (size == 1 && stateSelected[index] != undefined){
            map.attr("opacity", 1);
            label.attr("opacity", 1);
            stateSelected[index] = undefined;
            size--;
            stateNames = ["CA"];
            updateTree("remove", index);
            updateTree("add", "CA");
        }
    }

    // color scale for the legend
    var color = d3.scaleThreshold()
        .domain([0, 5, 10, 15, 20, 25, 30])
        .range(d3.schemeGreens[7]);

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
        .style('stroke', 'white')
        .style('stroke-width', 0.75)
        .on("click", mouseClick);
        

    var label = svg.selectAll("g")
        .data(data[0].features)
        .enter()
        .append("g")
        .append("text")
        .attr("id", function(d){
            return stateCode[d.properties.name];
        })
        .attr("text-anchor","middle")
        .attr('fill', function(d){

            if (stateCount[stateCode[d.properties.name]] < 20) {
                return "black";
            }

            return "white";
        })
        .attr("font-size", "13px")
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
        map.attr("opacity", 1);
        label.attr("opacity", 1);
        stateSelected = {};
        size = 0;
        clearAll();
    }

    var g = svg.append("g")
        .attr("transform", function(d) { 
            return "translate(" + width / 5.7 + "," + (height * 0.03) + ")"; 
        })
        .on("click", reset);

    g.append("rect")
        .attr("width", 50)
        .attr("height", 20);

    g.append("text")
        .attr("x", 8)
        .attr("y", 15)
        .text("Reset")
        .attr("fill", "white")
        .attr("cursor", "pointer");

    var treeBox = d3.select("body").select("#treeBox");

    treeBox.append("p")
        .html("Names of U.S. Astronaut in the Selected State");

    var stateNames = ["CA"];

    treeMap["CA"] = new TreeMap("CA", data[1]);

    var clearAll = function(d) {
        d3.selectAll(".tree").remove();
    }

    // clear the state from tree map
    var clearStateFromTree = function(name) {
        d3.select("#" + name + ".tree").remove();
    }

    // indicate whether to remove the preset state data
    var firstClick = true;
    var stateIndex = 0;

    // add the state to list of state names
    var addState = function(name) {
        if (firstClick) {
            stateNames = [];
            firstClick = false;
        }

        stateNames[stateIndex] = name;
        stateIndex++;
    }

    // remove the state from the list of state names
    var removeState = function(name) {
        var index = findIndexOfState(name);
        stateNames.splice(index, 1);
        stateIndex--;
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

    // find the index where the state name is at
    var findIndexOfState = function(name) {
        return stateNames.findIndex(function(obj) {
            return obj == name;
        });
    }
}
