/**
 * This file contains the JavaScript code for the map functionality of the website.
 * It imports various modules and sets up the Leaflet map with different layers and controls.
 * It also includes functions for handling click events on the map and submitting data to the server.
 *
 * @preserve
 * @license MIT
 * @author Klara Saary for Traffic Planning Office 'Mobilitätslösung' in Darmstadt
 * @github KlaraSaary
 * Source code: https://github.com/KlaraSaary/Radschnellweg_Leaflet
 * @endpreserve
 */

import { updateMarkerIconSize, enlargeOnHover } from './map-style-functions.js';
import { importGeoJSONAsLayer } from './importGeoJSONAsLayer.js';
import { createSidebar, addSidebarMainInfo } from './sidebar-main.js';
import { backgroundMapChangerInSidebar } from './background-map-changer.js';
import { projectDescription } from './custom-settings.js';

// Define the endpoint URLs for inserting and loading data
const endpoint_insert = '/insert';
const endpoint_load = '/loadData';

/**
 * This function is called when the document is ready.
 * It sets up the Leaflet map, adds various layers and controls, and initializes event listeners.
 * It also fetches data from the server and adds it to the map.
 */
$(document).ready(function() {

	// Define the geographical coordinates of the corners of the rectangle
	var southWest = L.latLng(49.8783, 8.5359),
	northEast = L.latLng(50.2397, 9.381),
	bounds = L.latLngBounds(southWest, northEast);

	// Add map and tile layer
	const map = L.map("map", {
		// center: [49.8782, 8.6487], // Darmstadt
		center: [50.0569, 9.0067], // Radschnellweg, Seligenstadt
		zoom: 12,
		zoomControl: false, // disable the default zoom control
		maxBounds: bounds, // Set the bounds of the map
	});

	// Create a new pane
	const newPane = map.createPane('polygonPane');

	// Set the z-index of the new pane
	newPane.style.zIndex = 300;

	// Add a new zoom control at the bottom right position
	L.control.zoom({
		position: 'topright'
	}).addTo(map);

	const sidebar = createSidebar(map);
	backgroundMapChangerInSidebar(map,sidebar);

	// Create feature group for drawn items & layer group for previously drawn items (dbItems)
	const drawnItems = L.featureGroup();
	map.addLayer(drawnItems);

	const importLayer = L.featureGroup();
	map.addLayer(importLayer);

	// Assume fetchPromises is an array of promises returned by fetch or other asynchronous operations
	var fetchPromises = [
		importGeoJSONAsLayer('data/geojson-layer' ,map, sidebar),
		addSidebarMainInfo(sidebar, projectDescription),
		/* other fetch operations */
	];

	// Wait for all promises to resolve
	// This is important if the data is needed for further processing
	// e.g., adding it to the map or performing calculations
	Promise.all(fetchPromises)
		.then(() => {
			// All data has been fetched and added to the map
			// Map all imported icon sizes from layers to the current zoom level
			updateMarkerIconSize(map,map.getZoom());
			// Call the enlargeOnHover() function
			map.eachLayer(function(layer) {
				enlargeOnHover(layer);
			});
		})
		.catch(error => {
			console.error('Error:', error);
		});

	// Listen for the map's zoom event
	map.on('zoomend', function() {
		updateMarkerIconSize(map, map.getZoom());
	});

	// Function to get the cursor style at the specified coordinates
	function getCursorStyle(e) {
		var cursorPos = map.mouseEventToContainerPoint(e.originalEvent);
		var elementUnderCursor = document.elementFromPoint(cursorPos.x, cursorPos.y);
		return window.getComputedStyle(elementUnderCursor).cursor;
	}
	// When the map is clicked, check if the cursor style is 'pointer' 
	// and fire the click event of the topmost, nearest layer
	map.on('click', function(e) {
		var cursorStyle = getCursorStyle(e);
		if (true) {//(cursorStyle === 'pointer') {
			if (e){
				fireTopmostLayerClickEvent(map, e.latlng);
			}
		}
	});

	const dbItems = L.layerGroup().addTo(map);
});

/**
 * Fires the click event of the topmost layer at the specified coordinates that has a click event listener.
 *
 * @param {L.Map} map - The Leaflet map instance.
 * @param {L.LatLng} latLng - The coordinates where the click event occurred.
 */
function fireTopmostLayerClickEvent(map, latLng) {
	// Get all layers at the specified coordinates
	var closestLayers = []; // Array to store the two closest layers and their distances => {layer: layer, distance: distance}
	function checkLayerHasBounds(layer) {
		if (layer.getLatLngs && typeof layer.getLatLngs === 'function') {
			let layerLatLngs = layer.getLatLngs();
			// Flatten the array of LatLngs
			let flatLatLngs = [].concat.apply([], layerLatLngs);
			if (flatLatLngs.length >= 2) {
				let lineString = turf.lineString(flatLatLngs.map(function(latLng) {
					return [latLng.lng, latLng.lat];
				}));
				let point = turf.point([latLng.lng, latLng.lat]);
				let options = {units: 'meters'};
				let distance = turf.pointToLineDistance(point, lineString, options);

				// Check if the layer's coordinates are within a certain distance of latLng
				let padding = 10; // Set the padding distance (in meters)
				if (distance <= padding) {
					if (closestLayers.length < 2) {
						closestLayers.push({layer: layer, distance: distance});
					} else if (distance < closestLayers[1].distance && distance >= closestLayers[0].distance) {
						closestLayers[1] = {layer: layer, distance: distance};
					} else if (distance < closestLayers[0].distance) {
						closestLayers[1] = closestLayers[0];
						closestLayers[0] = {layer: layer, distance: distance};
					}
					// Sort the array by distance
					closestLayers.sort(function(a, b) {
						return a.distance - b.distance;
					});
				}
			}
		}
	};
	map.eachLayer(function(layer) {
		if (layer instanceof L.LayerGroup && !(layer instanceof L.Marker)) {
			layer.eachLayer(function(layer) {
				if (layer instanceof L.Polyline) {
					checkLayerHasBounds(layer);
				}
			});	
		} else if (layer instanceof L.Polyline) {
			checkLayerHasBounds(layer);
		}
	});
	// Sort the layers by z-index
	closestLayers.sort(function(a, b) {
		return map.getPane(a.layer.options.pane).style.zIndex - map.getPane(b.layer.options.pane).style.zIndex;
	});

	// Fire the click event of the topmost layer that has a click event listener
	// and is one of the two closest layer inside the padding distance
	for (let i = closestLayers.length - 1; i >= 0; i--) {
		if (closestLayers[i].layer.hasEventListeners('click')) {
			if (closestLayers[i].layer.alwaysKeepClickable) { // Check the property
				closestLayers[i].layer.fireEvent('click', { latlng: latLng });
				break;
			}
		} else {
			document.getElementById('furtherInfoContent').innerHTML = "<b>Keine Informationen verfügbar.</b>";
		}
	}
}