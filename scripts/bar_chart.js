
function BarChart(svg, regionName, data) {
    this.svg = svg;
    this.regionName = regionName;

    var margins = {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30
    };

    var boundingBox = svg.node().getBoundingClientRect();
    
    //  grab the width and height of our containing SVG
    var height = boundingBox.height;
    var width = boundingBox.width;

    // filter data for bar chart
    data = data.filter(function(d) {
        return d.Region == regionName;
    })

    //sort bars based on value
    data = data.sort(function (a, b) {
        return d3.ascending(a["GDP ($ per capita)"], b["GDP ($ per capita)"]);
    })

    var x = d3.scaleLinear().range([0, width - 100]);
    var y = d3.scaleBand().range([height / 1.2, 0]);

    // x axis label
    this.svg.append("text")
        .attr("class", "title");

    // x axis
    this.svg.append("g")
        .attr("class", "xaxis");

    // x axis label
    this.svg.append("text")
        .attr("class", "xaxislabel");

    // color scale
    var color = d3.scaleQuantize().range(d3.schemeGreens[9]);

    var key = function(d) { return d.Country; }

    var previousRegion = undefined;

    this.draw = function(region, newData) {

        var reDraw = true;

        if (previousRegion != undefined)
        {
            if (previousRegion == region)
                reDraw = false;
        }

        if (reDraw) {
            previousRegion = region;

            newData = newData.filter(function(d) {
                return d.Region == region;
            })
    
            newData = newData.sort(function (a, b) {
                return d3.ascending(a["GDP ($ per capita)"], b["GDP ($ per capita)"]);
            })
    
            newData.splice(10);
            newData = newData.filter(function(d) {return d["GDP ($ per capita)"] > 0;});
    
            x.domain([0, d3.max(newData, function(d) { return d["GDP ($ per capita)"]; })]);
            y.domain(newData.map(function(d) {return d.Country;})).padding(0.1);
    
            // x axis label
            this.svg.select(".title")
                .attr("transform", "translate(30," + 30 + ")")
                .text(function() {
                    if (newData.length < 10)
                        return "Top " + newData.length + " GDP of Countries in the " + newData[0].Region + " Region";
                    return "Top 10 GDP of Countries in the " + newData[0].Region + " Region";
                });
    
            // x axis
            this.svg.select(".xaxis")
                .attr("transform", "translate(30," + (height - 60) + ")")
                .call(d3.axisBottom(x).ticks(6, "$s").tickSizeInner([-(height / 1.2)]));
                
            // x axis label
            this.svg.select(".xaxislabel")
                .attr("transform", "translate(" + width / 2.7 + "," + (height - 25) + ")")
                .text("GDP ($ per capita)");
    
            // color scale
            color.domain([0, d3.max(newData, function(d) { return d["GDP ($ per capita)"]; })]);
    
            this.svg.selectAll(".label").remove();
            
            // group the bar
            var items = this.svg.selectAll(".bar")
                .data(newData, key)
                
            var bars = items.enter()
                .append("g");
            
            // append the bar
            bars.append("rect")
                .attr("class", "bar")
                .attr("x", 31)
                .attr("height", y.bandwidth())
                .attr("y", function(d) {return y(d.Country) + (height - (height / 1.07));})
                .attr("width", function (d) {
                    return x(d["GDP ($ per capita)"]);
                })
                .attr("stroke", "darkgray")
                .attr("stroke-width", "1px")
                .attr("fill", function(d) { return color(d["GDP ($ per capita)"]);});
    
            var nearEnd = color.domain()[1] / 1.5;
    
            // append the text
            bars.append("text")
                .attr("class", "label")
                .attr("y", function (d) {
                    return y(d.Country) + y.bandwidth() / 1.5 + (height - (height / 1.07));
                })
                .attr("x", function (d) {
                    return 40;
                })
                .attr("fill", function(d) {
                    if (d["GDP ($ per capita)"] >= nearEnd)
                        return "white";
                    
                    return "black";
                })
                .text(function (d) {
                    return d.Country + ": $" + d3.format(",.0f")(d["GDP ($ per capita)"]);
                });
    
            items.exit().remove();
        }
    }

    this.draw(this.regionName, data);
}