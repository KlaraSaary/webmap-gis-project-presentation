import { addPopUpToElementsTechnicalLayers, updateMarkerIconSize } from './map-style-functions.js';
import { fetchFileListAndData, fetchFileList } from './server-communication.js';
import { addCheckboxLayerSwitcher } from './sidebar-legende.js';
import { otherSettings } from './custom-settings.js';
import { LayerstyleClasses } from './layerstyle-classes.js';
 
/**
 * Imports a GeoJSON file as a layer based on the specified type.
 * @param {string} geoJsonPath - The path to the GeoJSON file.
 * @param {string} type - The type of layer to create (e.g., "Laufrouten", "Querungen").
 * @returns {Promise<Layer|null>} - A promise that resolves to the created layer, or null if an error occurred.
 * 
 * The function fetches the GeoJSON data from the given path and creates a new layer instance based on the provided type.
 * The type is determined by the first word of the GeoJSON file name. If the type matches one of the class names in LayerstyleClasses, a new instance of that class is created.
 * If there is no match for the type, the function then checks if the filename includes the search term associated with any class in LayerstyleClasses. If a match is found, a new instance of the associated class is created.
 * If there is no predetermined type or search term match, a generic GeoJSON layer is created with a default style and pointToLayer function.
 */
export async function importGeoJSONAsLayer(geoJsonPath, map, sidebar) {

	// Pass the directory path as an argument
    const popUpImagesPath = 'data/popup-images';
    try {
        const geoJSONFilesAndData = await fetchFileListAndData(geoJsonPath);
        const geoJSONPopUpImages = await fetchFileList(popUpImagesPath);
        // Iterate over each file and create a geoJSON-Layer out of it
        geoJSONFilesAndData.forEach(file => {
            let layer = createGeoJSONInstance(file, map);
            let fileName = file.fileName;
            let imageNamesList = [];
            const lastPointIndex = fileName.lastIndexOf('.');
            if (lastPointIndex !== -1) {
                fileName = fileName.substring(0, lastPointIndex);
            }
            if (layer) {
                if (otherSettings[fileName] || otherSettings[file.data.name]){
                    fileName = otherSettings[fileName] ? fileName : file.data.name;
                    // get all images for the popups that have a substring of the same content as the geojson file
                    if (otherSettings[fileName]['loadImages']){
                        imageNamesList = geoJSONPopUpImages.filter(image => image.path.includes(fileName));
                    }
                    if(otherSettings[fileName]['showLayerOnStart'] || otherSettings[fileName]['showLayerOnStart'] === undefined){
                    layer.addTo(map);
                    }
                    if (otherSettings[fileName]['showPopupForLayerWhenClicked'] || otherSettings[fileName]['showPopupForLayerWhenClicked'] === undefined){                    
                        addPopUpToElementsTechnicalLayers(layer, imageNamesList, sidebar, otherSettings[fileName]['alwaysKeepClickable']);
                    }
                }
                addCheckboxLayerSwitcher(layer, map, sidebar);
            }
        });
    } catch (error) {
        console.error('Error fetching file list and data:', error);
    }
}

/**
 * Creates a new layer instance based on the provided GeoJSON data.
 * @returns {[Layer, Array<string>]} - An array containing the created layer instance and an array of properties to show.
 */
function createGeoJSONInstance(file) {
    const geoJSONData = file.data;
    const type = file.type;
    const filename = file.data.name; 
    let newLayer;
    try {
        let matchFound = false;
        let options = [];
        let crs = geoJSONData.crs.properties.name;
        if (!crs.includes('CRS84')){  
            options = projectCoordinates2CRS84(crs, options); 
        };
        // The type is determined by the first word of the GeoJSON file name. 
        // Seperator is "_". If the first word is not a known type, a generic GeoJSON layer is created.
        // Assuming the classes are globally accessible
        // If the type matches one of the class names, create a new instance of that class
        if (LayerstyleClasses[type]) {
            newLayer = new LayerstyleClasses[type].class(geoJSONData, options, filename);
        } else {
            for (const key in LayerstyleClasses) {
                if((Array.isArray(LayerstyleClasses[key].searchTerm) && LayerstyleClasses[key].searchTerm.some(term => filename.includes(term)))
                    || filename.includes(LayerstyleClasses[key].searchTerm)){
                    newLayer = new LayerstyleClasses[key].class(geoJSONData, options, filename);
                    matchFound = true;
                    break;
                }
            }
            if (!matchFound) {
                // If there is no predetermined type, create a generic GeoJSON layer
                // with a default style and pointToLayer function
                newLayer = createDefaultLayerGroup(geoJSONData, options);

                console.warn("There is no Subclass for GeoJsonLayer of " + type + 
                ". Check file LayerstyleClasses.js.");
            }
        }
        return newLayer;
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Projects coordinates to the CRS84 projection.
 * @param {string} crs - The CRS of the coordinates.
 * @returns {Object} - The options object with the coordsToLatLng function for coordinate transformation.
 * @throws {Error} - If the CRS is not supported.
 */
function projectCoordinates2CRS84(crs, options){
    // Define the CRS84 projection
    const crs84 = proj4.Proj('EPSG:4326');
    let oldCoord;
    if (crs.includes('25832')){            
        // Define the EPSG:25832 projection
        oldCoord = proj4.Proj("+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
    } else if (crs.includes('5652')){
        // Define the EPSG:5652 projection
        oldCoord = proj4.Proj("+proj=tmerc +lat_0=0 +lon_0=9 +k=0.9996 +x_0=32500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
    } else{
        throw new Error("Unsupported CRS. Only CRS84/EPSG:4326, EPSG:25832 and EPSG:5652 are supported currently." + 
        "If other CRS type is needed, please define it inside importGeoJSONAsLayer.js in createGeoJSONInstance()");
    }
    // Set the coordsToLatLng option for coordinate transformation
    options.coordsToLatLng = function(coords) {
        // Transform the coordinates from EPSG:25832 to CRS84
        const transformed = proj4(oldCoord, crs84, coords);
        return new L.LatLng(transformed[1], transformed[0]);
    }
    return options;
}

function createDefaultLayerGroup(geoJSONData, options){
    // Filter out the point features
    let pointFeatures = geoJSONData.features.filter(feature => feature.geometry.type === 'Point');
    let otherFeatures = geoJSONData.features.filter(feature => feature.geometry.type !== 'Point');
    // Create a GeoJSON layer for the point features
    let pointLayer = L.geoJSON(pointFeatures, {
        ...options,
        style: {fillColor: "#fc7300", weight: 5},
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 7, 
                color: '#ffffff',
                fillColor: '#fc7300',
                fillOpacity: 0.8,
                weight: 3,
                originalRadius: 7,
                originalStrokeWidth: 3,
                pane: 'markerPane'
            });
        }
    });
    // Create a GeoJSON layer for the other features
    let otherLayer = L.geoJSON(otherFeatures, {
        ...options,
        pane: 'overlayPane',  // Add the other features to the 'overlayPane' pane
        style: {fillColor: "#fc7300", weight: 5}
    });
    let newLayer;
    return newLayer = L.featureGroup([pointLayer, otherLayer]);
}

