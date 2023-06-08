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
          updateInfo(d);
      })

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
}