var map = L.map('map').setView([37.349167, -121.938056], 16);

L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; OpenStreetMap contributors',
  maxZoom: 18
}).addTo(map);

///////////////////////////////////////////////////
// Utility to return needed colors for a range
function getColor(d) {
  return d > 500  ? '#ff0000' :
         d > 200  ? '#ff4000' :
         d > 100  ? '#ff8000' :
         d > 50   ? '#ffbf00' :
         d > 20   ? '#ffff00' :
         d > 10   ? '#bfff00' :
                    '#80ff00';
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

///////////////////////////////////////////////////
// Custom Control for selecting day of week
var daySelector = L.control();

daySelector.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'dow');
  this._div.innerHTML = '<label for="dow">Day of Week: </label>' +
  '<select id="dayOfWeek">' +
  '<option value="1" selected="selected">Monday</option>' +
  '<option value="2">Tuesday</option>'   +
  '<option value="3">Wednesday</option>' +
  '<option value="4">Thursday</option>'  +
  '<option value="5">Friday</option>'    +
  '<option value="6">Saturday</option>'  +
  '<option value="7">Sunday</option>'    +
  '</select><br>';

  return this._div;
};

daySelector.onRemove = function(map) {
  // L.DomEvent.off();
}

daySelector.addTo(map);

///////////////////////////////////////////////////
// Custom Info Control Displaying Stats
var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  // L.DomEvent.on();
  return this._div;
};

info.onRemove = function(map) {
  // L.DomEvent.off();
}

// method that we will use to update the info based on map information passed in
info.update = function (props) {
  this._div.innerHTML = '<h4>Road Traffic Statistics</h4>';
  if (!props)
    this._div.innerHTML += 'Click a location';
  else
  {
    var dow = ["MON", "TUE", "WED", "THR", "FRI", "SAT", "SUN"]; 

    this._div.innerHTML += '<b>' + dow[props.value-1] + '(' + props.value +') traffic stats</b> @ ' 
      + props.fix.lat.toFixed(3) + ' | ' + props.fix.lng.toFixed(3);

    // <<<<<< TODO <<<<<<<
    // Call BE-API to get {morning:mValue, afternoon:aValue, evening:eValue}
    var resp = {morning:getRandomInt(500), afternoon:getRandomInt(500), evening:getRandomInt(500)};

    // Updating table
    this._div.innerHTML += '<table style="width:100%">' +
      '<tr><td>Morning</td>  <td style="background-color:' + getColor(resp.morning) +   '">' + resp.morning +'</td></tr>' +
      '<tr><td>Afternoon</td><td style="background-color:' + getColor(resp.afternoon) + '">' + resp.afternoon +'</td></tr>' +
      '<tr><td>Evening</td>  <td style="background-color:' + getColor(resp.evening) +   '">' + resp.evening +'</td></tr>' +
      '</table>';
  }
};

info.addTo(map);

///////////////////////////////////////////////////
// Legends
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

  var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 10, 20, 50, 100, 200, 500],
      labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
          '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }

  return div;
};

legend.addTo(map);

///////////////////////////////////////////////////
// Adding Click-handler on map
var popup = L.popup();

function onMapClick(e) {
  popup
  .setLatLng(e.latlng)
  .setContent("" + e.latlng.lat + "<br>" + e.latlng.lng)
  .openOn(map);

  var dow = document.getElementById("dayOfWeek").value;
  info.update({value: dow, fix: e.latlng});
}

map.on('click', onMapClick);