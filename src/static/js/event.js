$(document).ready(function () {
    var socket = io.connect();
    
    var n = 120,
        duration = 750,
        now = new Date(Date.now() - duration),
        data = d3.range(n).map(function() { return 0; });

    var margin = {top: 10, right: 25, bottom: 25, left: 25};

    var svg = d3.select("#sensorDataGraph"),
        width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
        height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
    
    var parseTime = d3.timeParse("%H:%M:%S");
    
    var x = d3.scaleTime()
        .domain([now - (n - 2) * duration, now - duration])
        .range([0, width]);
    
    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([0,40])
    
    var yAxisLeft = d3.axisLeft()
        .scale(y);
    
    var line = d3.line()
        .curve(d3.curveBasis)
        .x(function(d, i) { return x(now - (n - 1 - i) * duration); })
        .y(function(d, i) { return y(d); });
    
    svg.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", width)
        .attr("height", height);
    
    var main = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var axis = main.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(x.axis = d3.axisBottom().scale(x));
    
    main.append("g")
    .attr("class", "y axis axisLeft")
        .call(yAxisLeft);

    var path = main.append("g")
        .attr("clip-path", "url(#clip)")
      .append("path")
        .datum(data)
        .attr("class", "line");
    
    function Update(Newdata) {
    
        // update the domains
        now = new Date();
        x.domain([now - (n - 2) * duration, now - duration]);
    
        // push the new data
        data.push(Math.max(0, Newdata.value));
    
        // redraw the line
        svg.select(".line")
            .attr("d", line)
            .attr("transform", null);
    
        // slide the x-axis left
        axis.transition()
        .duration(710)
        .ease(d3.easeLinear)
        .call(x.axis);
    
        // slide the line left
        path.transition()
            .duration(710)
            .ease(d3.easeLinear)
            .attr("transform", "translate(" + x(now - (n - 1) * duration) + ")");
    
        // pop the old data point off the front
        data.shift();
    }

    function clearGraph() {
        // Clear the line from the graph
        svg.selectAll(".line").remove();
    
        // Reset the data
        data = d3.range(n).map(function() { return 0; });
    
        // Reset the path variable
        path = main.append("g")
            .attr("clip-path", "url(#clip)")
            .append("path")
            .datum(data)
            .attr("class", "line");
    }

    function startSocket() {
        clearGraph();
        socket = io.connect();
        socket.on("updateSensorData", function (msg) {
            console.log("Received sensorData :: " + msg.date + " :: " + msg.value);
            Update(msg);
        });
    }

    function stopSocket() {
        if (socket) {
            socket.disconnect();
        }
    }

    let isConnected = false;

    $('#startSocketBtn').on('click', function() {
        if (!isConnected) {
            startSocket();
            $(this).text('Stop Socket');
        } else {
            stopSocket();
            $(this).text('Start Socket');
        }
        isConnected = !isConnected;
    });

    window.clearGraphG = function() {
        stopSocket();
        isConnected = false;
        clearGraph();
        $('#startSocketBtn').text('Start Socket');
    }
})