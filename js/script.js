var message = d3.select("#message");
var width = 500, height = 250;
var svg = d3.select("#graph")
			.append("svg")
			.attr({ width: width,
					height: height
			});
var force = d3.layout.force()
				.size([width, height]);
var draw_button = d3.select("#show_button");

function hello() {
	fetch("/api/biograph/?hello")
		.then(response => response.json())
		.then(data => {
						document.getElementById("fio").value = data[0].fio;
						d3.json("/api/biograph/?d=" + data[0].fio, draw)
			});
}

function get_fio(str) {
	var target = d3.select("#show_fio");

	var list = target.select("ul");
	
	if (str.length <= 4 || str == "Введите ФИО") {
		target.classed("hidden", true);
	} else if (str.length > 4) {
		d3.json("/api/biograph/?fio=" + str,
			function(data) {
				if (data.length == 0) {
					target.classed("hidden", true);
					message.text("Личность не установлена.");
				} else {
					target.classed("hidden", false);
					message.text("");				
					var list_items = list.selectAll("li")
											.data(data);
					list_items.enter()
						.append("li");
					list_items.text(function(d) { return d.fio ; });
					
					target.selectAll("li")
						.on("click", function() {
							var fio_text = d3.select(this).text();
							var fio_field = d3.select("#fio");
							fio_field.node().value = fio_text;
							fio_field.node().defaultValue = fio_text;
							target.classed("hidden", true);
						});
					list_items.exit()
						.remove();
			}
		});
	}
}


function draw(error, data) {
	fio_selected = d3.select("#fio").node().value;
	if (error) {
		throw error;
	}
	var image = d3.select("#person").selectAll("img")
			.data(data.name);
	image.enter()
		.append("img");
	image.attr("src", function(d) { return d.photo != null ? "img/" + d.photo : "img/noimage.png"; });
	image.exit()
		.remove()
	var position = d3.select("#person")
		.selectAll("p")
		.data(data.name);
	position.enter()
		.append("p");
	position.text(function(d) { return d.position; });
	position.exit()
			.remove();
	links = data.graph;
	

var nodesByName = {};

links.forEach(function(link) {
		link.source = nodeByName(link.source);
		link.target = nodeByName(link.target);
	});

	var nodes = d3.values(nodesByName);

	var link = svg.selectAll(".link")
				.data(links);
		link.enter()
				.append("line")
				.attr("class", "link");
		link.exit().remove();

	var node = svg.selectAll(".node")
				.data(nodes);
	node.enter()
		.append("circle")
		.attr("class", "node")
		.attr("r", 5)
		.call(force.drag);
		
	node
	.attr("fill", function(d) { if (d.name == fio_selected) { return "#E96A64"; } else {return "#2A2F4E"} })
	.on("mouseover", function(d) {
                    var x_pos = d3.event.pageX + 5 + "px";
                    var y_pos = d3.event.pageY + 5 + "px";
                    d3.select("#tooltip")
                      .style("left", x_pos)
                      .style("top", y_pos)
                      .classed("hidden", false)
					.select("#fio_title")
                      .text(d.name);
            })
	.on("mouseout", function(d) {
                      d3.select("#tooltip")
                        .classed("hidden", true)
                      });
	node.exit()
		.remove();

// Этот код расставляет индексы, веса, х/у координаты и т.д. в загружаемых данных.
	force.nodes(nodes)
		.links(links)
		.linkDistance(function(d) { return d.source.weight * 2.4; })
		.on("tick", tick)
		.start();

	function tick() {
		link.attr("x1", function(d) { return d.source.x; })
	        .attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

    	node.attr("cx", function(d) { return d.x; })
		    .attr("cy", function(d) { return d.y; });
	}
	function nodeByName(name) {
	    return nodesByName[name] || (nodesByName[name] = {name: name});
		  }
	var sovety_list = d3.select("#struktury ul")
		.selectAll("li")
		.data(data.name[0].sovety);
	sovety_list.enter()
		.append("li");
	sovety_list.text(function(d) { return d; });
	sovety_list.exit()
		.remove();

}

// Поле ввода ФИО

var fioField = d3.select("#fio");
fioField.on("focus", function() {
        //if (this.value == "Введите ФИО") {
            this.value = "";
        //}
    })
    .on("blur", function() {
        if (this.value == "") {
            this.value = "Введите ФИО";
        }
   });

draw_button.on("click", function() {
	d3.select("#show_fio").classed("hidden", true);
	d3.json("/api/biograph/?d=" + fioField.node().value, draw);
	});

hello();
