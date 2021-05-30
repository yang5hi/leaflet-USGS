// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(usgsData) {
  d3.json("static/data/PB2002_boundaries.json").then(function(tectonic2002){
      // Once we get a response, send the data.features object to the earthquakeData variable
      console.log(usgsData.features);
      console.log(tectonic2002.features);  
      createFeatures(usgsData.features, tectonic2002.features);
  })
});

function createFeatures(earthquakeData, platesData) {
  // parse out the useful information
  const earthlatlog=earthquakeData.map(a=>[+a.geometry.coordinates[1],+a.geometry.coordinates[0]]);
  const earthDepth=earthquakeData.map(a=>a.geometry.coordinates[2]);
  const earthquakePlace=earthquakeData.map(a=>a.properties.place);
  const earthquakeMag=earthquakeData.map(a=>parseFloat(a.properties.mag));
  const plateLines=platesData.map(a=>a.geometry);
  const earthquakeMarkers=[];
  // Loop through the earthquakeData array
  for (var i = 0; i < earthquakeData.length; i++) {
    // Add circles to map
    earthquakeMarkers.push(
        L.circle(earthlatlog[i], {
          weight:1,
          fillOpacity: 1,
          color: "#2f3e46",
          fillColor: getColor(earthDepth[i]),
          radius: 40000*(earthquakeMag[i]) // Adjust radius
      }).bindPopup("<h3> Location: " + earthquakePlace[i] + "</h3> <h3> Magnitude: " + earthquakeMag[i] + "</h3> <h3> Depth: " + earthDepth[i] +"km </h3>")
    )
  }
  var earthquakes=L.layerGroup(earthquakeMarkers);
  createMap(earthquakes,plateLines);
}

function createMap (earthquakes,plateLines) {
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

    var myStyle = {
      "color": "darkred",
      "weight": 3,
      "opacity": 0.8
    };
  
    var tectonicLines=L.geoJSON(plateLines, {
        style: myStyle
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Satellite": satellitemap,
      "Grayscale": lightmap,
      "Outdoors": outdoormap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      "Earthquakes": earthquakes,
      "Tectonic Plates":tectonicLines
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("mapid", {
      center: [0, -90],
      zoom: 3,
      layers: [lightmap,earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (myMap) {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [-10, 10, 30, 50, 70, 90],
            labels = [];

        // loop through depth intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }
            return div;
        };
    legend.addTo(myMap);
};

function getColor(d) {
  return d > 90  ? '#ff0000' :
         d > 80  ? '#ff8700' :
         d > 70  ? '#ffd300' :
         d > 50  ? '#deff0a' :
         d > 30  ? '#a1ff0a' :
         d > 10  ? '#0aff99' :
                   '#27c0c0';
};