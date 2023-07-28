var income = 100;
var maxDebt = 50;
var financial = 10;
var real = 5;
var realState = 30;
var available = 5;

var margin = 20,
	padding = 2,
	diameter = 960,
	root = flareData();

var color = d3.scale
	.linear()
	.domain([0, depthCount(root)])
	.range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
	.interpolate(d3.interpolateHcl);

var pack = d3.layout
	.pack()
	.padding(padding)
	.size([diameter - margin, diameter - margin])
	.value(function (d) {
		return d.size;
	});

var svg = d3
	.select("body")
	.append("svg")
	.attr("width", diameter)
	.attr("height", diameter)
	.append("g")
	.attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

var focus = root,
	nodes = pack.nodes(root),
	view;

var circle = svg
	.selectAll("circle")
	.data(nodes)
	.enter()
	.append("circle")
	.attr("class", function (d) {
		return d.parent
			? d.children
				? "node"
				: "node node--leaf"
			: "node node--root";
	})
	.style("fill", function (d) {
		//return d.children ? color(d.depth) : null;
		return d.name ? color(d.depth) : color(d.depth - 1);
	})
	.on("click", function (d) {
		if (focus !== d) zoom(d), d3.event.stopPropagation();
	});

var text = svg
	.selectAll("text")
	.data(nodes)
	.enter()
	.append("text")
	.attr("class", "label")
	.style("fill-opacity", function (d) {
		return d.parent === root ? 1 : 0;
	})
	.style("display", function (d) {
		return d.parent === root ? null : "none";
	})
	.text(function (d) {
		return d.name + d.size;
	});

var node = svg.selectAll("circle,text");

d3.select("body").on("click", function () {
	zoom(root);
});

zoomTo([root.x, root.y, root.r * 2 + margin]);

function zoom(d) {
	var focus0 = focus;
	focus = d;

	var transition = d3
		.transition()
		.duration(d3.event.altKey ? 7500 : 750)
		.tween("zoom", function (d) {
			var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
			return function (t) {
				zoomTo(i(t));
			};
		});

	transition
		.selectAll("text")
		.filter(function (d) {
			return d.parent === focus || this.style.display === "inline";
		})
		.style("fill-opacity", function (d) {
			return d.parent === focus ? 1 : 0;
		})
		.each("start", function (d) {
			if (d.parent === focus) this.style.display = "inline";
		})
		.each("end", function (d) {
			if (d.parent !== focus) this.style.display = "none";
		});
}

function zoomTo(v) {
	var k = diameter / v[2];
	view = v;
	node.attr("transform", function (d) {
		return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
	});
	circle.attr("r", function (d) {
		return d.r * k;
	});
}

/**
 * Counts JSON graph depth
 * @param {object} branch
 * @return {Number} object graph depth
 */
function depthCount(branch) {
	if (!branch.children) {
		return 1;
	}
	return 1 + d3.max(branch.children.map(depthCount));
}

d3.select(self.frameElement).style("height", diameter + "px");

/*********************************************************************/

function flareData() {
	return {
		name: "Income",
		children: [
			{
				name: "Max Debt",
				children: [
					{
						name: "Sector Financiero",
						size: financial
					},
					{
						name: "Sector Real",
						size: real
					},
					{
						name: "Inmobiliario",
						size: realState
					},
					{
						name: "Disponible",
						size: available
					}
				],
                size: maxDebt
			},
			{
				size: income - (financial + real + realState + available)
			}
		]
	};
}
