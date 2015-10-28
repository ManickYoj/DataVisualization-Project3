/**
 *  visualizer.js
 *  -------------
 *  
 *  The javascript (es6, transpiled to es5 by babel) which
 *  creates the visualization.
 */

console.log("hello world")

var width = 960,
  height = 1160;

// var svg = d3.select("body").append("svg")
//   .attr("width", width)
//   .attr("height", height);

// d3.json("./js/europe-map.geo.json", function(error, europe) {
//   if (error) return console.error(error);
  
//   // svg.append("path")
//   //     .datum(topojson.feature(europe, europe.geometry.coordinates))
//   //     .attr("d", d3.geo.path().projection(d3.geo.mercator()));
// });

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