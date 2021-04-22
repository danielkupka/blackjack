var margin = {top: 20, right: 20, bottom: 70, left: 40},
    width = (screen.width * .75) - margin.left - margin.right,
    height = (screen.height * .5) - margin.top - margin.bottom;

// Parse the handValue / time
var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    //.tickFormat(d3.time.format("%Y-%m"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);

var svg = d3.select("#hist").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/bar-data.csv", function(error, data) {

    data.forEach(function(d) {
        d.handValue = +d.handValue;
        d.percent = +d.percent;
    });
	
  x.domain(data.map(function(d) { return d.handValue; }));
  y.domain([0, d3.max(data, function(d) { return d.percent; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Games [%]");

  svg.selectAll("bar")
      .data(data)
    .enter().append("rect")
      .style("fill", "#972a27")
      .attr("x", function(d) { return x(d.handValue); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.percent); })
      .attr("height", function(d) { return height - y(d.percent); });

});
