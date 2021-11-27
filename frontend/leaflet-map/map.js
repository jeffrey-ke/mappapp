
var DefaultLocation = [37.349167, -121.938056]; // SCU Location
var DefaultAPI = "http://127.0.0.1:5000/mappapp?";

// We want to start the app with current location
var map = L.map('map').locate({setView: true, maxZoom: 16});

// Allocate components needed for start up
var marker = L.marker(DefaultLocation).addTo(map);
var info = L.control();

// We will try to do an update on current location first
// Note: if the we can not get current location, we will use default
map.on('locationfound', function onLocationFound(e) {
  var radius = e.accuracy;
  DefaultLocation = e.latlng;

  L.circle(e.latlng, radius).addTo(map);

  marker.setLatLng(DefaultLocation);

  var today = new Date();
  info.update({value: today.getDay(), fix: DefaultLocation});
});

// Loading map tile
L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; OpenStreetMap contributors',
  maxZoom: 18
}).addTo(map);

///////////////////////////////////////////////////
// Utility to return needed colors for a range
function getColor(d) {
  return d > 500  ? '#ff0000' :
         d > 300  ? '#ff8000' :
         d > 200  ? '#ffbf00' :
         d > 50   ? '#ffff00' :
         d > 10   ? '#bfff00' :
                    '#80ff00';
}

///////////////////////////////////////////////////
// Custom Control for selecting day of week
var daySelector = L.control();

daySelector.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info dow');
  this._div.innerHTML = '<label for="dow">Day of Week: </label>' +
  '<select id="dayOfWeek">' +
  '<option value="1" selected="selected">Monday</option>' +
  '<option value="2">Tuesday</option>'   +
  '<option value="3">Wednesday</option>' +
  '<option value="4">Thursday</option>'  +
  '<option value="5">Friday</option>'    +
  '<option value="6">Saturday</option>'  +
  '<option value="0">Sunday</option>'    +
  '</select><br>';

  // Stop letting a click on this control to go thru onto the map
  L.DomEvent.on(this._div, 'click', L.DomEvent.stopPropagation);

  return this._div;
};

daySelector.addTo(map);

///////////////////////////////////////////////////
// Custom Info Control Displaying Stats
info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info stats'); // create a div with a class "info"

  // Stop letting a click on this control to go thru onto the map
  L.DomEvent.on(this._div, 'click', L.DomEvent.stopPropagation);

  // Trigger the first update and initalise the stats panel
  this.update();  
  return this._div;
};

info.onRemove = function(map) {
  // L.DomEvent.off();
}

// method that we will use to update the info based on map information passed in
info.update = function (props) {
  if (!props)
  {
    this._div.innerHTML = '<h4>Road Traffic Statistics</h4>';
    this._div.innerHTML += 'Waiting for location...';
  }
  else
  {
    var dow = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; 
    this._div.innerHTML = '<h4>Road Traffic Statistics</h4>';
    this._div.innerHTML += `Waiting ${dow[props.value]} traffic stats</b> (${props.fix.lat.toFixed(2)} | ${props.fix.lng.toFixed(2)})`;
    var apiQuery = `dow=${props.value}&lat=${props.fix.lat}&lng=${props.fix.lng}`;
    fetch(DefaultAPI + apiQuery)
    .then(response => response.json())
    .then(json => {
      // Call BE-API to get {morning:mValue, afternoon:aValue, evening:eValue}
      var resp = {morning:undefined, afternoon:undefined, evening:undefined};
      if (!json.morning) 
      {
        alert (`API KEY: "morning" undefined ${json}`);
      }
      else
      {
        resp.morning = json.morning;
        resp.afternoon = json.afternoon;
        resp.evening = json.evening;
      }
      // Updating table
      this._div.innerHTML = '<h4>Road Traffic Statistics</h4>';
      this._div.innerHTML += `<b>${dow[props.value]} traffic stats</b> @ ${props.fix.lat.toFixed(3)} | ${props.fix.lng.toFixed(3)}`;
      this._div.innerHTML += '<table style="width:100%">' +
      '<tr><td>Morning</td>  <td style="background-color:' + getColor(resp.morning) +   '">' + resp.morning +'</td></tr>' +
      '<tr><td>Afternoon</td><td style="background-color:' + getColor(resp.afternoon) + '">' + resp.afternoon +'</td></tr>' +
      '<tr><td>Evening</td>  <td style="background-color:' + getColor(resp.evening) +   '">' + resp.evening +'</td></tr>' +
      '</table>';
    });
  }
}

info.addTo(map);

///////////////////////////////////////////////////
// Adding a colored legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

  var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 10, 50, 200, 300, 500];

  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
          '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }
  // Stop letting a click on this control to go thru onto the map
  L.DomEvent.on(div, 'click', L.DomEvent.stopPropagation);

  return div;
};

legend.addTo(map);

///////////////////////////////////////////////////
// Adding Click-handler on map
map.on('click', function onMapClickMarker(e) {

  marker.setLatLng(e.latlng);

  var dow = document.getElementById("dayOfWeek").value;
  info.update({value: dow, fix: e.latlng});
});
