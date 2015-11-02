/**
 *  visualizer.js
 *  -------------
 *  
 *  The javascript (es6, transpiled to es5 by babel) which
 *  creates the visualization.
 */


var GLOBAL = { data: [],
	countries = [],
	demographicLabels = ["Nationality", "Gender", "Age"],
	demographicIDs = ["COUNTRY", "Q164", "Q165"],
	opinionLabels = [],
	opinionIDs = []
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

initializeSingleCountry(singlecountryvis,"Greece", "Trustworthy");
/* Create the single country visualization based on the
demographic data of all the respondents
*/
function initializeSingleCountry (svg,country,metric){
	var svg = d3.select(svg);
	var s = computeSizes(svg);
	var barWidth = s.chartWidth/(2*GLOBAL.demographicIDs.length-1);


}

function computeSizes (svg) { 
  // get the size of the SVG element
  var height = svg.attr("height");
  var width = svg.attr("width");
  var margin = 100;

  // the chart lives in the svg surrounded by a margin of 100px

  return {height:height,
    width: width,
    margin: margin,
    chartHeight: height-2*margin,
    chartWidth: width-2*margin}
} 

/*Get the data rows from the csv file. If chrome complains,
rember to start the server.*/
function getDataRows (f) {
    d3.csv("./js/survey-data.csv",
	   function(error,data) {
	       f(data);
	   });
}
