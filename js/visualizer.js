/**
 *  visualizer.js
 *  -------------
 *  
 *  The javascript (es6, transpiled to es5 by babel) which
 *  creates the visualization.
 */


var GLOBAL = { data: []
			 }


var width = 960,
	height = 1160;


 //Define map projection
var projection = d3.geo.mercator()
	.translate([width/2, height/2])
	.scale([500]);

//Define path generator
var path = d3.geo.path()
	.projection(projection);

//Create SVG element
var svg = d3.select("body")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

//Load in GeoJSON data
d3.json("./js/europe-map.geo.json", function(json) {
	//Bind data and create one path per GeoJSON feature
	svg.selectAll("path")
	 .data(json.features)
	 .enter()
	 .append("path")
	 .attr("d", path)
	 .style("fill", "steelblue");
});

getDataRows(function(data) {
	GLOBAL.data = data;
	console.log(data);
});

var singlecountryvis = d3.select("body")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

setupSingleCountry(singlecountryvis,"Greece", "Trustworthy");
/* Create the single country visualization based on the
demographic data of all the respondents
*/
function setupSingleCountry (svg,country,metric){
	//do the thing here!
}

/*Get the data rows from the csv file. If chrome complains,
rember to start the server.*/
function getDataRows (f) {
    d3.csv("./js/survey-data.csv",
	   function(error,data) {
	       f(data);
	   });
}
