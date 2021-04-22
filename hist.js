var container = document.getElementById('hist');
var margin = { top: 20, right: 10, bottom: 70, left: 10 },
  width = container.clientWidth - margin.left - margin.right,
  height = container.clientHeight - margin.top - margin.bottom;

// Parse the handValue / time
var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.05);

var y = d3.scale.linear().range([height, 0]);

const xTicks = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];
var xAxis = d3.svg.axis()
  .scale(x)
  .orient('bottom')
  .tickSize(0)
  .tickPadding(7)
  .tickValues(width < 600 ? xTicks.filter(d => d % 2 === 0) : xTicks);

var yAxis = d3.svg.axis()
  .scale(y)
  .orient('left')
  .ticks(10)
  .tickSize(0)
  .tickPadding(10);

var xStarts = [12, 16, 19];
var gridLineData = [5, 10, 15]
  .map((d, i) => ({
    y: d,
    xStart: xStarts[i]
  }));

var svg = d3
  .select('#hist')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

d3.csv('data/bar-data.csv', function (error, data) {
  data.forEach(function (d) {
    d.handValue = +d.handValue;
    d.percent = +d.percent;
  });

  x.domain(
    data.map(function (d) {
      return d.handValue;
    })
  );

  y.domain([
    0,
    d3.max(data, function (d) {
      return d.percent;
    }),
  ]);

  svg
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0 ${height})`)
    .call(xAxis);

  // defs
  var defs = svg
    .append('defs');

  defs
    .append('marker')
    .attr('id', 'arrowhead')
    .attr('markerWidth', 10)
    .attr('markerHeight', 7)
    .attr('refX', 0)
    .attr('refY', 3.5)
    .attr('orient', 'auto')
    .append('polygon')
    .attr('points', '0 0, 10 3.5, 0 7');

  // grid lines
  svg
    .append('g')
    .attr('class', 'y-grid-lines')
    .selectAll('g')
    .data(gridLineData)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${x(d.xStart)} ${y(d.y)})`)
    .append('line')
    .attr('x2', d => width - x(d.xStart) - margin.right)
    .attr('y2', 0)
    .attr('stroke-dasharray', '3, 3');

  // grid line text
  svg
    .append('g')
    .attr('class', 'y-grid-line-text')
    .selectAll('g')
    .data(gridLineData)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${x(d.xStart) - 5000 / width} ${y(d.y)})`)
    .append('text')
    .attr('dy', -6)
    .text(d => `${d.y}%`);
  
  // vertical win/loose mark
  svg
    .append('g')
    .attr('class', 'win-lose-mark')
    .selectAll('g')
    .data([22])
    .enter()
    .append('g')
    .attr('transform', d => `translate(${x(d)} 0)`)
    .append('line')
    .attr('x2', 0)
    .attr('y2', height)
    .attr('stroke-dasharray', '3, 3');

  // labels
  var xLabel = svg
    .append('g')
    .attr('class', 'x-label')
    .attr('transform', `translate(${x(8)} ${height + margin.bottom / 1.5})`);

  var xLabelText = xLabel
    .append('text')
    .text('Hand value at the end of the game');

  if (width > 600) {
    xLabel
      .append('path')
      .attr('d', `m${xLabelText.node().getBBox().width + 5} -3q20 0 25 -10`)
      .attr('marker-end', 'url(#arrowhead)');
  }

  var yLabel = svg
    .append('g')
    .attr('class', 'y-label')
    .attr('transform', `translate(${x(13) - (width < 600 ? 40 : 0)} ${height / 5})`);

  yLabel
    .append('text')
    .text('Fraction of all games')
    .attr('dx', - 10000 / width);

  yLabel
    .append('path')
    .attr('d', `M${x(10) - 7} 7q5 20 20 22`)
    .attr('marker-end', 'url(#arrowhead)');

  var labelPlayerLoses = svg
    .append('g')
    .attr('class', 'label-player-loses')
    .attr('transform', `translate(${x(22) + 3} 5)`);

  labelPlayerLoses
    .append('text')
    .attr('dx', 25)
    .attr('dy', 5)
    .text('Player loses');

  labelPlayerLoses
    .append('path')
    .attr('d', 'M0 0L10 0')
    .attr('marker-end', 'url(#arrowhead)');

  svg
    .selectAll('bar')
    .data(data)
    .enter()
    .append('rect')
    .style('fill', '#0a509c')
    .style('opacity', 0.9)
    .attr('x', function (d) {
      return x(d.handValue);
    })
    .attr('width', x.rangeBand())
    .attr('y', function (d) {
      return y(d.percent);
    })
    .attr('height', function (d) {
      return height - y(d.percent);
    })
    .attr('rx', 5)
    .attr('ry', 5);
});
