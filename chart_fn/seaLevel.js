import * as d3 from "https://cdn.jsdelivr.net/npm/d3@6/+esm"

const tempRowConverter = function(data){
    return {
        Entity: data.Entity,
        year:data.year,
        month: new Date(data.Day).getMonth() +1,
        temperature : data['Average surface temperature in a year']
    }
}

// set the dimensions and margins of the graph
const margin = {top: 10, right: 150, bottom: 30, left: 60},
    width = 700 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select(".sea-level")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr('class','sea-level-svg')
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

var dataTemperature = []
var dataSeaLevel = []

//Read the data
await d3.csv("./data/average-monthly-surface-temperature.csv",tempRowConverter).then( function(data) {
  data = data.filter(d => d.Entity=='World' && d.month == 1)
  // group the data: I want to draw one line per group
  dataTemperature = d3.group(data, d => d.Entity); // nest function allows to group the calculation per level of a factors
  // Add X axis --> it is a date format
  const x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.year; }))
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(12));
  // Add Y axis
  const yTemperature = d3.scaleLinear()
    .domain([13, 15])
    .range([ height, 0 ]);
  svg.append("g")
    .attr('transform',`translate(${width})`)
    .call(d3.axisRight(yTemperature));

  // Draw the line
  var lines = svg.selectAll(".line")
      .data(dataTemperature)
      .join("path")
        .attr("fill", "none")
        .attr("stroke", 'red')
        .attr("stroke-width", 1.5)
        .attr("d", function(d){
            return d3.line()
              .x(function(d) {
                
                return x(d.year); 
            })
              .y(function(d) { 
                return yTemperature(d.temperature); 
            })
              (d[1])
        })

    var Tooltip = d3.select('.temperature')
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("position","absolute")
        .style('font-size','8px')
        .style('width','110px')
        .style('z-index','-1')

    var p = Tooltip.selectAll('.tooltip-text')
                    .data(dataTemperature)
                    .enter()
                    .append('p')
    var focus = svg.selectAll(".focus")
            .data(dataTemperature)
            .enter()
            .append('g')
            .append('circle')
              .style("fill", "black")
              .attr("stroke", "black")
              .attr('r', 2)
              .style("opacity", 0)


    svg
              .append('rect')
              .style("fill", "none")
              .style("pointer-events", "all")
              .attr('width', width)
              .attr('height', height)
              .on('mouseover', mouseover)
              .on('mousemove', mousemove)
              .on('mouseout', mouseout);

    function clickLegend(){
      
      var legendClassList = this.getElementsByTagName('rect')[0].classList
      if (legendClassList.contains('no-highlighted')){
        legendClassList.remove('no-highlighted')
        legendClassList.add('highlighted')
        var year = this.getElementsByTagName('text')[0].innerHTML
        var lineIndex = lines._groups[0].indexOf(d3.select('.line' + year)._groups[0][0])
        var selectedLine = lines._groups[0][lineIndex]
        selectedLine.setAttribute("stroke",'black')
      } else {
        legendClassList.remove('highlighted')
        legendClassList.add('no-highlighted')
        var year = this.getElementsByTagName('text')[0].innerHTML
        var lineIndex = lines._groups[0].indexOf(d3.select('.line' + year)._groups[0][0])
        var selectedLine = lines._groups[0][lineIndex]
        selectedLine.setAttribute("stroke",'#white')
      }
      
    }
    
    function mouseover() {
        focus.style("opacity", 1)

        Tooltip
        .style("opacity", 1)
        .style("z-index", 1)
    }
    function mouseout() {
        focus.style("opacity", 0)

        Tooltip
        .style("z-index", -1)
        .style("opacity", 0)
    }
    function mousemove() {
        // recover coordinate we need
        var x0 = x.invert(d3.pointer(event,this)[0]);
        var focusX = Math.round(x0);
        focus.attr("cx",function(d){
            return x(focusX)
        }).attr("cy",function(d){
            var sum = d[1].get(focusX).reduce((partialSum, a) => partialSum + parseFloat(a.temperature), 0)
            var avg = sum/d[1].get(focusX).length;
            return yTemperature(avg);
        })

        p.html(function(d){
            var text =  month[focusX-1] + ' ' + d[0] + ': '
            var sum = d[1].get(focusX).reduce((partialSum, a) => partialSum + parseFloat(a.temperature), 0)
            var avg = sum/d[1].get(focusX).length;
            text += avg.toFixed(2) + ' C'
            return text
        })
        Tooltip
            .style("left",d3.pointer(event,this)[0] +"px")
            .style("top", d3.pointer(event,this)[1] +50 +"px")
    }
})

const seaRowConverter = function(data) {
    return {
        entity: data.Entity,
        year: new Date(data.Day).getFullYear(),
        seaLevel : data['Global sea level as an average of Church and White (2011) and UHSLC data']
    }
}
await d3.csv("./data/sea-level.csv",seaRowConverter).then( function(data) {
  data = data.filter(d => d.entity=='World' && d.year >= 1940 && d.year <= 2020)
  dataSeaLevel = d3.group(data, d => d.entity, d => d.year);
    const ySeaLevel = d3.scaleLinear()
                            .domain([-200, 70])
                            .range([ height, 0 ]);
    svg.append("g")
        .call(d3.axisRight(ySeaLevel));
    const x = d3.scaleLinear()
            .domain(d3.extent(data, function(d) { return d.year; }))
            .range([ 0, width ]);
    
    var lines = svg.selectAll(".line")
            .data(dataSeaLevel)
            .join("path")
              .attr("fill", "none")
              .attr("stroke", 'blue')
              .attr("stroke-width", 1.5)
              .attr("d", function(d){
                  return d3.line()
                    .x(function(d) {
                      return x(d[1][0].year); 
                  })
                    .y(function(d) { 
                        let sum = d[1].reduce((partialSum, a) => partialSum + parseFloat(a.seaLevel),0)
                        let avg = sum/d[1].length  
                        return ySeaLevel(avg); 
                  })
                    (d[1])
              })
  
})
