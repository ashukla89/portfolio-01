import * as d3 from 'd3'

// Create your margins and height/width
const margin = { top: 20, left: 50, right: 20, bottom: 50 }
const height = 300 - margin.top - margin.bottom
const width = 300 - margin.left - margin.right

const container = d3.select('#chart-4')

// Create your scales
const xPositionScale = d3.scaleLinear().range([0, width])
const yPositionScale = d3.scaleLinear().range([height, 0])

// Create your line generator
const lineBefore = d3
  .line()
  .x(d => xPositionScale(d.MONTH))
  .y(d => yPositionScale(+d.before))

const lineAfter = d3
  .line()
  .x(d => xPositionScale(d.MONTH))
  .y(d => yPositionScale(+d.after))

// Read in your data
d3.csv(require('../data/annual_isrun.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

// Create your ready function
function ready(datapoints) {
  const months = datapoints.map(d => +d.MONTH)

  xPositionScale.domain(d3.extent(months))
  yPositionScale.domain([0, 1])

  // Group your data together
  const nested = d3
    .nest()
    .key(d => d.City)
    .entries(datapoints)

  console.log('first nested is', nested[0])

  // contain it
  container
    .selectAll('svg')
    .data(nested)
    .enter()
    .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .each(function(d) {
      // console.log(d)
      const name = d.key
      const datapoints = d.values

      // What SVG are we in? Let's grab it.
      const svg = d3.select(this)
      svg
        .append('path')
        .datum(datapoints)
        .attr('d', lineBefore)
        .attr('fill', 'none')
        .attr('stroke', 'blue')
        .attr('stroke-width', 1.5)

      svg
        .append('path')
        .datum(datapoints)
        .attr('d', lineAfter)
        .attr('fill', 'none')
        .attr('stroke', 'orange')
        .attr('stroke-width', 1.5)
        .raise()

      svg
        .selectAll('.before-circle')
        .data(datapoints)
        .enter()
        .append('circle')
        .attr('cx', d => xPositionScale(d.MONTH))
        .attr('cy', d => yPositionScale(d.before))
        .attr('r', 2)
        .attr('fill', 'blue')

      svg
        .selectAll('.after-circle')
        .data(datapoints)
        .enter()
        .append('circle')
        .attr('cx', d => xPositionScale(d.MONTH))
        .attr('cy', d => yPositionScale(d.after))
        .attr('r', 2)
        .attr('fill', 'orange')

      svg
        .append('path')
        .datum(datapoints)
        .attr('d', lineAfter)
        .attr('fill', 'none')
        .attr('stroke', 'orange')
        .attr('stroke-width', 1.5)
        .raise()

      svg
        .append('text')
        .text(name)
        .attr('x', width / 2) // in the center
        .attr('text-anchor', 'middle') // center aligned
        // .attr('dy', -10)
        .attr('font-size', 13)
        .attr('fill', 'black')
        .attr('font-weight', 'bold')

      const xTickLabels = ['Feb', 'May', 'Aug', 'Nov']

      const xAxis = d3
        .axisBottom(xPositionScale)
        .tickValues([2, 5, 8, 11])
        .tickFormat(function(d, i) {
          return xTickLabels[i]
        })
      // .tickFormat(d3.format('d'))
      // .tickSize(-height)
      svg
        .append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
      svg.selectAll('.x-axis path').remove()

      const yAxis = d3
        .axisLeft(yPositionScale)
        .tickValues([0, 0.2, 0.4, 0.6, 0.8])
        // .tickFormat(d3.format('$,d'))
        .tickSize(-width)
      svg
        .append('g')
        .attr('class', 'axis y-axis')
        .call(yAxis)
        .selectAll('.tick line')
        // .attr('stroke-dasharray', '2 2')
        .attr('stroke', 'lightgrey')
      svg.selectAll('.y-axis path').remove()
    })
}
