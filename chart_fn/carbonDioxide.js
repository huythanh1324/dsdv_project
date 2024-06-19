import * as d3 from "https://cdn.jsdelivr.net/npm/d3@6/+esm"

// set the dimensions and margins of the graph
const margin = {top: 30, right: 100, bottom: 70, left: 60},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select(".carbon-dioxide")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
// Parse the Data
d3.csv("./data/carbon-dioxide-emissions-factor.csv").then( function(data) {
    const selectedData = data.slice(0,15)
    const unselectedData = data.slice(15,data.length)
// X axis
const x = d3.scaleBand()
  
  .range([ 0, width ])
  .domain(selectedData.map(d => d.Entity))
  .padding(0.2);
svg.append("g")
  .attr('class','xaxis')  
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(x))
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");
// Add Y axis
const y = d3.scaleLinear()
  .domain([0, d3.max(selectedData.map(d=>d['CO₂ emission factor'] ))])
  .range([ height, 0]);
svg.append("g")
  .attr('class','yaxis')
  .call(d3.axisLeft(y));

// Bars
svg.selectAll("mybar")
  .data(selectedData)
  .join("rect")
    .attr("x", d => x(d.Entity))
    .attr("y", d => y(d['CO₂ emission factor']))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d['CO₂ emission factor']))
    .attr("fill", "#69b3a2")
    .attr('class','bar')
    .on('mouseover', function(e) {
        d3.selectAll('.bar').attr('opacity',0.5)
        d3.select(this).attr('opacity',1)
    })
    .on('mouseout', function(e){
        d3.selectAll('.bar').attr('opacity',1)
    })

//Create labels
svg
	.selectAll("label")
	.data(selectedData)
	.enter()
	.append("text")
	.text(function (d) {
		return d['CO₂ emission factor'] +" kg";
	})
	.attr("text-anchor", "middle")
	.attr("x", function (d) {
		return x(d.Entity) + x.bandwidth() / 2;
	})
	.attr("y", function (d) {
		return y(d['CO₂ emission factor']) - 4;
	})
	.attr("font-family", "sans-serif")
	.attr("font-size", "11px")
	.attr("fill", "black")
    .attr('class','label')

d3.select('#select-factors')
    .selectAll('option')
    .data(unselectedData)
    .enter()
    .append('option')
    .attr('value', d=> d.Entity)
    .text( d=> d.Entity)
    .attr('class','option')

//On click, update with new data
d3.selectAll(".button_click").on("click", function () {
	//See which p was clicked
	var buttonID = d3.select(this).attr("id");

	//Decide what to do next
    if (buttonID == "add" && Boolean(unselectedData[0])) {
        let index = document.getElementById('select-factors').selectedIndex
        //Add a data value
        selectedData.push(unselectedData[index])
        unselectedData.splice(index,1)
        console.log(unselectedData)
    } else if (Boolean(selectedData[0]) ){
        //Remove a value
        unselectedData.push(selectedData.shift())
    }
	//Update scale domains
	x.domain(selectedData.map(d => d.Entity));
	y.domain([
		0,
		d3.max(selectedData, function (d) {
			return d['CO₂ emission factor'];
		})
	]);

	//Select…
	var bars = svg.selectAll(".bar").data(selectedData);

	var text = svg.selectAll(".label").data(selectedData);
    
    var option = d3.select('#select-factors').selectAll('.option').data(unselectedData)
    
    svg
        .selectAll(".xaxis")
        .transition()
        .duration(500)
        .call(d3.axisBottom(x));
    svg
        .selectAll(".yaxis")
        .transition()
        .duration(500)
        .call(d3.axisLeft(y))
    
	//Enter…
	bars
    .enter()
    .append("rect")
    .attr("x", d => x(d.Entity))
    .attr("y", d => y(d['CO₂ emission factor']))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d['CO₂ emission factor']))
    .attr("fill", "#69b3a2")
    .attr('class','bar')
    .on('mouseover', function(e) {
        d3.selectAll('.bar').attr('opacity',0.5)
        d3.select(this).attr('opacity',1)
    })
    .on('mouseout', function(e){
        d3.selectAll('.bar').attr('opacity',1)
    })
    .merge(bars) //Update…
    .transition()
    .duration(500)
    .attr("x", d => x(d.Entity))
    .attr("y", d => y(d['CO₂ emission factor']))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d['CO₂ emission factor']))
    .attr("fill", "#69b3a2")
    .attr('class','bar')
        
    //Exit…
    bars.exit().transition().duration(500).attr("x", -x.bandwidth()).remove();
        
        text
		.enter()
		.append("text")
		.text(function (d) {
            return d['CO₂ emission factor'] + " kg";
        })
        .attr("text-anchor", "middle")
        .attr("x", function (d) {
            return x(d.Entity) + x.bandwidth() / 2;
        })
        .attr("y", function (d) {
            return y(d['CO₂ emission factor']) - 4;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "black")
        .attr('class','label')
		.merge(text)
		.transition()
		.duration(500)
		.text(function (d) {
            return d['CO₂ emission factor'] + "kg";
        })
        .attr("text-anchor", "middle")
        .attr("x", function (d) {
            return x(d.Entity) + x.bandwidth() / 2;
        })
        .attr("y", function (d) {
            return y(d['CO₂ emission factor']) - 4;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "black")
        .attr('class','label')
        
        text.exit().transition().duration(500).attr("x", -x.bandwidth()).remove();

        svg
        .selectAll(".xaxis")
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");


    option
        .enter()
        .append('option')
        .attr('value', d=> d.Entity)
        .text( d=> d.Entity)
        .merge(option) //Update…
        .attr('value', d=> d.Entity)
        .text( d=> d.Entity)
        .attr('class','option')
        
    option.exit().remove();
});
})