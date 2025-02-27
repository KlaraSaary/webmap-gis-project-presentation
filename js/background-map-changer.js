import { customLayersControl } from "./CustomLayerControl.js";

/**
 * Adds a layer control to the sidebar and sets up tile layers for the map.
 * @param {L.Map} map - The Leaflet map object.
 * @param {Sidebar} sidebar - The sidebar object.
 */
export function backgroundMapChangerInSidebar(map,sidebar){

	// Check if the layer control panel already exists
	if(!document.getElementById('backgroundMapControlPanel')){
		// If there is no background map control panel, 
		// return, because there should not be one -> see sidebar-main.js to add one!
		return;
	}

	// Get the current year for the attribution text
	var currentYear = new Date().getFullYear();
	// Define the attribution text for the tile layers
	var attribution = '&copy; <a href="http://www.bkg.bund.de">Bundesamt für Kartographie und Geodäsie (' + currentYear + ')</a>';

	// Define the other tile layers
	var tileLayers = {
		'OSM Standard':  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; OpenStreetMap contributors'
		}),
		'TPO Web': L.tileLayer('https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web/default/WEBMERCATOR/{z}/{y}/{x}.png',{
			attribution: attribution
		}),
		'TPO Grey': L.tileLayer('https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_grau/default/WEBMERCATOR/{z}/{y}/{x}.png', {
			attribution: attribution
		}),
		/*
		'TPO Web Light': L.tileLayer('https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_light/default/WEBMERCATOR/{z}/{y}/{x}.png',{
			attribution: attribution
		}),
		'TPO Grey Light': L.tileLayer('https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_light_grau/default/WEBMERCATOR/{z}/{y}/{x}.png',{
			attribution: attribution
		}),
		'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
			attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
		})
		*/
	};

	tileLayers['TPO Grey'].addTo(map);

	var layerControl = customLayersControl(tileLayers, [], {collapsed: false});//.addTo(map);
	layerControl.addTo(map);
	// Get the container of the layer control
	var layerControlContainer = layerControl.getContainer();

	document.getElementById('layer-control').appendChild(layerControlContainer); 

	// Get the divs in the sidebar panel with id 'layer-control'
	var layerControlDivs = document.querySelectorAll('#layer-control div');

	// Add a click event listener to each div
	for (var i = 0; i < layerControlDivs.length; i++) {
		layerControlDivs[i].addEventListener('click', function () {
			// Close the sidebar when a div is clicked
			sidebar.close();
		});
	}
}


