import * as d3 from "https://cdn.jsdelivr.net/npm/d3@6/+esm"

// set the dimensions and margins of the graph
const margin = {top: 10, right: 150, bottom: 20, left: 50},
width = 860 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select(".forest")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.attr("class","forest-svg")
.append("g")
.attr("transform",`translate(${margin.left},${margin.top})`);
d3.csv("./data/forest-area-as-share-of-land-area.csv").then( function(data) {
    // List of subgroups = header of the csv files = soil condition here
    const continences = ["Africa","Americas","Australia","Europe","Asia"]
    const times = [1990,1995,2000,2005,2010,2015,2020]
    data = data.filter(d => {return times.indexOf(parseInt(d.Year)) >=0})
    data = data.filter(d => {
        let flag = false
        for(let continence in continences){
           if (d.Entity == continences[continence]){
             flag = true 
           }
        }
        return flag
    })
  // List of groups = species here = value of the first column called group -> I show them on the X axis
  var sumstat = d3.group(data,d=> d.Year)
  var dataset = times.map(d=>{
    return sumstat.get(`${d}`)
  })
  // Add X axis
  const x = d3.scaleBand()
      .domain(times)
      .range([0, width])
      .padding([0.2])
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSize(0));

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([15, 50])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Another scale for subgroup position?
  const xSubgroup = d3.scaleBand()
    .domain(continences)
    .range([0, x.bandwidth()])
    .padding([0.05])

  // color palette = one color per subgroup
  const color = d3.scaleOrdinal()
    .domain(continences)
    .range(['#004D40','#FF4081','#8A2BE2','#000080','#FF6347'])

  // Show the bars
  const groupSVG = svg.append("g")
    .selectAll("g")
    // Enter in data = loop group per group
    .data(dataset)
    .join("g")
      .attr("transform", d => {return `translate(${x(d[0].Year)}, 0)`})
      .attr("class", 'group')
  groupSVG  
    .selectAll("g")
    .data(function(d) {return d.map(function(data) { return {key: data.Entity, value: data['Forest cover']}; }); })
    .join("rect")
    .attr("class",d => {
      return `bar ${d.key}`
    })
    .attr("x", d => {return xSubgroup(d.key)})
    .attr("width", xSubgroup.bandwidth())
    .attr("y", function(d) { return y(0); })
    .attr("height", function(d) { return height - y(15); })
    .attr("fill", d => color(d.key))
    .transition()
    .duration(800)
    .attr("y", d => y(d.value))
    .attr("height", d => height - y(d.value))
    .delay(function(d,i) { return(i*100)})
    
  groupSVG.selectAll('.bar')
        .on('mouseover', e => handleMouseOver(e))
        .on('mouseout', e => handleMouseOut(e))

  function handleMouseOver(e) {
    let bars = document.getElementsByClassName(e.target.classList[0])
    for(let bar = 0;bar < bars.length; bar++){
      bars[bar].classList.add('opacity-02')
    }

    let selectedContinence = document.getElementsByClassName(e.target.classList[1])
    for(let selectedBar = 0; selectedBar < selectedContinence.length;selectedBar++ ){
      selectedContinence[selectedBar].classList.remove('opacity-02')
    }

    let selectedLabel = document.getElementsByClassName(`label${e.target.classList[1]}`)
    for(let label = 0; label < selectedLabel.length;label++ ){
      selectedLabel[label].classList.remove('display-none')
    }
  }
  function handleMouseOut(e) {
    let bars = document.getElementsByClassName(e.target.classList[0])
    for(let bar = 0;bar < bars.length; bar++){
      bars[bar].classList.remove('opacity-02')
    }
    let selectedLabel = document.getElementsByClassName(`label`)
    for(let label = 0; label < selectedLabel.length;label++ ){
      selectedLabel[label].classList.add('display-none')
    }
  }

  groupSVG
    .selectAll('g')
    .data(d => {
      return d.map(function(data) { return {key: data.Entity, value: data['Forest cover']}; }); 
    })
    .join('text')
    .attr('class', d => `label label${d.key} display-none`)
    .attr("x", d => {return xSubgroup(d.key)-6})
    .attr("y", d => y(d.value) -5)
    .attr("fill", 'black')
    .attr("font-family", "sans-serif")
    .attr("font-size", "12px")
    .text(d => parseFloat(d.value).toFixed(2) + "%")
  
    
  const legends = d3.select('svg.forest-svg')
                      .append('g')
                      .attr("transform",`translate(${margin.left + width},${margin.top})`)
                      .append('g')
                      .attr("fill","none")
                      .attr("height", height)
                      .attr("width",margin.right)
                      .selectAll('.legend')
                      .data(continences)
                      .enter()
                      .append('g')
                      .attr('transform','translate(10,0)')
  
  legends.append('rect')
          .attr('width','10px')
          .attr('height','10px')
          .attr('y',function(d,i){
            return 16 * i +40
          })
          .attr('fill',d=> color(d))
  legends.append('text')
          .text(function(d){
            return d
          })
          .attr('fill',d => color(d))
          .attr('y', function(d ,i) {
            return 16 * i  + 50
          })
          .attr('x', '15px')
})