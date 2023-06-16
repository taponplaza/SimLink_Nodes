var map;
var nodes;
var links;
var g;

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

var map = L
  .map('geographicMap')
  .setView([40.43, -3.65], 10); 

L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    maxZoom: 13,
    }).addTo(map);

L.svg({clickable:true}).addTo(map);
var overlay = d3.select(map.getPanes().overlayPane)
var svg = overlay.select('svg').attr("pointer-events", "auto")

let responseJSON = await response.json();
var links = responseJSON.links;
var nodes = responseJSON.nodes;

console.log(responseJSON)


var g = svg.append("g")
    .attr("class", "everything")

var link = g.append("g")
    .attr("class", "links_geo")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("x1", function(d) { return map.latLngToLayerPoint(d.source_coords).x})
    .attr("y1", function(d) { return map.latLngToLayerPoint(d.source_coords).y})
    .attr("x2", function(d) { return map.latLngToLayerPoint(d.target_coords).x})
    .attr("y2", function(d) { return map.latLngToLayerPoint(d.target_coords).y})

var clickedNodes = [];

var node = g.append("g")
  .attr("class", "nodes_geo")
  .selectAll("circle")
  .data(nodes) 
  .enter().append("circle")
      .attr("id", "dotties")
      .attr("fill", "steelblue") 
      .attr("stroke", "black")
      .attr("cx", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).x })
      .attr("cy", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).y })
      .attr("r", 5)
      .on('mouseover', function() { 
          d3.select(this).transition() 
            .duration('150') 
            .attr("fill", "red") 
            .attr('r', 10) 
        })
        .on('mouseout', function() { 
          d3.select(this).transition()
            .duration('150')
            .attr("fill", "steelblue")
            .attr('r', 5)
        })
        .on("click", function (d) {
            if (d3.event.ctrlKey) {
                if (clickedNodes.indexOf(d) === -1) {
                    clickedNodes.push(d);
                }
        
                if (clickedNodes.length === 2) {
                    transitionBetweenNodes(clickedNodes[0], clickedNodes[1]);
                    clickedNodes = [];
                }
            } else { updateInfo(d); }
      })

    node.append("title")
      .text(function(d) { return d.name; });

class PriorityQueue {
    constructor() {
        this._queue = [];
    }

    enqueue(item, priority) {
        this._queue.push({item, priority});
        this._queue.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this._queue.shift();
    }

    isEmpty() {
        return this._queue.length === 0;
    }
}
    
async function transitionBetweenNodes(startNode, endNode) {
    let visited = new Set();
    let queue = new PriorityQueue();
    let previousNodeMap = new Map();
    
    queue.enqueue(startNode, 0);
    previousNodeMap.set(startNode, null);

    while(!queue.isEmpty()) {
        let { item: currentNode } = queue.dequeue(); 
        visited.add(currentNode);

        if(currentNode === endNode) {
            let path = [];
            let node = endNode;

            while(node !== null) {
                path.unshift(node);
                node = previousNodeMap.get(node);
            }

            for(let i = 0; i < path.length - 1; i++) {
                await transition(path[i], path[i+1]);
            }

            console.log("Destination reached.");
            return;
        }
        
        let neighbors = getNeighbors(currentNode);
        for(let neighbor of neighbors) {
            if(visited.has(neighbor)) continue;
            
            let distance = geoDistance([neighbor.lat, neighbor.long], [endNode.lat, endNode.long]);
            queue.enqueue(neighbor, distance);
            
            if(!previousNodeMap.has(neighbor)) { // Prevent override of existing path
                previousNodeMap.set(neighbor, currentNode);
            }
        }
    }

    console.log("No path found.");
}

    

function geoDistance(coords1, coords2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(coords2[0] - coords1[0]);  // deg2rad below
    var dLon = deg2rad(coords2[1] - coords1[1]); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(coords1[0])) * Math.cos(deg2rad(coords2[0])) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}


function transition(node1, node2) {
    return new Promise((resolve) => {
        let startPoint = map.latLngToLayerPoint([node1.lat, node1.long]);
        let endPoint = map.latLngToLayerPoint([node2.lat, node2.long]);

        let message = g.append("circle")
            .attr("cx", startPoint.x)
            .attr("cy", startPoint.y)
            .attr("r", 3)
            .attr("fill", "green");

        message.transition()
            .duration(1000)
            .attr("cx", endPoint.x)
            .attr("cy", endPoint.y)
            .on("end", () => {
                message.remove();
                resolve();
            });
    });
}


function getNeighbors(node) {
    let connectedLinks = links.filter(link => link.source === node.id || link.target === node.id);
    
    let neighbors = connectedLinks.map(link => {
        return nodes.find(n => n.id === (link.source === node.id ? link.target : link.source));
    });
    
    return neighbors;
}


function update() {
svg.selectAll('circle')
    .attr("cx", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).x })
    .attr("cy", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).y })
svg.selectAll('line')
    .attr("x1", function(d) { return map.latLngToLayerPoint(d.source_coords).x})
    .attr("y1", function(d) { return map.latLngToLayerPoint(d.source_coords).y})
    .attr("x2", function(d) { return map.latLngToLayerPoint(d.target_coords).x})
    .attr("y2", function(d) { return map.latLngToLayerPoint(d.target_coords).y})
}
        
window.transitionBetweenNodesById = function(nodeId1, nodeId2) {
    let node1 = nodes.find(node => node.id === nodeId1);
    let node2 = nodes.find(node => node.id === nodeId2);

    if(node1 && node2) {
        transitionBetweenNodes(node1, node2);
    } else {
        console.log("Nodes not found for the provided IDs");
    }
}

map.on("moveend", update)
})();

function updateInfo(d) {

    let card = d3.select("#paneldiv")
        .attr("class", "col-xl-3 card panel panelafter")
    let title = d3.select("#card_title")
        .text(d.name)
    let code = d3.select("#card_code")
        .text("ID Nodo: "+ d.id)
    let status = d3.select('#card_status')
        .text(d.status)
    let ip = d3.select('#card_ip')
        .text(d.ip)

    let longitude = d3.select("#card_longitude")
        .text(d.long)
    let latitude = d3.select("#card_latitude")
        .text(d.lat)

    let type = d3.select("#card_type")
        .text(d.type)

    clearGraphG();
}

var socket;

function handleSocketConnection(checkbox) {
    if(checkbox.checked) {
        socket = io.connect();
        socket.on("updatePairData", function (data) {
            console.log("Received pair data :: " + data.value1 + ", " + data.value2);
            if(window.transitionBetweenNodesById) {
                window.transitionBetweenNodesById(data.value1, data.value2);
            } else {
                console.log("Transition function not yet available.");
            }
        });
    } else {
        if(socket) {
            socket.disconnect();
            socket = null;
        }
    }
}