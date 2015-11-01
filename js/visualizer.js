/**
 *  visualizer.js
 *  -------------
 *  
 *  The javascript (es6, transpiled to es5 by babel) which
 *  creates the visualization.
 */


var GLOBAL = {
  data: [],
  selected: null,
};


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
    .classed("country", true)
	  .attr({
      d: path,
      id: (d) => `country${d.id}`,
    })
    .on("click", selectCountry);
});

getDataRows(function(data) {
	GLOBAL.data = data;
});

/*Get the data rows from the csv file. If chrome complains,
rember to start the server.*/
function getDataRows (f) {
    d3.csv("./js/survey-data.csv",
	   function(error,data) {
	       f(data);
	   });
}

function selectCountry (countryDatum) {
  if (GLOBAL.selected !== null)
    svg.select(`#country${GLOBAL.selected.id}`).classed("selected", false);

  GLOBAL.selected = countryDatum;
  svg.select(`#country${countryDatum.id}`).classed("selected", true);

  // TODO: Display data here
}