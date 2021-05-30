// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";

// Perform a GET request to the query URL
d3.json("static/data/4.5_month.geojson").then(function(data) {
  // Once we get a response, send the data.features object to the earthquakeData variable
  const earthquakeData=data.features;
  // parse out the useful information
  const earthlatlog=earthquakeData.map((a,i)=>[+a.geometry.coordinates[1],+a.geometry.coordinates[0]]);
  const earthDepth=earthquakeData.map((a,i)=>a.geometry.coordinates[2]);
  const earthquakePlace=earthquakeData.map((a,i)=>a.properties.place);
  const earthquakeMag=earthquakeData.map((a,i)=>a.properties.mag);
  const earthquakeTime=earthquakeData.map((a,i)=>Date(a.properties.time));

  earthquakeMarkers=[];
  // Loop through the earthquakeData array
  for (var i = 0; i < earthquakeData.length; i++) {

    // Conditionals for earthquakeData points
    var circleColor = "";
    if (earthDepth[i] > 90) {
      circleColor = "#ff0000";
    } else if (earthDepth[i] > 80) {
      circleColor = "#ff8700";
    } else if (earthDepth[i] > 70) {
      circleColor = "#ffd300";
    } else if (earthDepth[i] > 50) {
      circleColor = "#deff0a";
    } else if (earthDepth[i] > 30) {
      circleColor = "#a1ff0a";
    } else {
      circleColor = "#0aff99";
    }

    // Add circles to map
    earthquakeMarkers.push(
        L.circle(earthlatlog[i], {
          weight:1,
          fillOpacity: 1,
          color: "#2f3e46",
          fillColor: circleColor,
          radius: earthquakeMag[i] * 30000 // Adjust radius
      }).bindPopup("<h3>" + earthquakePlace[i] + "</h3> <hr> <h4>" + earthquakeTime[i] + "</h4>")
    )
  }

  var earthquakes=L.layerGroup(earthquakeMarkers);

 // Define outdoors and darkmap layers
  var outdoormap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satellitemap,
    "Grayscale": lightmap,
    "Outdoors": outdoormap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [0, 40],
    zoom: 3,
    layers: [satellitemap,earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
});
