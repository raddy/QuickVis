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

d3.radikal.filter = function(){
	var filter={};
	
	filter.max = 1000;
	filter.min = -1000;
	filter.eq = "NUMERIC_FILTER";
	
	return filter;
}

d3.radikal.quickvis = function (){
		var quickvis = {},
		    data= [],visdata,
		    label= [],
		    target,
		    group,
		    w=760, h=550, //don't hardcore bro
			margin = {top: 20, right: 20, bottom: 60, left: 60},
		    x, y,
			brush,
		    chartW, chartH,
			first_color=1,last_color=9,
			xRange = d3.scale.linear().range([margin.left, w - margin.right]),
			yRange = d3.scale.linear().range([h - margin.top, margin.bottom]),
			rRange,
			cRange = d3.scale.quantize().range(d3.range(8)),
			xAxis = d3.svg.axis().scale(xRange).tickSize(16).tickSubdivide(true),
			yAxis = d3.svg.axis().scale(yRange).tickSize(10).orient("right").tickSubdivide(true),
			dimensions=[],start,end,zoomlevel=1,
		    keys,
			filters=Array();
		
		quickvis.duration=1000;
		quickvis.icicle_on=false;
		//wild~~~ axes~~~ (for u julia)
		quickvis.x_axe = undefined;
		quickvis.y_axe = undefined;
		quickvis.r_axe = undefined;
		quickvis.c_axe = undefined;
		quickvis.small_point=2;
		quickvis.big_point=15;
		
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
			keys.push("constant");
			prepData(data);
			if (this.icicle_on)
				this.icicle();
			else
				target.selectAll("g.level").remove();
			if (this.x_axe == undefined){
				this.x_axe = keys[0];
				this.y_axe = keys[1];
				this.r_axe = (keys.length>=3) ? keys[2] : "constant";
				this.c_axe = (keys.length>=4) ? keys[3] : "constant";
			}
	        //return this.redraw();
	    };
	
		quickvis.filterz = function(gui){	
			if (!arguments.length) return filters;
			var fz = Array();
			var i =0;
			
			d3.keys(data[0]).forEach(function(k){
				fz.push(gui.addFolder(k));
				console.log("whatwhat");
				var philter = new d3.radikal.filter();				
				if (!isNaN(+data[0][k])){
					philter.max = d3.max(data,function(d){ return +d[k];});
					philter.min = d3.min(data,function(d){ return +d[k];});
					filters.push(philter);	
					fz[i].add(filters[i],'max',philter.min,philter.max);
					fz[i].add(filters[i],'min',philter.min,philter.max);
				}
				else{
					philter.eq = "NYI";
					filters.push(philter);
					fz[i].add(filters[i],'eq'); //this is wrong but for now...
				}
				i++;
			});
			console.log(filters);
			return gui;
		}
		
		quickvis.icicle = function(){
			dimensions[0] = data.length;
			dimensions[1] = (data.length/4);
			dimensions[2] = (data.length/8);
			var thus = this;
			target.selectAll("g.level")
				.data(dimensions)
				.enter().append("svg:g")
			    .attr("class", "level")
				.each(function(parentD, parentI){
					
				        d3.select(this)
				            .selectAll("rect.member")
				            .data(function(d, i){
								return d3.range(data.length/d);})
				            .enter().append("svg:rect")
				            .attr("class", "member")
				            .attr("width", function(){return ~~(parentD/data.length*w)})
				            .attr("height", function(){return~~(h/dimensions.length)})
				            .attr("x", function(d, i){return ~~(i*parentD/data.length*w)+x})
				            .attr("y", ~~(parentI*h/dimensions.length))
				            .attr("fill", "#262626")
				            .attr("stroke", "#eee")
							.attr("opacity",.10)
				            .on("mouseover", function(d, i){
				                var thisRect = d3.select(this);
				                d3.select("svg")
				                    .append("svg:rect")
				                    .attr("class", "zone")
				                    .attr("fill", "#eee8d5")
				                    .attr("x", thisRect.attr("x"))
				                    .attr("y", 0)
				                    .attr("width", thisRect.attr("width"))
				                    .attr("height", h)
				                    .attr("opacity", 0.05)
				                    .attr("pointer-events", "none");
				            })
				            .on("mouseout", function(d, i){
				                d3.selectAll("rect.zone")
				                    .remove();
				            })
				            .on("mousedown", function(d, i){
				                thus.rescale(i, parentI);
				            });
				    });
		}
	
		//deprecated -- use DAT.GUI instead
		/*quickvis.axis = function(d) {
			if (!arguments.length)
				//I'm aware that these are currently all identical...they don't know need to be (room for cleverness here)
				return (keys.length >= 4) ?
					{
						xAxis: keys[this.x_axe],
						yAxis: keys[this.y_axe],
						radiusAxis: keys[this.r_axe],
						colorAxis: keys[this.c_axe]
					} :
				(keys.length == 3) ?
					{
						xAxis: keys[this.x_axe],
						yAxis: keys[this.y_axe],
						radiusAxis: keys[this.r_axe],
						colorAxis: keys[this.c_axe]
					} :
					{
						xAxis: keys[this.x_axe],
						yAxis: keys[this.y_axe],
						radiusAxis: keys[this.r_axe],
						colorAxis: keys[this.c_axe]
					};
			else{
				this.x_axe = +d3.select(".x-axis").property("selectedIndex");
				this.y_axe = +d3.select(".y-axis").property("selectedIndex");
				this.r_axe = +d3.select(".r-axis").property("selectedIndex");
				this.c_axe = +d3.select(".c-axis").property("selectedIndex");
			}
		}*/
	
		quickvis.keys = function(){
			return keys;
		};
		
		quickvis.start = function(){
			return start;
		};
		
		quickvis.end = function(){
			return end;
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
		
		quickvis.applyFilters = function(){
			var dat = Array();
			
			for (var j=0;j<visdata.length;j++){
				var flag = true;
				for (var i=0;i<filters.length;i++){
					if (filters[i].eq == "NUMERIC_FILTER"){
						console.log(+visdata[j][keys[i]],filters[i].min,+visdata[j][keys[i]],filters[i].max);
						if ((+visdata[j][keys[i]]<filters[i].min)||(+visdata[j][keys[i]]>filters[i].max))
							flag = false;
					}
				}
				if (flag)
					dat.push(visdata[j]);
			}
			visdata= dat;
			return visdata;
		}
		
		quickvis.visdata = function(xaxe){
			console.log(start,end);
			if ((start==undefined)||(end==undefined))
				visdata = data;
			else{
				visdata = Array();
				for (var i=0;i<data.length;i++){
					if ((data[i][xaxe]>start)&&(data[i][xaxe]<end))
						visdata.push(data[i]);
				}
			}
			return visdata;
		}
		
		quickvis.redraw = function(){

			var data_points = target.selectAll("circle").data(this.applyFilters(this.visdata(this.x_axe)));
			//Always need at least X and Y (no histograms or ts yet NERD)
			var thus = this;
			xRange.domain([
				d3.min(visdata, function (d) { 
					return (+d[thus.x_axe]); }),
				d3.max(visdata, function (d) { 
					return +d[thus.x_axe]; })
			]);
			yRange.domain([
				d3.min(visdata, function (d) { return +d[thus.y_axe]; }),
				d3.max(visdata, function (d) { return +d[thus.y_axe]; })
			]);

			//3rd dimension is SIZE (twss)
			rRange=d3.scale.linear().range([this.small_point, this.big_point]);
			if (this.r_axe!="constant"){
				rRange.domain([
					d3.min(data, function (d) { return +d[thus.r_axe]; }),
					d3.max(data, function (d) { return +d[thus.r_axe]; })
				]);
			}

			//4th dimension is color (twss?)
			if (this.c_axe!="constant"){
				cRange.domain([
					d3.min(data, function (d) { return +d[thus.c_axe]; }),
					d3.max(data, function (d) { return +d[thus.c_axe]; })
				]);
			}
			var tranny = target.transition().duration(this.duration).ease("exp-in-out");
		    tranny.select(".x.axis").call(xAxis);
		    tranny.select(".y.axis").call(yAxis);
			
			data_points.enter()
				.insert("svg:circle")
					.attr("cx", function (d) { return xRange (d[thus.x_axe]); })
					.attr("cy", function (d) { return yRange (d[thus.y_axe]); })
					.style("opacity", 0)
					.style("fill", function (d) { return (thus.c_axe!="constant") ? colours[cRange(d[thus.c_axe])] : "FFF7FB" ; });
					
			
			data_points.transition().duration(this.duration).ease("exp-in-out")
				.style("opacity", .65)
				.style("fill", function (d) {
					return (this.c_axe!="constant") ? colours[cRange(d[thus.c_axe])] : "FFF7FB" ; })
				.attr("r", function(d) { return (thus.r_axe!="constant") ? rRange (d[thus.r_axe])*zoomlevel : 2*zoomlevel; })
				.attr("cx", function (d) { return xRange (d[thus.x_axe]); })
				.attr("cy", function (d) { return yRange (d[thus.y_axe]); });
				
			data_points.exit()
					.transition().duration(this.duration).ease("exp-in-out")
						.attr("cx", function (d) { return xRange (d[thus.x_axe]); })
						.attr("cy", function (d) { return yRange (d[thus.y_axe]); })
						.style("opacity", 0)
						.attr("r", 0)
				.remove();
			
		};
		
		quickvis.rescale = function(c, r) {
			var thus = this;
			if (r==1){
				xRange.domain([
					d3.min(data, function (d) { 
						return (+d[thus.x_axe]); }),
					d3.max(data, function (d) { 
						return +d[thus.x_axe]; })
				]);
				var dom = xRange.domain();
				start = dom[0]+(dom[1]-dom[0])*c/4;
				end = start + (dom[1]-dom[0])/4;
				zoomlevel=2;
				console.log(start,end);
			}
			else if (r==2){
				xRange.domain([
					d3.min(data, function (d) { 
						return (+d[thus.x_axe]); }),
					d3.max(data, function (d) { 
						return +d[thus.x_axe]; })
				]);
				var dom = xRange.domain();
				start = dom[0]+(dom[1]-dom[0])*c/8;
				end = start + (dom[1]-dom[0])/8;
				zoomlevel=3;
			}
			else{
				start = undefined;
				end = undefined;
				zoomlevel=1;
			}

			this.redraw();
		}
		
		function prepData(dat){
			return data;
		}
		
		return quickvis;
};



function buildAxisSelectors(keyz){
	controls = d3.select("#controls");
	
//x-axis
	controls.append("div").attr("class","x-axis-label").text("X Axis")
		.append("select").attr("class","x-axis span3").on("change",updateQuick).selectAll("option")
        .data(keyz)
      .enter().append("option")
        .property("selected", function(d, i) { return i == 0; })
        .attr("value", function(d){return d.value;})
        .text(function(d,i) { return keyz[i]; });
//y-axis
	controls.append("div").attr("class","y-axis-label").text("Y Axis")
		.append("select").attr("class","y-axis span3").on("change",updateQuick).selectAll("option")
        .data(keyz)
      .enter().append("option")
        .property("selected", function(d, i) { return i == 1; })
        .attr("value", function(d){return d.value;})
        .text(function(d,i) { return keyz[i]; });

	keyz.push("constant");
	
//r-axis
	controls.append("div").attr("class","r-axis-label").text("Size")
		.append("select").attr("class","r-axis span3").on("change",updateQuick).selectAll("option")
        .data(keyz)
      .enter().append("option")
        .property("selected", function(d, i) { return i ==0; })
        .attr("value", function(d){return d.value;})
        .text(function(d,i) { return keyz[i]; });
//c-axis
	controls.append("div").attr("class","c-axis-label").text("Color")
		.append("select").attr("class","c-axis span3").on("change",updateQuick).selectAll("option")
        .data(keyz)
      .enter().append("option")
        .property("selected", function(d, i) { return i == 1; })
        .attr("value", function(d){return d.value;})
        .text(function(d,i) { return keyz[i]; });	
}





function buildFilterPanel(gui,r1){
	var f = Array();	
	var fz = Array();
	var i =0;
	d3.keys(r1).forEach(function(k){
		fz.push(gui.addFolder(k));
		f.push(d3.radikal.filter());
		if (!isNaN(+r1[k])){	
			fz[i].add(f[i],'max');
			fz[i].add(f[i],'min');
		}
		else{
			fz[i].add(f[i],'eq'); //this is wrong but for now...
		}
		i++;
	});
	return f;
}

source = "iris.csv";
function init () {
		/*vis = d3.radikal.bigscatter().target("#quickvis");
		d3.csv(source,function(data){
			vis.init();
			vis.data(data);
			vis.redraw();
		});
		
		
		/*vis = d3.radikal.scattervis().target("#quickvis");
		d3.csv(source,function(data){
			buildColumnSelectorsScatter(d3.keys(data[0]));	
			vis.data(data);
			vis.redraw();
		});*/
		vis = d3.radikal.quickvis().target("#quickvis");
		var gui = new dat.GUI();
		//var filter_gui = new dat.GUI();
		var fx = gui.addFolder("FX");
		fx.add(vis,'duration');
		fx.add(vis,'small_point',1,5);
		fx.add(vis,'big_point',1,40);
		var icicle_handler = gui.add(vis,'icicle_on');
		var axiss = gui.addFolder("Axes");
		gui.add(vis,'redraw');
		if (new RegExp(".csv"+"$").test(source)){
			d3.csv(source, function(data) {
				//buildAxisSelectors(d3.keys(data[0]));

				vis.data(data);
				var filter_gui = vis.filterz(new dat.GUI());
			   	vis.label(source);
				
				var xhandler = axiss.add(vis,'x_axe',vis.keys());
				var yhandler = axiss.add(vis,'y_axe',vis.keys());
				var rhandler = axiss.add(vis,'r_axe',vis.keys());
				var chandler = axiss.add(vis,'c_axe',vis.keys());
				
				vis.redraw();
				icicle_handler.onChange(function(val) {
				  vis.data(data);
				  vis.redraw();
				});
				xhandler.onChange(function(val){
					vis.data(data);
					vis.redraw();
				});
				yhandler.onChange(function(val){
					vis.data(data);
					vis.redraw();
				});
				rhandler.onChange(function(val){
					vis.data(data);
					vis.redraw();
				});
				chandler.onChange(function(val){
					vis.data(data);
					vis.redraw();
				});
				axiss.open();
			});
		}
		else if (new RegExp(".json"+"$").test(source)){
			d3.json(source, function(data) {
				buildAxisSelectors(d3.keys(data[0]));
				vis.data(data);
			   	vis.label(source);
			});
		}
}



function updateQuick(keyz){
	vis.axis("set axes");
	vis.redraw();
}
init();
