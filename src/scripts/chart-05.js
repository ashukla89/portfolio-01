import * as d3 from 'd3'
import d3Tip from 'd3-tip'
import d3Annotation from 'd3-svg-annotation'

d3.tip = d3Tip

const margin = { top: 50, left: 50, right: 50, bottom: 50 }
const height = 400 - margin.top - margin.bottom
const width = 700 - margin.left - margin.right

const svg = d3
  .select('#chart-5')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Create your scales
const xPositionScale = d3.scaleLinear().range([0, width])
const yPositionScale = d3.scaleLinear().range([height, 0])
const periodScale = d3
  .scaleOrdinal()
  .domain(['before', 'after'])
  .range(['1981-2000', '2001-2019'])

// Create your line generator
const lineBefore = d3
  .line()
  .x(d => xPositionScale(+d.MONTH))
  .y(d => yPositionScale(+d.before))

const lineAfter = d3
  .line()
  .x(d => xPositionScale(+d.MONTH))
  .y(d => yPositionScale(+d.after))

// Read in your data
d3.csv(require('../data/sf_toohot.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

function ready(datapoints) {
  console.log('Data read in:', datapoints)

  const months = datapoints.map(d => +d.MONTH)
  xPositionScale.domain(d3.extent(months))

  const maxHot = d3.max(datapoints, d => +d.before)
  console.log('maxhot', maxHot)
  yPositionScale.domain([0, maxHot])

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
    .append('text')
    .text('Average # of Days Too Warm for Running, San Francisco')
    .attr('x', width / 2) // in the center
    .attr('text-anchor', 'middle') // center aligned
    .attr('dy', -20)
    .attr('font-size', 16)
    .attr('fill', 'black')
    .attr('font-weight', 'bold')

  // hard coded x and y positions for annotations
  // because couldn't figure out how to call annotations on two paths
  // wasted a day on this, sigh...
  const beforex = xPositionScale(4)
  const beforey = yPositionScale(5.25)
  const afterx = xPositionScale(7)
  const aftery = yPositionScale(2.903225806451613)

  // Add your annotations
  const annotations = [
    {
      note: {
        // label: 'Longer text to show text wrapping',
        title: '1981-2000'
      },
      // Copying what our data looks like
      // data: { MONTH: 4, before: 5.25 },
      x: beforex,
      y: beforey,
      dx: -30,
      dy: -20,
      color: 'black'
    },
    {
      note: {
        // label: 'Longer text to show text wrapping',
        title: '2001-2019'
      },
      // Copying what our data looks like
      // data: { MONTH: 7, after: 2.903225806451613 },
      x: afterx,
      y: aftery,
      dx: -30,
      dy: 20,
      color: 'black'
    }
  ]

  const makeAnnotations = d3Annotation.annotation().annotations(annotations)

  svg.call(makeAnnotations)

  // const makeAnnotationsBefore = d3Annotation
  //   .annotation()
  //   .accessors({
  //     x: d => xPositionScale(d.MONTH),
  //     y: d => yPositionScale(d.before)
  //   })
  //   .annotations(annotationsBefore)

  // const makeAnnotationsAfter = d3Annotation
  //   .annotation()
  //   .accessors({
  //     x: d => xPositionScale(d.MONTH),
  //     y: d => yPositionScale(d.after)
  //   })
  //   .annotations(annotationsAfter)

  // console.log('first annot', annotationsBefore)
  // console.log('second annot', annotationsAfter)

  // svg.call(makeAnnotationsBefore)
  // svg.call(makeAnnotationsAfter)

  const xTickLabels = ['Feb', 'Apr', 'Jun', 'Aug', 'Oct', 'Dec']

  const xAxis = d3
    .axisBottom(xPositionScale)
    .tickValues([2, 4, 6, 8, 10, 12])
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
    .ticks(5)
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
}
