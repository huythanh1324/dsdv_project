import * as d3 from "https://cdn.jsdelivr.net/npm/d3@6/+esm"

const tempRowConverter = function(data){
    return {
        Entity: data.Entity,
        year:data.year,
        month: new Date(data.Day).getMonth() +1,
        temperature : data['Average surface temperature in a year']
    }
}

const seaRowConverter = function(data) {
    return {
        entity: data.Entity,
        year: new Date(data.Day).getFullYear(),
        seaLevel : data['Global sea level as an average of Church and White (2011) and UHSLC data']
    }
}
const labels = ['Temperature','Sea Level']
const className = ['temp','sea'] 
const strokes = []

// set the dimensions and margins of the graph
const margin = {top: 10, right: 150, bottom: 30, left: 60},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

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

var dataTemperatureGrouped = []
var dataSeaLevelGrouped = []

await d3.csv("./data/average-monthly-surface-temperature.csv",tempRowConverter).then( function(data) {
    dataTemperature = data.filter(d => d.Entity=='World' && d.month == 1);
  // group the data: I want to draw one line per group
  dataTemperatureGrouped = d3.group(dataTemperature, d => d.Entity);

})

await d3.csv("./data/sea-level.csv",seaRowConverter).then( function(data) {
    dataSeaLevel = data.filter(d => d.entity=='World' && d.year >= 1940 && d.year <= 2020)
    dataSeaLevelGrouped = d3.group(dataSeaLevel, d => d.entity, d => d.year);
})
// draw x and 2 y axis 
const x = d3.scaleLinear()
.domain(d3.extent(dataTemperature, function(d) { return d.year; }))
.range([ 0, width ]);
svg.append("g")
.attr("transform", `translate(0, ${height})`)
.call(d3.axisBottom(x).ticks(12));


const yTemperature = d3.scaleLinear()
.domain([13, 15])
.range([ height, 0 ]);
svg.append("g")
.attr('transform',`translate(${width})`)
.call(d3.axisRight(yTemperature))



const ySeaLevel = d3.scaleLinear()
.domain([-140, 70])
.range([ height, 0 ]);
svg.append("g")
.call(d3.axisRight(ySeaLevel))
.call(g => g.selectAll(".tick line").attr("x2",-6))
.call(g => g.selectAll(".tick text")
                       .attr("x", -30)
                       .attr("dy", 5));

// draw line
var tempLine = svg.append('g').selectAll(".temp")
      .data(dataTemperatureGrouped)
      .join("path")
        .attr("fill", "none")
        .attr("stroke", '#ffcc66')
        .attr('class','line temp')
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
        
        
var seaLine = svg.append('g').selectAll(".sea")
        .data(dataSeaLevelGrouped)
        .join("path")
        .attr("fill", "none")
        .attr('class','line sea')
        .attr("stroke", '#b4e1ff')
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
// draw scatter plot and value label
svg.append('g')
.selectAll("dot")
.data(dataSeaLevelGrouped.get('World'))
.enter()
.append("circle").filter(function(d) {return d[0] % 5  == 0 })
  .attr("cx", function (d) {return x(d[0]); } )
  .attr("cy", function (d) { 
    let sum = d[1].reduce((partialSum, a) => partialSum + parseFloat(a.seaLevel),0)
    let avg = sum/d[1].length  
    return ySeaLevel(avg); } )
  .attr("r", 5)
  .style("fill", "#69b3a2")
  .attr('class', d => `${d[0]} sea`)
  .on('mouseover', function(e){
    let selectedYear = d3.select(this).attr('class').split(' ')[0]
    let selectedText = document.getElementsByClassName(`text${selectedYear}`)
    for (let text = 0 ;text < selectedText.length; text++){
        selectedText[text].classList.remove('display-none')
    }
})
.on('mouseout', function(e) {
    let selectedYear = d3.select(this).attr('class').split(' ')[0]
    let selectedText = document.getElementsByClassName(`text${selectedYear}`)
    for (let text = 0 ;text < selectedText.length; text++){
        selectedText[text].classList.add('display-none')
    }
})

svg.append('g')
  .selectAll("label")
  .data(dataSeaLevelGrouped.get('World'))
  .enter()
  .append("text").filter(function(d) {return d[0] % 5  == 0 })
    .attr("x", function (d) {return x(d[0])-10; } )
    .attr("y", function (d) { 
      let sum = d[1].reduce((partialSum, a) => partialSum + parseFloat(a.seaLevel),0)
      let avg = sum/d[1].length  
      return ySeaLevel(avg) -10; } )
    .text(function(d){ 
        let sum = d[1].reduce((partialSum, a) => partialSum + parseFloat(a.seaLevel),0)
        let avg = sum/d[1].length  
        return parseFloat(avg).toFixed(2);})
    .style("fill", "black")
    .style('font-size', '8px')
    .attr('class',d => `text${d[0]} display-none value-sea sea`)

svg.append('g')
  .selectAll("dot")
  .data(dataTemperatureGrouped.get('World'))
  .enter()
  .append("circle").filter(function(d) {return d.year % 5 == 0})
    .attr("cx", function (d) {return x(d.year); } )
    .attr("cy", function (d) { return yTemperature(d.temperature); } )
    .attr("r", 5)
    .style("fill", "red")
    .attr('class',d => `${d.year} temp`)
    .on('mouseover', function(e){
        let selectedYear = d3.select(this).attr('class').split(' ')[0]
        let selectedText = document.getElementsByClassName(`text${selectedYear}`)
        for (let text = 0 ;text < selectedText.length; text++){
            selectedText[text].classList.remove('display-none')
        }
    })
    .on('mouseout', function(e) {
        let selectedYear = d3.select(this).attr('class').split(' ')[0]
        let selectedText = document.getElementsByClassName(`text${selectedYear}`)
        for (let text = 0 ;text < selectedText.length; text++){
            selectedText[text].classList.add('display-none')
        }
    })

svg.append('g')
  .selectAll("label")
  .data(dataTemperatureGrouped.get('World'))
  .enter()
  .append("text").filter(function(d) {return d.year % 5 == 0})
    .attr("x", function (d) {return x(d.year) -10; } )
    .attr("y", function (d) { return yTemperature(d.temperature) + 10; } )
    .text(function(d){return parseFloat(d.temperature).toFixed(2)})
    .style("fill", "black")
    .style('font-size', '8px')
    .attr('class',d => `text${d.year} display-none value-temp temp`)

svg.selectAll('.line')
  .each(function(d, i) {
    strokes.push(d3.select(this).attr('stroke'));
  });

  
  // legend
  const mouseoverLegend = function (e) {
        let classnames = d3.select(this).attr('class')
        let classname = classnames.split(' ')[1]
        let allElements = document.querySelectorAll('path.line,circle')
        for (let element = 0; element < allElements.length; element++) {
            if (!allElements[element].classList.contains(classname)){
                allElements[element].classList.add('opacity-02')
            }
        }

        let elements =   document.getElementsByClassName(classname)
        for (let element = 0; element < elements.length; element++) {
          if (elements[element].classList.contains('display-none')){
              elements[element].classList.remove('display-none')
          }
        }
    }
  const mouseoutLegend = function(e) {
    let classnames = d3.select(this).attr('class')
        let classname = classnames.split(' ')[1]
        let allElements = document.querySelectorAll('path.line,circle')
        for (let element = 0; element < allElements.length; element++) {
            if (!allElements[element].classList.contains(classname)){
                allElements[element].classList.remove('opacity-02')
            }
        }

        let elements =   document.getElementsByClassName(`value-${classname}`)
        for (let element = 0; element < elements.length; element++) {
              elements[element].classList.add('display-none')
        }
  }  
  var legend_container = d3.select('svg.sea-level-svg')
  .append('g')
  .attr("transform",`translate(${margin.left + width + 50},${margin.top +50})`)
.attr("fill","none")
.attr("height", height)
.attr("width",margin.right)
.selectAll('.legend')
.data(labels)
.enter()
.append('g')
.attr('transform','translate(10,0)')


legend_container.append('rect')
.attr('class','legend')
.attr('fill',function(d, i){return strokes[i]})
.attr('width','10px')
.attr('height','10px')
.attr('y',function(d,i){
    return 20 * i -10
})
legend_container.append('text')
.html(function(d){
    return d
})
.attr('fill',function(d, i){return strokes[i]})
.attr('class',(d,i) => `legend ${className[i]}`)
.attr('y', function(d ,i) {
return  20 * i
})
.attr('x', '10px')  
.style('font-size','14px')
.on('mouseover',mouseoverLegend)
.on('mouseout',mouseoutLegend)





