// map setup
let mymap = L.map('aa-map').setView([40.734636,-73.994997], 13);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1Ijoib2xpdm44OTciLCJhIjoiY2szNmx0dHZqMDA0YzNibnpmem1sM25tOCJ9.lkY_8AlzmT_xunxlmXQYDg'
}).addTo(mymap);

let markers = L.layerGroup().addTo(mymap);

$(function(){
    $('select').change(function() {
        getResults()
    });
});

function getResults(){
    var parameters = { day: $('select[name="day"]').val(), after: $('select[name="after"]').val(), before: $('select[name="before"]').val() };
    $.get( '/aa',parameters, function(data) {
        $('#meetings').html(data[0])
        
        console.log(data[1])
        
        markers.clearLayers();
        
        for (var i=0; i<data[1].length; i++) {
            L.marker( [data[1][i].lat, data[1][i].long] ).bindPopup(data[1][i].extended_address).addTo(markers);
        }
    });
}

function init(){
    getResults()
}

init()
