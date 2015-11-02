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
  question: "Q44",
};


var width = 960,
	height = 1160;


//Define map projection
var projection = d3.geo.mercator()
	.translate([width/2, 3*height/4])
	.scale([500]);

//Define path generator
var path = d3.geo.path()
	.projection(projection);

//Create SVG element
var g = d3.select("#chart")
  .append("g")

//Load in GeoJSON data
d3.json("./js/europe-map.geo.json", function(json) {
	//Bind data and create one path per GeoJSON feature
	g.selectAll("path")
    .data(json.features)
	  .enter()
	  .append("path")
    .classed("country", true)
	  .attr({
      d: path,
      id: (d) => {
        if (d.properties.country === "United Kingdom") return "UK";
        if (d.properties.country === "Czech Republic") return "CR";
        else return `${d.properties.country}`;
      },
    })
    .on("click", selectCountry);
});

d3.selectAll(".questionButton")
  .on("click", function() {
    GLOBAL.question = d3.select(this).attr("id");
    tabulateData(d3.select(this).attr("id"));
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
  // Visually deselect the current selected country
  if (GLOBAL.selected !== null)
    g.select(`#${GLOBAL.selected.properties.country}`).classed("selected", false);

  // Replace current selection with new selection
  GLOBAL.selected = countryDatum;
  d3.select(this).classed("selected", true);

  // TODO: Display data here
}

function tabulateData(question) {
  const counts = {};
  var maxCount = 0;

  var addOne, takeOne;
  GLOBAL.data.forEach((d) => {
    addOne = d[`${question}A`];
    takeOne = d[`${question}B`];

    if(addOne in counts) counts[addOne]++;
    else counts[addOne] = 1;

    if(takeOne in counts) counts[takeOne]--;
    else counts[takeOne] = -1;

    if (counts[addOne] > maxCount) maxCount = counts[addOne];
    if (counts[takeOne] < -maxCount) maxCount = - counts[takeOne];
  });

  // Clean up anomolies in data
  counts["UK"] = counts["Great Britain/United Kingdom"];
  counts["CR"] = counts["Czech Republic"];
  delete counts["Great Britain/United Kingdom"];
  delete counts["Czech Republic"];
  delete counts["Don't know"]
  delete counts[" "]

  // Establish color scale
  const color = d3.scale.linear()
    .domain([-maxCount, 0, maxCount])
    .range(["red", "white", "green"]);

  // Clear previous styles
  d3.select(".country").style(null);

  // Set new colors
  for (const country in counts) {
    d3.select(`#${country}`)
      .style("fill", color(counts[country]));
  }
}