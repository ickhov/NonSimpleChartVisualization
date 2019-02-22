
function TreeMap(stateName, data) {

    var height;

    // filter data for tree
    data = data.filter(function(d) {
        return d.State == stateName;
    })

    var length = data.length - 1;
    if (length < 5)
        height = 300;
    else if (length < 10)
        height = 500;
    else if (length < 15)
        height = 700;
    else if (length < 20)
        height = 900;
    else if (length < 25)
        height = 1100;
    else
        height = 1300;

    var treeBox = d3.select("body").select("#treeBox");

    var boundingBox = treeBox.node().getBoundingClientRect();

    //  grab the width and height of our containing SVG
    var width = boundingBox.width - 15;
    
    var newTree = treeBox.append("svg")
        .attr("width", width + "px")
        .attr("height", height + "px")
        .attr("class", "tree")
        .attr("id", stateName);

    var svg = newTree.append("g")
        .attr("transform", "translate(" + 115 + ",0)");

    var treeData = {}, children = [];
    treeData["name"] = stateName;

    for (var i = 0; i < data.length; i++)
    {
        var map2 = {},
        children2 = [];

        var uMajor;
        var gMajor;

        if (data[i].UndergraduateMajor == "") {
            uMajor = "N/A";
        } else {
            uMajor = data[i].UndergraduateMajor;
        }

        if (data[i].GraduateMajor == "") {
            gMajor = "N/A";
        } else {
            gMajor = data[i].GraduateMajor;
        }

        map2["name"] = data[i].Name;
        children2[0] = {"name": "Gender: " + data[i].Gender};
        children2[1] = {"name": "Alma Mater: " + data[i].AlmaMater};
        children2[2] = {"name": "Undergraduate Major: " + uMajor};
        children2[3] = {"name": "Graduate Major: " + gMajor};
        children2[4] = {"name": "Current Status: " + data[i].Status};
        map2["children"] = children2;

        children[i] = map2;
    }

    treeData["children"] = children;

    // declares a tree layout and assigns the size
    var treemap = d3.tree().size([height, width]);

    var i = 0,
        duration = 750,
        root;

    // Assigns parent, children, height, depth
    root = d3.hierarchy(treeData, function(d) { return d.children; });
    root.x0 = height / 2;
    root.y0 = 0;

    // Collapse after the second level
    root.children.forEach(collapse);

    update(root);

    // Collapse the node and all it"s children
    function collapse(d) {
        if(d.children) {
            d.tempChildren = d.children
            d.tempChildren.forEach(collapse)
            d.children = null
        }
    }

    function update(source) {
        // Assigns the x and y position for the nodes
        var treeData = treemap(root);
      
        // Compute the new tree layout.
        var nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);
      
        // Normalize for fixed-depth.
        nodes.forEach(function(d) { 
            d.y = d.depth * 180
        });

        // Id for each node for enter, update, and exit purposes
        var keyID = function(d) {
            if (d.id == undefined)
            {
                d.id = i;
                i++;
            }

            return d.id;
        }
      
        // Update the nodes...
        var node = svg.selectAll("g.node")
            .data(nodes, keyID);
      
        // Enter any new modes at the parent"s previous position.
        var entering = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
              return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on("click", toggle);

        // Toggle children on click.
        function toggle(d) {
            // children is not null = children not hidden
            // make them hidden
            if (d.children) {
                d.tempChildren = d.children;
                d.children = null;
            } 
            // children is null = chidren is hidden
            // unhide them
            else {
                d.children = d.tempChildren;
                d.tempChildren = null;
            }
            update(d);
        }
      
        // Add Circle for the nodes
        entering.append("circle")
            .attr("class", "node");
      
        // Add labels for the nodes
        entering.append("text")
            .attr("dy", ".35em")
            .attr("fill", "white")
            .attr("x", function(d) {
                // if either the children or parent is visible
                // shift x by -13
                if (d.children || d.tempChildren) {
                    return -13;
                }

                return 13;
            })
            .attr("text-anchor", function(d) {
                // if either the children or parent is visible
                // anchor text to "end"
                if (d.children || d.tempChildren) {
                    return "end";
                }

                return "start";
            })
            .text(function(d) { 
                return d.data.name; 
            });
      
        // UPDATE
        var updating = entering.merge(node);
      
        // Transition to the proper position for the node
        updating.transition()
            .duration(duration)
            .attr("transform", function(d) { 
                return "translate(" + d.y  + "," + d.x + ")";
            });
      
        // Update the node attributes and style
        updating.select("circle.node")
            .attr("r", 10)
            .style("fill", function(d) {
                // not null = child hidden
                if (d.tempChildren) {
                    return "#ee5200";
                }
                
                return "white";
            })
            .attr("cursor", "pointer");
      
      
        // Remove any exiting nodes
        var exiting = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();
      
        // On exit reduce the node circles size to 0
        exiting.select("circle")
            .attr("r", 0);
      
        // On exit reduce the opacity of text labels
        exiting.select("text")
            .style("fill-opacity", 0);
      
        // Update the links...
        var link = svg.selectAll("path.link")
            .data(links, keyID);
      
        var init = {x: source.x0, y: source.y0};

        // Enter any new links at the parent"s previous position.
        var linkEntering = link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", diagonal(init, init));
      
        // UPDATE
        var linkUpdating = linkEntering.merge(link);
      
        // Transition back to the parent element position
        linkUpdating.transition()
            .duration(duration)
            .attr("d", function(d){ 
                return diagonal(d, d.parent) 
            });
      
        var end = {x: source.x, y: source.y};

        // Remove any exiting links
        link.exit().transition()
            .duration(duration)
            .attr("d", diagonal(end, end))
            .remove();

        // Creates a curved (diagonal) path from parent to the child nodes
        function diagonal(s, d) {
            return "M " + s.y + " " + s.x +
                "C " + (s.y + d.y) / 2 + " " + s.x + "," +
                (s.y + d.y) / 2 + " " + d.x + "," +
                d.y + " " + d.x;
        }
      
        // Store the old positions for transition.
        nodes.forEach(function(d){
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // handle mouse click
    var reset = function(d) {
        // Collapse after the second level
        root.children.forEach(collapse);

        update(root);
    }

    var g = newTree.append("g")
        .attr("transform", function(d) { 
            return "translate(" + 20 + "," + (root.x0 - 12.5) + ")"; 
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
}