var mapData, svg, leftScale, bottomScale, last_state = false;
jQuery(document).ready(function() {
  d3.csv('mapgraph.csv',
    function (error, data) {
      if (error) throw error;
      mapData = parseData(data);
      svg = d3.select("#graph");
        margin = {top: 20, right: 20, bottom: 30, left: 100};
      var
        width = svg.attr('width') - margin.left - margin.right,
        height = svg.attr('height') - margin.top - margin.bottom;

      leftScale = d3.scaleBand().domain(["Non-beneficial Use", "Beneficial Use"]).range([height/2,0]).padding(.1);
      keyLeftScale = d3.scaleBand().domain(["Non-beneficial Use", "Beneficial Use"]).range([height/3,0]).padding(.2);

      bottomScale = d3.scaleLinear().domain([0,mapData.maxTons]).range([30, width]);
      var left = d3.axisLeft(leftScale),
        keyLeft = d3.axisLeft(keyLeftScale),
        bottom = d3.axisBottom(bottomScale);




      svg.append("g")
        .attr("class", "axis axis--y")
        .attr('transform','translate(30, 0)')
        .call(left);
    //  drawKey(keyLeft);
    });


});

function drawKey(keyLeft){

  var key_g = svg.append("g")
    .attr('transform','translate(33, 300)')
    .attr("class", "axis axis--y")
    .call(keyLeft);


  var beneficialKeys = ['Agriculture', 'Forestry', 'Land Reclamation', 'Landscapes and Gardens'],
    nonBeneficialKeys = ['Landfill', 'Incineration'];

  var beneficialStack = d3.stack()
    .keys(beneficialKeys)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  var nonBeneficialStack = d3.stack()
    .keys(nonBeneficialKeys)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  var beneTextLength = 0;
  for(var key in beneficialKeys) {
    var beneficialSeries = key_g.append('g')
      .attr('class', 'stack')
      .append('g');


    var beneText = svg.append('text')
      .text(beneficialKeys[key])
      .attr('transform','translate(5, 0)')
      .attr("class", "key-text")
      .attr('text-anchor', 'right')
      .attr('x', beneTextLength + 45)
      .attr("y", keyLeftScale("Beneficial Use")+ (keyLeftScale.bandwidth()/4)  + 337);

    var beneWidth = beneText.node().getBBox().width;

    var beneRect = beneficialSeries.append('rect');

    beneRect.attr('class', beneficialKeys[key].toLowerCase().replace(/ /g,"-"))
      .attr('transform','translate(5, 0)')
      .attr('x', beneTextLength )
      .attr("y", keyLeftScale("Beneficial Use")+ (keyLeftScale.bandwidth()/4) )
      .transition()
      .attr('width', beneWidth + 20)
      .attr('height', keyLeftScale.bandwidth()/2);

    beneTextLength += beneWidth + 20;
  }

  svg.append('text')
    .attr("class", "key-title-text")
    .text('Key')
    .attr('x', beneTextLength/2)
    .attr("y", keyLeftScale("Beneficial Use") + 300);

  var nonBeneTextLength = 0;
  for(var key2 in nonBeneficialKeys) {
    var nonBeneficialSeries = key_g.append('g')
      .attr('class', 'stack')
      .append('g');


    var nonBeneText = svg.append('text')
      .text(nonBeneficialKeys[key2])
      .attr("class", "key-text")
      .attr('transform','translate(5, 0)')
      .attr('text-anchor', 'right')
      .attr('x', nonBeneTextLength + 45)
      .attr("y", keyLeftScale("Non-beneficial Use") + (keyLeftScale.bandwidth()/4) + 337);

    var nonBeneWidth = nonBeneText.node().getBBox().width;

    var nonBeneRect = nonBeneficialSeries.append('rect');

    nonBeneRect.attr('class', nonBeneficialKeys[key2].toLowerCase().replace(/ /g,"-"))
      .attr('transform','translate(5, 0)')
      .attr('x', nonBeneTextLength)
      .attr("y", keyLeftScale("Non-beneficial Use") + (keyLeftScale.bandwidth()/4))
      .transition()
      .attr('width', nonBeneWidth + 20)
      .attr('height', keyLeftScale.bandwidth()/2);

    nonBeneTextLength += nonBeneWidth + 20;
  }
}


function drawMap(state_or_province) {
  if(!last_state){
    last_state = state_or_province
  }

  var beneficialKeys = ['Agriculture', 'Forestry', 'Land Reclamation', 'Landscapes and Gardens'],
    nonBeneficialKeys = ['Landfill', 'Incineration'];

  var beneficialStack = d3.stack()
    .keys(beneficialKeys)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  var nonBeneficialStack = d3.stack()
    .keys(nonBeneficialKeys)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  var nonBeneficialSeries = svg.selectAll('.nb-series')
    .data(nonBeneficialStack([mapData[state_or_province]]));

  var nonBeneTotal = 0,
    nonBeneRect = nonBeneficialSeries.enter()
    .append('g')
    .attr('class', 'nb-series')
    .merge(nonBeneficialSeries)
    .selectAll('rect')
    .data(function (d) {
      //add the key in so we can retrieve it later when getting the class
      d[0][2] = d['key'];
      return d;
    },
    function(d){
      return d[2];
    });

  nonBeneRect
    .enter()
    .append('rect')
    .merge(nonBeneRect)
    .attr('class', function(d){
      return d[2].toLowerCase().replace(" ","-");
    })
    .attr('x', function (d) {
      return bottomScale(d[0]);
    })
    .attr("y", leftScale("Non-beneficial Use"))
    .transition()
    .attr('width', function (d) {
      nonBeneTotal += d[1] - d[0];
      return bottomScale(d[1]) - bottomScale(d[0]);
    })
    .attr('height', leftScale.bandwidth());

  var beneficialSeries = svg.selectAll('.b-series')
    .data(beneficialStack([mapData[state_or_province]]));


  var beneTotal = 0,
  beneRect = beneficialSeries.enter()
    .append('g')
    .attr('class', 'b-series')
    .merge(beneficialSeries)
    .selectAll('rect')
    .data(function (d) {
      d[0][2] = d['key'];
      return d;
    },
    function(d) {
      return d[2];
    });

  beneRect.enter()
    .append('rect')
    .merge(beneRect)
    .attr('class', function(d){
      return d[2].toLowerCase().replace(/ /g,"-");
    })
    .attr('x', function (d) {
      return bottomScale(d[0]);
    })
    .attr("y", leftScale("Beneficial Use"))
    .transition()
    .attr('width', function (d) {
      beneTotal += d[1] - d[0];
      return bottomScale(d[1]) - bottomScale(d[0]);
    })
    .attr('height', leftScale.bandwidth());

  svg.selectAll('.percent-text').remove();
  var usePercent = (beneTotal + nonBeneTotal) / 100;
  svg.append('text')
    .attr("class", "percent-text")
    .attr('transform','translate(-520,130)')
    .attr('text-anchor', 'right')
    .attr("y", leftScale("Beneficial Use") + 90)
    .text(beneTotal.toString() + " dt (" + (beneTotal / usePercent).toFixed().toString() + "%)");

  svg.append('text')
    .attr("class", "percent-text")
    .attr('transform','translate(-520,130)')
    .attr('text-anchor', 'right')
    .attr("y", leftScale("Non-beneficial Use") + 90)
    .text(nonBeneTotal.toString() + " dt (" + (nonBeneTotal / usePercent).toFixed().toString() + "%)");

  beneRect.exit().remove();



  last_state = state_or_province;
}

function parseData(data) {
  var returnData = {};
  maxTons = 0;
  data.forEach(function (d) {
    if (parseInt(d['Total Dry Tons']) > maxTons) {
      maxTons = parseInt(d['Total Dry Tons']);
    }
    returnData[d['State or Province']] = d;

  });
  returnData.maxTons = maxTons;
  return returnData;
}
