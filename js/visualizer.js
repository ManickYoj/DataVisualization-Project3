/**
 *  visualizer.js
 *  -------------
 *  
 *  The javascript (es6, transpiled to es5 by babel) which
 *  creates the visualization.
 */

const GLOBAL = {
  data: [],
	segments: ["Nationality", "Gender", "Age"],
  selected: [],
  question: "Q44",
  currentsegment: "Trustworthiness",
};

const countryCounts = {

};

const width = 960,
	height = 1160;

//Define map projection
const projection = d3.geo.mercator()
	.translate([width/2, 3*height/4])
	.scale([500]);

//Define path generator
const path = d3.geo.path()
	.projection(projection);

//Create SVG element
const g = d3.select("#chart")
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
      id: d => countryNameMap(d.properties.country),
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
      updateSingleCountry();
      tabulateData(GLOBAL.question);
    });
});

const opinionQuestions = {
	"Q44": "Trustworthiness",
  "Q45": "Arrogance",
  "Q46": "Compassion"
};

d3.selectAll(".questionButton")
  .on("click", function() {
    // Clear any current button selection
    d3.selectAll(".questionButton").classed("selected", false);

    // Select the clicked button
    const elem = d3.select(this);
    elem.classed("selected", true);
    GLOBAL.question = elem.attr("id");
    GLOBAL.currentsegment = opinionQuestions[elem.attr("id")];

    // Update visualizations
    updateSingleCountry();
    tabulateData(elem.attr("id"));
  });

getDataRows(function(data) {
	GLOBAL.data = data;

  // data.forEach((d) => {
  //   countryNameMap(d.COUNTRY);
  //   countryCounts
  // });

	setupSingleCountry("Germany","Trustworthiness");
});

/* Create the single country visualization based on the
demographic data of all the respondents
*/
function setupSingleCountry (country, metric){
	var svg = d3.select("#singleCountry")
	var s = computeSizes(svg);
	var barWidth = s.chartWidth/(2*GLOBAL.segments.length-1);

	svg.append("text")
		.attr("id","title")
		.attr("x",s.width/2)
	 	.attr("y",s.margin/3)
		.attr("dy","0.3em")
		.style("text-anchor","middle");

	svg.append("line")
		.attr("x1", s.margin)
    .attr("y1", s.margin + s.chartHeight/2)
    .attr("x2", s.margin + s.chartWidth)
    .attr("y2", s.margin + s.chartHeight/2)
    .attr("stroke-width", 2)
    .attr("stroke", "black");

	var sel = svg.selectAll("g")
		.data(GLOBAL.segments)
		.enter().append("g")
		.attr("class", function(d){return d;})
		.attr("transform",
	      function(d,i) { return "translate("+(s.margin+(i*2)*barWidth)+",0)"; });

	sel.append("text")
		.attr("class", "label")
		.attr("x", 0+barWidth/2)
		.attr("y", 2*s.margin/3)
		.attr("dy","0.3em")
		.style("text-anchor","middle")
		.text(function(d){return d;});

	var counts = [{},{},{}];
	var poscounts = [{},{},{}];
	var negcounts = [{},{},{}];

	var totalpos = 0;
	var totalneg = 0;


	svg.select("#title")
		.text(" ");
	//Add a caption
	svg.append("text")
		.attr("id", "caption")
		.attr("x", s.chartWidth/2 + s.margin)
		.attr("y", s.chartHeight + 1.5*s.margin)
		.attr("dy","0.3em")
		.style("text-anchor","middle")
		.attr("font-size", "10px")
		.text("A visualization of demographic breakdown by nationality, gender, and age of people who thought that a country was the most (green) or least(red) (category).");

	GLOBAL.segments.forEach((seg,i) => {
		counts = countSplitsForCountry(GLOBAL.data, country, metric, seg);

		poscounts[i] = counts.poscounts;
		negcounts[i] = counts.negcounts;

		totalpos = counts.allpos;
		totalneg = counts.allneg;
	});


  const sortAndCumulate = (c, i) => {
    const d = d3.entries(c);
    d.sort((a, b) => d3.ascending(a.key, b.key));
    cumulate(d);
    return d;
  }

  poscounts = poscounts.map(sortAndCumulate);
  negcounts = negcounts.map(sortAndCumulate);


	const posColorsRng = [
    "#ECF9EC", "#D4F1D4", "#BDE9BD", "#A6E1A6",
    "#8ED98E", "#77D277", "#60CA60", "#48C248",
  ];

	const posColors = {
		"Britain": posColorsRng[0],
		"Czech Republic": posColorsRng[1],
		"France": posColorsRng[2],
		"Germany": posColorsRng[3],
		"Greece": posColorsRng[4],
		"Italy": posColorsRng[5],
		"Poland": posColorsRng[6],
		"Spain": posColorsRng[7],

		"Female": posColorsRng[0],
		"Male": posColorsRng[7],

		"18-29": posColorsRng[0],
		"30-49": posColorsRng[2],
		"50-64": posColorsRng[4],
		"65+": posColorsRng[6],
	};

	const negColorsRng = [
    "#FFE5E5", "#FFCCCC", "#FFB3B3", "#FF9999",
    "#FF8080", "#FF6666", "#FF4D4D", "#FF3333",
  ];
	
	const negColors = {
		"Britain": negColorsRng[0],
		"Czech Republic": negColorsRng[1],
		"France": negColorsRng[2],
		"Germany": negColorsRng[3],
		"Greece": negColorsRng[4],
		"Italy": negColorsRng[5],
		"Poland": negColorsRng[6],
		"Spain": negColorsRng[7],

		"Female": negColorsRng[0],
		"Male": negColorsRng[7],

		"18-29": negColorsRng[0],
		"30-49": negColorsRng[2],
		"50-64": negColorsRng[4],
		"65+": negColorsRng[6],
	};

	var possel = sel
		.data(poscounts)
		.append("g")
		.attr("class", "pos");

	var posbars = possel.selectAll(".bar")
		.data(d => d);

	posbars.enter().append("rect")
		.attr("class","bar")
		.style("fill", d => posColors[d.key])
		.style("stroke", "black")
		.attr("x", 0)
		.attr("y", s.margin+s.chartHeight/2)
		.attr("height", 0)
		.attr("width",barWidth)
		.on("mouseover",function(d,i) { 
	    this.style.fill = "#772310"; 
	    var bar = d3.select(this);
	    var parentGroup = d3.select(this.parentNode.parentNode);
	    showToolTip(parentGroup,
	    +bar.attr("x")+bar.attr("width")/2,
			+bar.attr("y")-TOOLTIP.height/2-5,
			d.key,
			d.value);
	    // dirty hack!
	    d3.selectAll(".tooltip")
		.attr("transform",
		  d3.select(this.parentNode).attr("transform"));
  	})
  	.on("mouseout",function(d, i) { 
  	    this.style.fill = posColors[d.key]; 
  	    hideToolTip();
  	});
	
	const negsel = sel
		.data(negcounts)
		.append("g")
		.attr("class", "neg");

	const negbars = negsel.selectAll(".bar")
		.data(d => d);

	negbars.enter().append("rect")
		.attr("class","bar")
		.style("fill",function (d) {return negColors[d.key];})
		.style("stroke", "black")
		.attr("x", 0)
		.attr("y", s.margin+s.chartHeight/2)
		.attr("height",0)
		.attr("width",barWidth).on("mouseover",function(d,i) { 
	    this.style.fill = "#772310"; 
	    var bar = d3.select(this);
	    var parentGroup = d3.select(this.parentNode.parentNode);
	    showToolTip(parentGroup,
	    +bar.attr("x")+bar.attr("width")/2,
			+bar.attr("y")-TOOLTIP.height/2-5,
			d.key,
			d.value);
	    // dirty hack!
	    d3.selectAll(".tooltip")
		.attr("transform",
		      d3.select(this.parentNode).attr("transform"));
	})
	.on("mouseout",function(d,i) { 
	    this.style.fill = negColors[d.key]; 
	    hideToolTip();
	});
}

function updateSingleCountry () {
  
  const svg = d3.select("#singleCountry")
	const s = computeSizes(svg);

  if (GLOBAL.currentsegment === null) return;
  if (GLOBAL.selected.length === 0) {
  	const bars = svg.selectAll(".bar");
  	bars.attr("y", s.margin+s.chartHeight/2)
  		.attr("height", 0);
  };

  const country = GLOBAL.selected[GLOBAL.selected.length-1]
  const metric = GLOBAL.currentsegment

	var counts = [{},{},{}];
	var poscounts = [{},{},{}];
	var negcounts = [{},{},{}];

	var totalpos = 0;
	var totalneg = 0;

	svg.select("#title")
		.text(country + ": " + metric);

	svg.select("#caption")
		.text("A visualization of demographic breakdown by nationality, gender, and age of people who thought that " + country + " was the highest (green) or lowest (red) in " + metric + ".");

	GLOBAL.segments.forEach(function(seg,i){
		counts = countSplitsForCountry(GLOBAL.data, country, metric, seg);
		poscounts[i] = counts.poscounts;
		negcounts[i] = counts.negcounts;
		totalpos = counts.allpos;
		totalneg = counts.allneg;
	});

	var highestcount = totalpos > totalneg ? totalpos : totalneg;

	var yPosPos = d3.scale.linear() 
		.domain([0,highestcount])
		.range([s.margin+(s.chartHeight/2),s.margin]);

	var yPosNeg = d3.scale.linear() 
		.domain([0,highestcount])
		.range([s.margin+(s.chartHeight/2),s.height-s.margin]);

	var height = d3.scale.linear() 
		.domain([0,highestcount])
		.range([0,s.chartHeight/2]);

	poscounts.forEach(function(c,i) { 
		// first convert to an array of entries
		var d = d3.entries(c);  
	  // sort them
		d.sort(function(a,b) { return d3.ascending(a.key,b.key); });
		// then cumulate them
		cumulate(d);
		poscounts[i] = d;
	});

	negcounts.forEach(function(c,i) { 
		// first convert to an array of entries
		var d = d3.entries(c);  
	  // sort them
		d.sort(function(a,b) { return d3.ascending(a.key,b.key); });
		// then cumulate them
		cumulate(d);
		negcounts[i] = d;
	});

	var possel = svg.selectAll(".pos")
		.data(poscounts);

	var posbars = possel.selectAll(".bar")
		.data(d => d);

	posbars.transition()
    .duration(2000)
		.attr({
      y: d => d.value === undefined ? 0 : yPosPos(d.cumulative + d.value),
      height: d => d.value === undefined ? 0 : height(d.value),
    });

	var negsel = svg.selectAll(".neg")
		.data(negcounts);

	var negbars = negsel.selectAll(".bar")
		.data(d => d);

	negbars
		.transition()
    .duration(2000)
		.attr({
      y: d => yPosNeg(d.cumulative),
		  height: d => height(d.value === undefined ? 0 : d.value),
    });
}

function countSplitsForCountry (data, country, metric, segment) { 
  var poscounts = {}
  var negcounts = {}
 //Handle the britain Edge Case
  country = country === "UK" ? "Great Britain/United Kingdom" : country; 
//Initialize these to 0, so that we can transition all the elements
	if (segment === "Nationality"){
		poscounts["Great Britain/United Kingdom"] = 0;
		poscounts["Czech Republic"] = 0;
		poscounts["France"] = 0;
		poscounts["Germany"] = 0;
		poscounts["Greece"] = 0;
		poscounts["Italy"] = 0;
		poscounts["Poland"] = 0;
		poscounts["Spain"] = 0;
		negcounts["Great Britain/United Kingdom"] = 0;
		negcounts["Czech Republic"] = 0;
		negcounts["France"] = 0;
		negcounts["Germany"] = 0;
		negcounts["Greece"] = 0;
		negcounts["Italy"] = 0;
		negcounts["Poland"] = 0;
		negcounts["Spain"] = 0;
	} else if (segment === "Gender") {
		poscounts["Female"] = 0;
		poscounts["Male"] = 0;
		negcounts["Female"] = 0;
		negcounts["Male"] = 0;
	} else if (segment === "Age"){
		poscounts["18-29"] = 0;
		poscounts["30-49"] = 0;
		poscounts["50-64"] = 0;
		poscounts["65+"] = 0;
		negcounts["18-29"] = 0;
		negcounts["30-49"] = 0;
		negcounts["50-64"] = 0;
		negcounts["65+"] = 0;
  }

  var allpos = 0;
  var allneg = 0;
  var opinionQuestions = {
  	"Trustworthiness": "Q44",
  	"Arrogance": "Q45",
  	"Compassion": "Q46"
  };

  var demographicColumn = {
		"Nationality" : "COUNTRY",
		"Gender": "Q164",
		"Age": "Q165"
	};

  data.forEach(function(r){
  	//Do this for everything but Age
  	if (segment !== "Age"){
  		if (r[opinionQuestions[metric] + "A"] === country){
	  		allpos += 1;
	  		var c = r[demographicColumn[segment]];
	  		if (c in poscounts) {
	  			poscounts[c] += 1;
	  		} else {
	  			poscounts[c] = 1;
	  		}
	  	} else if (r[opinionQuestions[metric] + "B"] === country){
	  		allneg += 1;
	  		var c = r[demographicColumn[segment]];
	  		if (c in negcounts) {
	  			negcounts[c] += 1;
	  		} else {
	  			negcounts[c] = 1;
	  		}
	  	}
	  //This is the age case. I'm going to use the same buckets from the social media stuff
  	} else {
  		if (r[opinionQuestions[metric] + "A"] === country){
	  		allpos += 1;
	  		var age = r[demographicColumn[segment]];
	  		if (age <= 29){
	  			poscounts["18-29"] += 1;
	  		} else if (age <= 49){
	  			poscounts["30-49"] += 1;
	  		} else if (age <= 64) {
	  			poscounts["50-64"] += 1;
	  		} else {
	  			poscounts["65+"] += 1;
	  		}
	  	} else if (r[opinionQuestions[metric] + "B"] === country){
	  		allneg += 1;
	  			  		var age = r[demographicColumn[segment]];
	  		if (age <= 29){
	  			negcounts["18-29"] += 1;
	  		} else if (age <= 49){
	  			negcounts["30-49"] += 1;
	  		} else if (age <= 64) {
	  			negcounts["50-64"] += 1;
	  		} else {
	  			negcounts["65+"] += 1;
	  		}
	  	}

  	}
	});
	poscounts["UK"] = poscounts["Great Britain/United Kingdom"];
  delete poscounts["Great Britain/United Kingdom"];
  negcounts["UK"] = negcounts["Great Britain/United Kingdom"];
  delete negcounts["Great Britain/United Kingdom"];
	return {allpos: allpos, allneg: allneg, poscounts: poscounts, negcounts: negcounts };
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
//Used to count add the cumulative values 
function cumulate (arr) {
    var cumulative = 0;
    for (var i=0; i<arr.length; i++) {
	arr[i].cumulative = cumulative;
	cumulative += arr[i].value;
    }
}
//Tool Tip STuff
var TOOLTIP = {width:250, height:70}

function showToolTip (svg,cx,cy,text1,text2) {

  svg.append("rect")
		.attr("class","tooltip")
		.attr("x",cx-TOOLTIP.width/2)
		.attr("y",cy-TOOLTIP.height/2)
		.attr("width",TOOLTIP.width)
		.attr("height",TOOLTIP.height)
		.style("fill","#dd6112")
		.style("stroke","#772310")
		.style("stroke-width","3px");

  svg.append("text")
		.attr("class","tooltip")
		.attr("x",cx)
		.attr("y",cy-15)
		.attr("dy","0.3em")
		.style("text-anchor","middle")
		.text(text1);

  svg.append("text")
		.attr("class","tooltip")
		.attr("x",cx)
		.attr("y",cy+15)
		.attr("dy","0.3em")
		.style("text-anchor","middle")
		.text(text2);

}

function hideToolTip () {
    d3.selectAll(".tooltip").remove();
}

function countryNameMap (name) {
  const map = {
    "United Kingdom": "UK",
    "Great Britain/United Kingdom" : "UK",
    "Britain": "UK",
    "Czech Republic": "CR",
  }

  if (name in map) return map[name];
  else return name;
}
