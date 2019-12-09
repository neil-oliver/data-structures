// map setup
let mymap = L.map('aa-map').setView([40.734636,-73.994997], 13);
L.tileLayer('https://api.mapbox.com/styles/v1/olivn897/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'ck36ly83q16ci1cukx84c60mx',
    accessToken: 'pk.eyJ1Ijoib2xpdm44OTciLCJhIjoiY2szNmx0dHZqMDA0YzNibnpmem1sM25tOCJ9.lkY_8AlzmT_xunxlmXQYDg'
}).addTo(mymap);

let markers = L.layerGroup().addTo(mymap);

// listener for the user changing any of the settings
$(function(){
    $('select').change(function() {
        getResults()
    });
});

function getResults(){
    
    // send the current settings to the endpoint.
    var parameters = { day: $('select[name="day"]').val(), after: $('select[name="after"]').val(), before: $('select[name="before"]').val() };
    $.get( '/aa',parameters, function(data) {
        // the return data (hanlebars html) is added to the meetings DIV.
        $('#meetings').html(data[0])
        
        console.log(data[1])
        
        markers.clearLayers();
        
        // loop through the JSON data and add markers to the map
        for (var i=0; i<data[1].length; i++) {
            var popupText = `<h1>${data[1][i].extended_address}</h1>`
            for (x in data[1][i].meeting){
                popupText += `<h2>${data[1][i].meeting[x].group}</h2>Start: ${data[1][i].meeting[x].start}<br>End: ${data[1][i].meeting[x].end}<br>`
            }
            L.marker( [data[1][i].lat, data[1][i].long] ).bindPopup(popupText).addTo(markers);
            
            if (i==0){
                $('#next').html(popupText)
            }
        }
        //sort out the map tiles not loading properly
        window.dispatchEvent(new Event('resize'));

    });
}

// listen for a click anwhere on the map and get the lat lon position
mymap.on('click', function(ev){
  var latlng = mymap.mouseEventToLatLng(ev.originalEvent);
  sortResults(latlng)

});

function init(){
    getResults()
}

init()

// organise the meetings div by distance based on where the user clicked. 
function sortResults(position) {

    var latlon = new LatLon(position.lat, position.lng);
 
    var locations = document.getElementById('meetings');
    var locationList = locations.querySelectorAll('.location');
    var locationArray = Array.prototype.slice.call(locationList, 0);

    locationArray.sort(function(a,b){
      var locA  = a.getAttribute('data-latlon').split(',');
      var locB  = b.getAttribute('data-latlon').split(',');
 
      distA = latlon.distanceTo(new LatLon(Number(locA[0]),Number(locA[1])));
      distB = latlon.distanceTo(new LatLon(Number(locB[0]),Number(locB[1])));
      return distA - distB;
    });
 
    //Reorder the list
    locations.innerHTML = "";
    locationArray.forEach(function(el) {
      locations.appendChild(el);
    });
}
 
