(async() => {
    let response = await fetch(`${window.origin}/get-graph`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify("Get data"),
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        })
    });

    var svg = d3.select("#physicsMap"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    let responseJSON = await response.json();
    
    var g = svg.append("g")
        .attr("class", "everything");

    var link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(responseJSON.links)
        .enter().append("line");

        var node = g.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(responseJSON.nodes)
        .enter().append("circle")
        .attr("r", 5.0)
        .attr("fill", "darkgray")
        .attr("clickCount", 0)  
        .attr("clickTimeout", null) 
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("click", function (d) {
            updateInfo(d);
        });
    

    node.append("title")
        .text(function(d) { return d.name; });

    simulation
        .nodes(responseJSON.nodes)
        .on("tick", ticked);

    simulation
        .force("link")
        .links(responseJSON.links);
    var zoom_handler = d3.zoom()
        .on("zoom", zoom_actions);

    zoom_handler(svg);

    function zoom_actions() {
        g.attr("transform", d3.event.transform)
    }

    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    var colorScale = d3.scaleSequential().domain([0,10]).interpolator(d3.interpolateReds);

     window.transitionMade = function(id) {
        var svg = d3.select('#physicsMap');
        var node = svg.selectAll("circle").filter(function(d) { return d && d.id === id; });
        
        clearTimeout(node.attr("clickTimeout"));
        
        var currentCount = Number(node.attr("clickCount")) + 1;
        node.attr("clickCount", currentCount);
        node.attr("fill", colorScale(currentCount));

        node.attr("clickTimeout", setTimeout(() => {
            node.attr("r", 5.0);
            node.attr("fill", "darkgray");
            node.attr("clickCount", 0);  
        }, 750));
    }
    
    

})();

//the function that called by button "Change Map"
function flip() {
    let force = document.getElementById("nonGeographicMap");
    let nonforce = document.getElementById("geographicMap");
    let button = document.getElementById("changemap")

    if (force.style.visibility == "hidden") {
        force.style.visibility = "visible";
        force.style.height = "600px";
        nonforce.style.visibility = "hidden";
        nonforce.style.height = 0;
        button.innerText = "Change to GeoMap";
    } else {
        force.style.visibility = "hidden";
        force.style.height = 0;
        nonforce.style.visibility = "visible";
        nonforce.style.height = "600px";
        button.innerText = "Change to NodesMap";

    }

}
