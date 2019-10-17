import * as d3 from 'd3'
import d3Tip from 'd3-tip'
// import d3Annotation from 'd3-svg-annotation'

d3.tip = d3Tip

const margin = { top: 50, left: 100, right: 50, bottom: 10 }
const height = 400 - margin.top - margin.bottom
const width = 700 - margin.left - margin.right

const svg = d3
  .select('#chart-3')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const xPositionScale = d3.scaleLinear().range([0, width])
const yPositionScale = d3.scaleBand().range([height, 0])

const tip = d3
  .tip()
  .attr('class', 'd3-tip')
  .offset(function(d) {
    if (`${+d.delta}` > 0) {
      return [0, 8]
    } else {
      return [0, -8]
    }
  })
  .direction(function(d) {
    if (`${+d.delta}` > 0) {
      return 'e'
    } else {
      return 'w'
    }
  })
  .html(function(d) {
    return `${+d.delta}`
  })

svg.call(tip)

d3.csv(require('../data/running_delta.csv')).then(ready)

function ready(datapoints) {
  console.log('Data read in:', datapoints)

  // Sort the cities from low to high
  datapoints = datapoints.sort((a, b) => {
    return a.delta - b.delta
  })
  console.log(datapoints)

  const maxDelta = d3.max(datapoints, d => +d.delta)
  const minDelta = d3.min(datapoints, d => +d.delta)
  xPositionScale.domain([minDelta, maxDelta])

  const cities = datapoints.map(d => d.City)
  yPositionScale.domain(cities)

  svg
    .selectAll('rect')
    .data(datapoints)
    .enter()
    .append('rect')
    .attr('x', function(d) {
      return xPositionScale(Math.min(0, +d.delta)) + 40
    })
    .attr('y', d => yPositionScale(d.City))
    .attr('width', function(d) {
      return Math.abs(xPositionScale(+d.delta) - xPositionScale(0))
    })
    .attr('height', height / datapoints.length - 10)
    .attr('fill', function(d) {
      if (d.delta < 0) {
        return 'orangered'
      } else {
        return 'dodgerblue'
      }
    })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)

  svg
    .append('text')
    .text("Change in # of 'Good' Running Days per Year, 1981-2000 v. 2001-2019")
    .attr('x', width / 2) // in the center
    .attr('text-anchor', 'middle') // center aligned
    .attr('dy', -20)
    .attr('font-size', 16)
    .attr('fill', 'black')
    .attr('font-weight', 'bold')

  const yAxis = d3.axisLeft(yPositionScale)
  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)
  svg.selectAll('.y-axis path').remove()

  // const xAxis = d3.axisBottom(xPositionScale)
  // svg
  //   .append('g')
  //   .attr('class', 'axis x-axis')
  //   .attr('transform', 'translate(0,' + height + ')')
  //   .call(xAxis)
}
