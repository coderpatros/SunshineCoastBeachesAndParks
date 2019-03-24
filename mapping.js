function dismissDialog(dialogId) {
    document.getElementById(dialogId).style.visibility = 'hidden';
}

function displayDialog(dialogId) {
    document.getElementById(dialogId).style.visibility = 'visible';
}

function Facility(label, url, iconUrl, where) {
    return {
        label: label,
        url: url,
        iconUrl: iconUrl,
        where: where
    }
}

function Control(label, position, clickHandler) {
    return {
        label: label,
        position: position,
        clickHandler: clickHandler
    }
}

var map, locationMarker, locationAccuracyCircle;

// setup base map
map = L.map('map').setView([ -26.653127, 153.067969 ], 11);
L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGF0cm9zIiwiYSI6ImNpenNjcjk4cTAwenIycXBjdjVnbHFwdzUifQ.fk6Q_TamIFNjQDFZ5AZVNA', {
    attribution: 'Map data &copy; <a href="httpz://openstreetmap.org">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://mapbox.com">Mapbox</a>',
    maxZoom: 20
}).addTo(map);
L.control.scale().addTo(map);

var controls = [
    Control(
        'Legend',
        'topright',
        function() { displayDialog('legend'); })
];

var facilities = [
    Facility(
        'BBQ',
        'https://gisservices.scc.qld.gov.au/arcgis/rest/services/Structure/Structure_SCRC/MapServer/0',
        'markers/bbq.png'),
    Facility(
        'Playground',
        'https://gisservices.scc.qld.gov.au/arcgis/rest/services/Society/Society_SCRC/MapServer/42',
        'markers/playground.png'),
    Facility(
        'Playground with liberty swing',
        'https://gisservices.scc.qld.gov.au/arcgis/rest/services/Society/Society_SCRC/MapServer/43',
        'markers/playground-liberty-swing.png'),
    Facility(
        'Patrolled beach',
        'https://gisservices.scc.qld.gov.au/arcgis/rest/services/Society/Society_SCRC/MapServer/6',
        'markers/patrolled-beach.png'),
    Facility(
        'Beach access',
        'https://gisservices.scc.qld.gov.au/arcgis/rest/services/Society/Society_SCRC/MapServer/5',
        'markers/beach-access.png'),
    Facility(
        'Public toilet',
        'https://gisservices.scc.qld.gov.au/arcgis/rest/services/Society/Society_SCRC/MapServer/46',
        'markers/toilet.png'),
    Facility(
        'Wifi hotspots',
        'https://gisservices.scc.qld.gov.au/arcgis/rest/services/UtilitiesCommunication/Utilities_SCRC/MapServer/0',
        'markers/wifi.png',
        "WiFiType<>'Paid WiFi'"),
    Facility(
        'Dog Water Bowls',
        'https://gisservices.scc.qld.gov.au/arcgis/rest/services/Structure/Structure_SCRC/MapServer/1',
        'markers/water.png',
        "AssetSubType='Dog Bowl'"
    )
];

// setup legend items and facility layers
var legendItemContainer = document.getElementById('legendItemContainer');
var facilityLayers = [];
for (var i=0; i<facilities.length; i++) {
    (function() {
        var facility = facilities[i];

        var legendItem = document.createElement('li');
        var legendImage = document.createElement('img');
        legendImage.src = facility.iconUrl;
        legendItem.appendChild(legendImage);
        var legendText = document.createTextNode(facility.label);
        legendItem.appendChild(legendText);
        legendItemContainer.appendChild(legendItem);

        var layer = L.esri.featureLayer({
            url:  facility.url,
            pointToLayer: function(geojson, latlng) {
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: facility.iconUrl,
                        iconSize: [32, 37],
                        iconAnchor: [16, 37],
                        popupAnchor: [0, -11]
                    })
                });
            }
        }).addTo(map);
        if (facility.where) layer.setWhere(facility.where);
        facilityLayers.push(layer);
    })();
}

// setup device location handling
function onLocationFound(e) {
    var radius = e.accuracy / 2;

    if (locationMarker) {
        locationMarker.setLatLng(e.latlng);
    } else {
        locationMarker = L.marker(e.latlng).addTo(map);
    }

    if (locationAccuracyCircle) {
        locationAccuracyCircle.setLatLng(e.latlng).setRadius(radius);
    } else {
        locationAccuracyCircle = L.circle(e.latlng, radius).addTo(map);
    }
}
map.on('locationfound', onLocationFound);
map.locate({setView: true, maxZoom: 16});

// setup controls
for (var i=0; i<controls.length; i++) {
    (function() {
        var control = controls[i];
        var Control = L.Control.extend({
            onAdd: function(map) {
                var leafletControl = L.DomUtil.create('button');
                leafletControl.type = 'button';
                leafletControl.className = 'map-control';
                leafletControl.appendChild(document.createTextNode(control.label));
                leafletControl.onclick = control.clickHandler || function() { alert(control.label); };
                return leafletControl;
            }
        });
        (new Control({ position: control.position })).addTo(map);
    })();
}