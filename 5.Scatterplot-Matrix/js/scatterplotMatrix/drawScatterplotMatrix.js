// https://bl.ocks.org/bricedev/0d95074b6d83a77dc3ad

var defaultHtmlSelector = "#scatterplot_matrix";
var defaultWidth = 960;

function findCrossMatrix(firstPropertyList, secondPropertyList) {
	var propertyMatrix = [], n = firstPropertyList.length, m = secondPropertyList.length;
	for (var i = -1; ++i < n;)
		for (var j = -1; ++j < m;)
			propertyMatrix.push({
				x: firstPropertyList[i],
				i: i,
				y: secondPropertyList[j],
				j: j
			});
	return propertyMatrix;
}

function drawScatterplotMatrix(data,
	htmlSelector = defaultHtmlSelector,
	graphWidth = defaultWidth,
	categotyColumnName = "species") {
	$(htmlSelector).empty();
	var padding = 20;
	var width = graphWidth-padding;
	var dataDimention = Object.keys(data[0]).length-1;
	var size = graphWidth/dataDimention; // + padding/Math.max(dataDimention-1, 1);
	var x = d3.scaleLinear()
			.range([padding / 2, size - padding / 2]);

	var y = d3.scaleLinear()
			.range([size - padding / 2, padding / 2]);

	var xAxis = d3.axisBottom()
			.scale(x)
			.ticks(6);

	var yAxis = d3.axisLeft()
			.scale(y)
			.ticks(6);

	var color = d3.scaleOrdinal(d3.schemeCategory10);

	var domainByTrait = {},
		traits = d3.keys(data[0]).filter(function(d) {
			///////////////////////////////////////////////////////////////Updated here for removing country
			return d !== categotyColumnName && d !== 'country' && d !== 'year' && d !== 'phrase';
		}),
		n = traits.length;

	traits.forEach(function(trait) {
		domainByTrait[trait] = d3.extent(data, function(d) { return d[trait]; });
	});

	xAxis.tickSize(size * n);
	yAxis.tickSize(-size * n);

	var brush = d3.brush()
			.on("start", brushstart)
			.on("brush", brushmove)
			.on("end", brushend)
			.extent([[0,0],[size,size]]);

	var svg = d3.select(htmlSelector).append("svg")
			.attr("width", size * n + padding)
			.attr("height", size * n + padding)
		.append("g")
			.attr("transform", "translate(" + padding + "," + padding / 2 + ")");

	svg.selectAll(".x.axis")
			.data(traits)
		.enter().append("g")
			.attr("class", "x axis")
			.attr("transform", function(d, i) {
				return "translate(" + (n - i - 1) * size + ",0)";
			})
			.each(function(d) {
				x.domain(domainByTrait[d]);
				d3.select(this).call(xAxis);
			});

	svg.selectAll(".y.axis")
			.data(traits)
		.enter().append("g")
			.attr("class", "y axis")
			.attr("transform", function(d, i) {
				return "translate(0," + i * size + ")";
			})
			.each(function(d) {
				y.domain(domainByTrait[d]);
				d3.select(this).call(yAxis);
			});

	var cell = svg.selectAll(".cell")
			.data(findCrossMatrix(traits, traits))
		.enter().append("g")
			.attr("class", "cell")
			.attr("transform", function(d) {
				return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")";
			})
			.each(plot);

	// Titles for the diagonal.
	cell.filter(function(d) { return d.i === d.j; }).append("text")
			.attr("x", padding)
			.attr("y", padding)
			.attr("dy", ".71em")
			.text(function(d) {
				return d.x;
			});

	cell.call(brush);

	function plot(p) {
		var cell = d3.select(this);

		x.domain(domainByTrait[p.x]);
		y.domain(domainByTrait[p.y]);

		cell.append("rect")
				.attr("class", "frame")
				.attr("x", padding / 2)
				.attr("y", padding / 2)
				.attr("width", size - padding)
				.attr("height", size - padding);

		cell.selectAll("circle")
				.data(data)
			.enter().append("circle")
				.attr("cx", function(d) { return x(d[p.x]); })
				.attr("cy", function(d) { return y(d[p.y]); })
				.attr("r", 4)
				.style("fill", function(d) {
					return color(d[categotyColumnName]);
				});
	}

	var brushCell;

	// Clear the previously-active brush, if any.
	function brushstart(p) {
		if (brushCell !== this) {
			d3.select(brushCell).call(brush.move, null);
			brushCell = this;
		x.domain(domainByTrait[p.x]);
		y.domain(domainByTrait[p.y]);
		}
	}

	// Highlight the selected circles.
	function brushmove(p) {
		var e = d3.brushSelection(this);
		svg.selectAll("circle").classed("hidden", function(d) {
			return !e
				? false
				: (
					e[0][0] > x(+d[p.x]) || x(+d[p.x]) > e[1][0]
					|| e[0][1] > y(+d[p.y]) || y(+d[p.y]) > e[1][1]
				);
		});
	}

	// If the brush is empty, select all circles.
	function brushend() {
		var e = d3.brushSelection(this);
		if (e === null) svg.selectAll(".hidden").classed("hidden", false);
	}
}

export{drawScatterplotMatrix}