// Takes an N-dimensional data frame, performs black magic and lets you get some scatters across a few different axis

//colours should be read from brewer for more choicez
var colours = [
		"#FFF7FB",
		"#ECE7F2",
		"#D0D1E6",
		"#A6BDDB",
		"#74A9CF",
		"#3690C0",
		"#0570B0",
		"#045A8D",
		"#023858",
		"#000000"],
	vis; // visualisation selection
	
if (typeof d3.radikal != "object") d3.radikal = {};

	d3.radikal.quickvis = function (){
		var quickvis = {},
		    data= [],visdata,
		    label= [],
		    target,
		    group,
		    w=760, h=550, //don't hardcore bro
			margin = {top: 20, right: 20, bottom: 60, left: 60},
		    x, y,
			x_axe=0,y_axe=1,r_axe=0,c_axe=1,
			brush,
		    chartW, chartH,
			small_point=1,big_point=30,
			first_color=1,last_color=9,
			xRange = d3.scale.linear().range([margin.left, w - margin.right]),
			yRange = d3.scale.linear().range([h - margin.top, margin.bottom]),
			rRange = d3.scale.linear().range([small_point, big_point]),
			cRange = d3.scale.quantize().range(d3.range(8)),
			xAxis = d3.svg.axis().scale(xRange).tickSize(16).tickSubdivide(true),
			yAxis = d3.svg.axis().scale(yRange).tickSize(10).orient("right").tickSubdivide(true),
		    duration = 1000,
		    keys;


		quickvis.target = function(p){
		        if (!arguments.length) return target;       
		        target = d3.select(p);
		        //w = parent.node().clientWidth;
		        //h = parent.node().clientHeight;
		        x = 0;
		        y = 0;
		
				target.append("svg:g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + h + ")")
					.call(xAxis);

				target.append("svg:g")
					.attr("class", "y axis")
					.call(yAxis);
		        return quickvis;
		    };
		
		quickvis.data = function(d){
	        if (!arguments.length) return data;
	        data = d;
			keys = Object.keys(data[0]);
			prepData(data);
	        return this.redraw();
	    };
	
		quickvis.visdata = function(){
			return visdata;
		};
	
		quickvis.axis = function(d) {
			if (!arguments.length)
				//I'm aware that these are currently all identical...they don't know need to be (room for cleverness here)
				return (keys.length >= 4) ?
					{
						xAxis: keys[x_axe],
						yAxis: keys[y_axe],
						radiusAxis: keys[r_axe],
						colorAxis: keys[c_axe]
					} :
				(keys.length == 3) ?
					{
						xAxis: keys[x_axe],
						yAxis: keys[y_axe],
						radiusAxis: keys[r_axe],
						colorAxis: keys[c_axe]
					} :
					{
						xAxis: keys[x_axe],
						yAxis: keys[y_axe],
						radiusAxis: keys[r_axe],
						colorAxis: keys[c_axe]
					};
			else{
				x_axe = +d3.select(".x-axis").property("selectedIndex");
				y_axe = +d3.select(".y-axis").property("selectedIndex");
				r_axe = +d3.select(".r-axis").property("selectedIndex");
				c_axe = +d3.select(".c-axis").property("selectedIndex");
			}
		}
	
		quickvis.keys = function(){
			return keys;
		};

		quickvis.label = function(s){
			target.selectAll(".chartlabel").remove();
			target.append("svg:text")
				 .attr("class","chartlabel")
				 .attr("x", chartW*3/4)
				 .attr("y", 20)
				 .attr("text-anchor", "end")
				 .text(s);
		};
		
		quickvis.redraw = function(){
			var data_points = target.selectAll("circle").data(data),
				axes = this.axis(); //wild~~~ axes~~~ (for u julia)
			
			//Always need at least X and Y (no histograms or ts yet NERD)
			xRange.domain([
				d3.min(data, function (d) { return +d[axes.xAxis]; }),
				d3.max(data, function (d) { return +d[axes.xAxis]; })
			]);
			yRange.domain([
				d3.min(data, function (d) { return +d[axes.yAxis]; }),
				d3.max(data, function (d) { return +d[axes.yAxis]; })
			]);
			
			//3rd dimension is SIZE (twss)
			rRange.domain([
				d3.min(data, function (d) { return +d[axes.radiusAxis]; }),
				d3.max(data, function (d) { return +d[axes.radiusAxis]; })
			]);
			
			//4th dimension is color (twss?)
			cRange.domain([
				d3.min(data, function (d) { return +d[axes.colorAxis]; }),
				d3.max(data, function (d) { return +d[axes.colorAxis]; })
			]);
			
			
			var tranny = target.transition().duration(duration).ease("exp-in-out");
		    tranny.select(".x.axis").call(xAxis);
		    tranny.select(".y.axis").call(yAxis);
		
			data_points.enter()
				.insert("svg:circle")
					.attr("cx", function (d) { return xRange (d[axes.xAxis]); })
					.attr("cy", function (d) { return yRange (d[axes.yAxis]); })
					.style("opacity", 0)
					.style("fill", function (d) { return colours[cRange(d[axes.colorAxis])]; });
					
			
			data_points.transition().duration(duration).ease("exp-in-out")
				.style("opacity", .75)
				.style("fill", function (d) { 
					return colours[cRange(d[axes.colorAxis])];})
				.attr("r", function(d) { return rRange (d[axes.radiusAxis]); })
				.attr("cx", function (d) { return xRange (d[axes.xAxis]); })
				.attr("cy", function (d) { return yRange (d[axes.yAxis]); });
				
			data_points.exit()
					.transition().duration(duration).ease("exp-in-out")
						.attr("cx", function (d) { return xRange (d[axes.xAxis]); })
						.attr("cy", function (d) { return yRange (d[axes.yAxis]); })
						.style("opacity", 0)
						.attr("r", 0)
				.remove();
			
		};
		
		
		function prepData(dat){
			return data;
		}
		
		return quickvis;
};

function buildAxisSelectors(keyz){
	controls = d3.select("#controls");
	
//x-axis
	controls.append("div").attr("class","x-axis-label").text("X Axis")
		.append("select").attr("class","x-axis span3").on("change",update).selectAll("option")
        .data(keyz)
      .enter().append("option")
        .property("selected", function(d, i) { return i == 0; })
        .attr("value", function(d){return d.value;})
        .text(function(d,i) { return keyz[i]; });
//y-axis
	controls.append("div").attr("class","y-axis-label").text("Y Axis")
		.append("select").attr("class","y-axis span3").on("change",update).selectAll("option")
        .data(keyz)
      .enter().append("option")
        .property("selected", function(d, i) { return i == 1; })
        .attr("value", function(d){return d.value;})
        .text(function(d,i) { return keyz[i]; });
//r-axis
	controls.append("div").attr("class","r-axis-label").text("Size")
		.append("select").attr("class","r-axis span3").on("change",update).selectAll("option")
        .data(keyz)
      .enter().append("option")
        .property("selected", function(d, i) { return i ==0; })
        .attr("value", function(d){return d.value;})
        .text(function(d,i) { return keyz[i]; });
//c-axis
	controls.append("div").attr("class","c-axis-label").text("Color")
		.append("select").attr("class","c-axis span3").on("change",update).selectAll("option")
        .data(keyz)
      .enter().append("option")
        .property("selected", function(d, i) { return i == 1; })
        .attr("value", function(d){return d.value;})
        .text(function(d,i) { return keyz[i]; });	
}

source = "iris2.csv";
function init () {
		vis = d3.radikal.quickvis().target("#quickvis");
		
		d3.csv(source, function(data) {
			buildAxisSelectors(d3.keys(data[0]));
			vis.data(data);
		   	vis.label(source);
		});
}

function update(keyz){
	vis.axis("set axes");
	vis.redraw();
}
init();
