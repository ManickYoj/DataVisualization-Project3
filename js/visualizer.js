/**
 *  visualizer.js
 *  -------------
 *  
 *  The javascript (es6, transpiled to es5 by babel) which
 *  creates the visualization.
 */


var GLOBAL = {
  data: [],
  selected: [],
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
    .on("click", function (d) {
      const elem = d3.select(this);
      const ind = GLOBAL.selected.indexOf(elem.attr("id"));

      if (ind !== -1) {
        GLOBAL.selected = GLOBAL.selected.filter((e) => e !== elem.attr("id"));
        elem.classed('selected', false);
      } else {
        GLOBAL.selected.push(elem.attr("id"));
        elem.classed('selected', true);
      }

      // Recalculate totals
      tabulateData(GLOBAL.question);
    });
});

d3.selectAll(".questionButton")
  .on("click", function() {
    // Clear any current button selection
    d3.selectAll(".questionButton").classed("selected", false);

    // Select the clicked button
    const elem = d3.select(this);
    elem.classed("selected", true);
    GLOBAL.question = elem.attr("id");
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

function tabulateData(question) {
  const counts = {};
  var maxCount = 0;

  var addOne, takeOne;
  GLOBAL.data.forEach((d) => {
    if (GLOBAL.selected.indexOf(d.COUNTRY) !== -1) {

      addOne = d[`${question}A`];
      takeOne = d[`${question}B`];

      if(addOne in counts) counts[addOne]++;
      else counts[addOne] = 1;

      if(takeOne in counts) counts[takeOne]--;
      else counts[takeOne] = -1;

      if (counts[addOne] > maxCount) maxCount = counts[addOne];
      if (counts[takeOne] < -maxCount) maxCount = - counts[takeOne];
    }
  });

  // Clean up anomolies in data
  if ("Great Britain/United Kingdom" in counts) {
    counts["UK"] = counts["Great Britain/United Kingdom"];
    delete counts["Great Britain/United Kingdom"];
  }

  if ("Czech Republic" in counts) {
    counts["CR"] = counts["Czech Republic"];
    delete counts["Czech Republic"];
  }

  if ("Don't know" in counts) delete counts["Don't know"];
  if (" " in counts ) delete counts[" "];

  // Establish color scale
  const color = d3.scale.linear()
    .domain([-maxCount, 0, maxCount])
    .range(["red", "white", "green"]);

  // Clear previous styles
  d3.selectAll(".country").style("fill", null);

  // Set new colors
  for (const country in counts) {
    d3.select(`#${country}`)
      .style("fill", color(counts[country]));
  }
}