import * as d3 from "https://cdn.jsdelivr.net/npm/d3@6/+esm"

// set the dimensions and margins of the graph
const margin = {top: 10, right: 150, bottom: 20, left: 50},
    width = 580 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select(".natural-disater")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr('class','natural-disater-svg')
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
var rowConverter = function(d){
    return {
        entity: d.Entity,
        year: d.Year,
        small: d['Number of reported natural disasters with a small impact (decadal)'],
        medium: d['Number of reported natural disasters with a medium impact (decadal)'],
        large: d['Number of reported natural disasters with a large impact (decadal)']
    }
}
// Parse the Data
d3.csv("./data/natural-disasters-by-decadal-size.csv",rowConverter).then( function(data) {
    data=data.filter(d => d.entity == 'World' && d.year >= 1940)
    const subgroups = Object.keys(data[0]).slice(2,5)
  // List of subgroups = header of the csv files = soil condition here
  // List of groups = species here = value of the first column called group -> I show them on the X axis
  const groups = data.map(d => (d.year))
  // Add X axis
  
  // Add Y axis
  const y = d3.scaleLinear()
  .domain([-2000, 4000])
  .range([ height, 0 ]);
  svg.append("g")
  .call(d3.axisLeft(y));
const x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.2])
  svg.append("g")
    .attr("transform", `translate(0, ${y(0)})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));
    // init tooltip
var tooltip = d3.select(".natural-disater").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0)
    .style("background-color", "white")
    .style("border-radius", "5px")
    .style("position","absolute")
    .style('font-size','12px')
    .style('padding','5px')
  // color palette = one color per subgroup
  const color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['#e41a1c','#377eb8','#4daf4a'])

  //stack the data? --> stack per subgroup
  var stackedData = d3.stack()
    .keys(subgroups)
    (data)

  // Interaction
  
  const handleMouseOver = (e, d) => {  
            tooltip.style("opacity", 0.8);      
            tooltip.html(`
            <p style ='font-size: 12px;'>Data for ${d.data.year}</p>
            <ul style='list-style-type: none;margin:5px;padding: 0;display:inline-block'>
                <li style='color: ${color('small')}'>${d.data.small}</li> 
                <li style='color: ${color('medium')}'>${d.data.medium}</li> 
                <li style='color: ${color('large')}'>${d.data.large}</li>
            </ul> 
            `)
            .style("left",d3.pointer(event,this)[0]+100 +"px")
            .style("top", d3.pointer(event,this)[1]+30+"px")
    }
    const handleMouseOut = e => {
        tooltip.style("opacity", 0);
    }
    const hanldeClick = (e,d) => {
        let value = d[1] - d[0]
        let key = Object.keys(d.data).find(key => d.data[key] == value)
        let distance = stackedData.map(d =>{
            if (d.key == key) {
                return d.map(d2 =>  d2[0])
            }
        })[subgroups.indexOf(key)]
        for(let i= 0; i<stackedData.length;i++){
            for(let j= 0; j<stackedData[i].length;j++){
                stackedData[i][j][0] -= distance[j]
                stackedData[i][j][1] -= distance[j]
            }
        }

        let bars = d3.selectAll('.bars').data(stackedData)
        svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .join("g")
        .attr("fill", d => color(d.key))
        .attr('class', d => d.key)
        .attr('class','bars')
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(d => d)
        .join("rect")
        .attr("x", d => {return x(d.data.year)})
        .attr("height", d => 0)
        .attr("y", d => y(d[1]))
        .attr("width",x.bandwidth())
        .attr('cursor','pointer')
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut)
        .on('click', hanldeClick)
        .transition()
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))

        bars.remove()
        
        tooltip.style("opacity", 0);
    }
  // Show the bars
  svg.append("g")
  .selectAll("g")
  // Enter in the stack data = loop key per key = group per group
  .data(stackedData)
  .join("g")
  .attr("fill", d => color(d.key))
  .attr('class', d => d.key)
  .attr('class','bars')
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(d => d)
      .join("rect")
        .attr("x", d => {return x(d.data.year)})
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width",x.bandwidth())
        .attr('cursor','pointer')
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut)
        .on('click', hanldeClick)

  //show label
  const legends = d3.select('svg.natural-disater-svg')
                  .append('g')
                  .attr("transform",`translate(${margin.left + width},${margin.top})`)
                  .append('g')
                  .attr("fill","none")
                  .attr("height", height)
                  .attr("width",margin.right)
                  .selectAll('.legend')
                  .data(subgroups)
                  .enter()
                  .append('g')
                  .attr('transform','translate(10,0)')

  legends.append('rect')
        .attr('fill',d=> color(d))
        .attr('width','10px')
        .attr('height','10px')
        .attr('y',function(d,i){
        console.log(d)
        return 16 * i - 5
  })
  legends.append('text').html(function(d){
                          return d.charAt(0).toUpperCase() + d.slice(1) + " disater"
                        })
                        .attr('fill',d => color(d))
                        .attr('y', function(d ,i) {
                          return 16 * i + 5
                        })
                        .attr('x', '15px')
})