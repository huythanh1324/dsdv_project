import * as d3 from "https://cdn.jsdelivr.net/npm/d3@6/+esm"

var rowConverter = function(data){
    return {
        Entity: data.Entity,
        year:data.year,
        month: new Date(data.Day).getMonth() +1,
        temperature : data['Average surface temperature']
    }
}

// set the dimensions and margins of the graph
const margin = {top: 10, right: 150, bottom: 30, left: 60},
    width = 700 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select(".temperature")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr('class','temperature-svg')
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);




//Read the data
d3.csv("./data/average-monthly-surface-temperature.csv",rowConverter).then( function(data) {
    const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    data = data.filter(d => d.year>=1990 && d.year <=2020)
  // group the data: I want to draw one line per group
  const sumstat = d3.group(data, d => d.year, d=> d.month); // nest function allows to group the calculation per level of a factors
  // Add X axis --> it is a date format
  const x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.month; }))
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(12));

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([12, 24])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));

  const legend_container = d3.select('svg.temperature-svg')
                  .append('g')
                  .attr("transform",`translate(${margin.left + width},${margin.top})`)
                  .append('g')
                  .attr("fill","none")
                  .attr("height", height)
                  .attr("width",margin.right)
  var legends = legend_container.selectAll('.legend')
                                  .data(sumstat)
                                  .enter()
                                  .append('g')
                                  .attr('transform','translate(10,0)')
                                  .on('click',clickLegend)

  legends.append('rect')
          .attr('class','legend no-highlighted')
          .attr('width','10px')
          .attr('height','10px')
          .attr('y',function(d,i){
            return height - 16 * i -10
          })
  legends.append('text').html(function(d){
                                    return d[0]
                                  })
                                  .attr('class','legend')
                                  .attr('fill','currentColor')
                                  .attr('y', function(d ,i) {
                                    return height - 16 * i
                                  })
                                  .attr('x', '10px')
  
  // Draw the line
  var lines = svg.selectAll(".line")
      .data(sumstat)
      .join("path")
        .attr("fill", "none")
        .attr('class',function(d){
            var className = 'line' + d[0]
            return className + ' no-highlighted-line';
        })
        .attr("stroke", '#d3d3d3')
        .attr("stroke-width", 1.5)
        .attr("d", function(d){
            return d3.line()
              .x(function(d) {
                return x(d[1][0].month); 
            })
              .y(function(d) { 
                let sum = d[1].reduce((partialSum, a) => partialSum + parseFloat(a.temperature),0)
                let avg = sum/d[1].length

                return y(avg); 
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
                    .data(sumstat)
                    .enter()
                    .append('p')
    var legend = svg.selectAll('.lengend')
                    .data(sumstat)
                    .enter()
                    .append('p')
                    .html(function(d){
                      return d[0]
                    })    
    var focus = svg.selectAll(".focus")
            .data(sumstat)
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
        selectedLine.classList.remove('no-highlighted-line')
        selectedLine.classList.add('highlighted-line')
        selectedLine.setAttribute("stroke",generateHexColor())
      } else {
        legendClassList.remove('highlighted')
        legendClassList.add('no-highlighted')
        var year = this.getElementsByTagName('text')[0].innerHTML
        var lineIndex = lines._groups[0].indexOf(d3.select('.line' + year)._groups[0][0])
        var selectedLine = lines._groups[0][lineIndex]
        selectedLine.classList.remove('highlight-line')
        selectedLine.classList.add('no-highlighted-line')
        selectedLine.setAttribute("stroke",'#d3d3d3')
      }
      
    }
    
    function mouseover() {
        focus.style("opacity", 1)

        Tooltip
        .style("opacity", 1)
        .style("z-index", 1)
        d3.selectAll('.no-highlighted-line').attr('opacity',0.3)
    }
    function mouseout() {
        focus.style("opacity", 0)

        Tooltip
        .style("z-index", -1)
        .style("opacity", 0)
        d3.selectAll('.no-highlighted-line').attr('opacity',1)

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
            return y(avg);
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
    function generateHexColor() {
      // Generate a random number between 0 and 0xFFFFFF
      const randomNumber = Math.floor(Math.random() * 16777215);
      // Convert the random number to a hexadecimal string
      const hexString = randomNumber.toString(16);
      // Ensure the string is 6 characters long by padding with leading zeros if necessary
      const paddedHexString = hexString.padStart(6, '0');
      // Add the '#' symbol to make it a valid hex color code
      return `#${paddedHexString}`;
  }    
})
