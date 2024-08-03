async function draw() {
  // Data
  const dataset = await d3.csv('data.csv')

  const xAccessor = d => parseFloat(d.miles)
  const yAccessor = d => parseFloat(d.elevation)

  // Dimensions
  let dimensions = {
    width: 1000,
    height: 500,
    margins: 50
  }
  dimensions.ctrWidth = dimensions.width - dimensions.margins * 2
  dimensions.ctrHeight = dimensions.height - dimensions.margins * 2

  // Draw Images
  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height)

  const ctr = svg.append('g')
    .attr('transform', `translate(${dimensions.margins},${dimensions.margins})`)

  const tooltip = d3.select('#tooltip')

  // Scales
  const xScale = d3.scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.ctrWidth])
    .clamp(true)

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, yAccessor)])
    .range([dimensions.ctrHeight, 0])
    .clamp(true)
    .nice()
  
  // Draw Line
  const lineGenerator = d3.line()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)))
    .curve(d3.curveCatmullRom)

  ctr.append('path')
    .datum(dataset)
    .attr('d', lineGenerator)
    .attr('fill', 'none')
    .attr('stroke', '#D62728')
    .attr('stroke-width', 5)

  // Draw Circles
  ctr.selectAll('circle')
    .data(dataset)
    .join('circle')
    .attr('r', 4)
    .attr('fill', 'white')
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('cx', d => xScale(xAccessor(d)))
    .attr('cy', d => yScale(yAccessor(d)))
    .on('mouseenter', function(event, datum) {
      tooltip.style('display', 'block')
        .style('top', yScale(yAccessor(datum)) - 20 + 'px')
        .style('left', xScale(xAccessor(datum)) + 'px')

      const formatter = d3.format('.1f')
  
      tooltip.select('.stop-name')
        .text((d => d.stop)(datum))

      tooltip.select('.elevation span')
        .text(formatter(yAccessor(datum)))
    })
    .on('mouseleave', function(event) {
      tooltip.style('display', 'none')
    })

  // Draw Axes ⭐️
  const xAxis = d3.axisBottom(xScale)
      .tickFormat((d, i, nodes) => {
      if (i === nodes.length - 1) {
        return `${d}mi`;
      }
      return d;
    });
    
  const xAxisGroup = ctr.append('g')
    .call(xAxis)
    .style('transform', `translateY(${dimensions.ctrHeight}px)`)

  xAxisGroup.selectAll('.tick line')
    .style('display', 'none')

  const yAxis = d3.axisLeft(yScale)
    .ticks(5)
    .tickFormat((d, i, nodes) => {
      if (i === nodes.length - 1) {
        return `${d}ft`;
      }
      return d;
    })
  
  const yAxisGroup = ctr.append('g')
    .call(yAxis)
    .select('.domain').remove()

  // Add tick Line ⭐️
  ctr.selectAll('.tick-line')
    .data(yScale.ticks(5))
    .join('line')
    .classed('tick-line', true)
    .attr('x1', 0)
    .attr('y1', d => yScale(d))
    .attr('x2', dimensions.ctrWidth)
    .attr('y2', d => yScale(d))
    .attr('stroke', '#e0e0e0')
    .attr('stroke-width', 2)
    .lower()

const annotationGroup = ctr.append('g');

// Draw Arrow 
annotationGroup.append('line')
  .attr('x1', xScale(0.63))  
  .attr('y1', yScale(100))  
  .attr('x2', xScale(0.81))  
  .attr('y2', yScale(180))   
  .attr('stroke', 'black')  
  .attr('stroke-width', 1)   
  .attr('marker-end', 'url(#arrowhead)'); 

  //Arrowhead⭐️⭐️
svg.append('marker')
  .attr('id', 'arrowhead')
  .attr('viewBox', '-0 -5 10 10')
  .attr('orient', 'auto')
  .attr('markerWidth', 8)
  .attr('markerHeight', 18)
  .append('path')
  .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
  .attr('fill', 'black')
  .style('stroke', 'none');


annotationGroup.append('text')
  .attr('x', xScale(0.48))  
  .attr('y', yScale(86))  
  .attr('text-anchor', 'start') 
  .attr('font-size', '0.9rem')  
  .attr('font-weight', '300')
  .attr('font-family', 'Helvetica', 'Arial', 'Roboto') // ⭐️
  .html(`<tspan x="${xScale(0.48)}" dy="0em">This segment is the</tspan><br>
  <tspan x="${xScale(0.48)}" dy="1.2em">steepest a bus</tspan><br>
  <tspan x="${xScale(0.48)}" dy="1.2em">climbs in S.F.</tspan>`);
}

draw()