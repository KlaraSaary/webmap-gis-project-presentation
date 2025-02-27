// Function to update the icon size of all markers on the map
/**
 * Updates the marker icon size based on the current zoom level of the Leaflet map.
 * Throws an error if the 'map' parameter is not an instance of Leaflet map.
 *
 * @param {L.Map} map - The Leaflet map instance.
 */
export function updateMarkerIconSize(mapOrLayerGroup, zoomLevel) {
    // Check if 'mapOrLayerGroup' is an instance of Leaflet map
    if (!(mapOrLayerGroup instanceof L.Map || mapOrLayerGroup instanceof L.LayerGroup)) {
        throw new Error('Parameter "mapOrLayerGroup" must be a Leaflet map or LayerGroup instance');
    }
    var currentZoom = zoomLevel;//map.getZoom();
    
    // Calculate the new weight or radius based on the newSize. 
    // Magic numbers are determined from fitting curves through desired values 
    // to match wanted behavior when zooming in and out.
    var newSize = Math.atan(currentZoom-15)/(Math.PI/2)*(18-4)+15; // Sigmoid function to determine the size of the icons
    function magicWeight(originalValue){
        return originalValue * (0.05 * newSize + 0.258135 * Math.log(0.6351 * originalValue));
    }
    mapOrLayerGroup.eachLayer(function(layer) {
        // Check if the layer is a Marker
        if (layer instanceof L.Marker) {
            
            var icon = layer.options.icon;
            // Check if the layer has a custom icon and it's not the default icon
            if (icon && icon.options && Array.isArray(icon.options.iconSize) 
            && icon !== L.Icon.Default && icon.options.iconUrl!="marker-icon.png") {
                // Update the icon size
                if (icon.options.originalSize){
                    let ratio = newSize/15; // 15 is the set standard size in this code base
                    let newSizeOrig = icon.options.originalSize * ratio;
                    icon.options.iconSize = [newSizeOrig, newSizeOrig]; 
                }else icon.options.iconSize = [newSize, newSize];
                // Set the updated icon to the marker
                layer.setIcon(icon);
            }else if (icon.options.iconUrl=="marker-icon.png"){ 
                var ratio = (25/41); // Original size of the marker-icon
                var temp = [ratio * newSize*2, newSize*2];
                icon.options.iconSize = temp;
                icon.options.iconAnchor = [temp[0]/2,temp[1]];
                icon.options.shadowSize = [newSize*2, newSize*2];
                layer.setIcon(icon);
            }
        }   
        // Check if the layer is a Polyline
        else if (layer instanceof L.Polyline || layer instanceof L.CircleMarker) { 
            // Check if the polyline has an original weight
            if (layer.options.originalWeight || layer.options.originalStrokeWidth) {                        
                var newWeight = layer.options.originalWeight ? magicWeight(layer.options.originalWeight) : magicWeight(layer.options.originalStrokeWidth);
                // Update the polyline's weight
                layer.setStyle({ weight: newWeight });
            };
            if (layer.options.originalRadius) {        
               // var newRadius = magicWeight(layer.options.originalRadius)
                // Update the radius of the circle marker
                layer.setRadius(newSize/2);
            };
             // Check if the layer is a Marker
            if (layer instanceof L.CircleMarker) {
                // Bring the marker to the front
                layer.bringToFront();
            };      
        }
    });
}

// Function to add a popup to all elements in a feature group.
/** 
 * The popups contain all properties of the element in the format "property: value".
 *
 * @param {L.FeatureGroup} featureGroup - The feature group containing the elements.
 * @param {string[]} propertiesToShow - The properties to show in the popup.
 */
export function addPopUpToElementsTechnicalLayers(featureGroup, imageNamesList, sidebar, alwaysKeepClickable = false) {
    // If the feature group is not an instance of L.FeatureGroup, throw an error
    if (!(featureGroup instanceof L.FeatureGroup)) {
        throw new Error('Parameter "featureGroup" must be a Leaflet FeatureGroup instance');
    }
    // If the feature Group has propertiesToShow, assign it to the variable
    let propertiesToShow = (typeof featureGroup.getPropertiesToShow === 'function') ? featureGroup.getPropertiesToShow() : [];
    
    let propertiesToExclude = (typeof featureGroup.getPropertiesToExclude === 'function') ? featureGroup.getPropertiesToExclude() : [];
    // If the feature Group has propertyNameMap, assign it to the variablelet propertiesToShow = [];
    let propertyNameMap = (typeof featureGroup.getPropertyNameMap === 'function') ? featureGroup.getPropertyNameMap() : {};
    
    // Iterate over all layers in the feature group
    featureGroup.eachLayer(function(layer) {
        var sidebarInfoContent = "";
        // Iterate over all properties of the layer
        // Check if the layer is a LayerGroup
        if (layer instanceof L.LayerGroup) {
            // Iterate over all layers in the LayerGroup
            layer.eachLayer(function(subLayer) {
                if (subLayer.feature && subLayer.feature.properties && subLayer.feature.properties.name) {
                    sidebarInfoContent = fillPopupContentTechnicalLayers(subLayer, sidebarInfoContent, propertiesToShow, propertiesToExclude, propertyNameMap)
                } else console.warn('To many encapsulated layerGroups in the featureGroup. Only one layerGroup is supported.');
            });
        } else {
            sidebarInfoContent = fillPopupContentTechnicalLayers(layer, sidebarInfoContent, propertiesToShow, propertiesToExclude, propertyNameMap)
        }
        // Show popupContent in leaflet-sidebar-v2 when layer is clicked.
        layer.on('click', function(e) {
            // Check if there is a image for the popup.
            let popupImages = [];
            if (imageNamesList && e.target.feature.properties.filename){
                // Find the image with the filename teh same as filename saved in the clicked target properties.
                popupImages = imageNamesList.filter(image => image.fileName.includes(e.target.feature.properties.filename));
            }
            //images.filter(image => image.fileName.includes(e.target.feature.properties.filename));
            let sidebarInfoImages = "";
            if (popupImages.length > 0) {
                for (let i = 0; i < popupImages.length; i++) {
                    sidebarInfoImages += "<img src='" + popupImages[i].path  + "' alt='Image " + 
                    popupImages[i].fileName + "' style='width:100%;'>";
                }
            }
            // If the popup content is only one picture, open a real popup
            if (sidebarInfoContent.trim() === "" && popupImages.length === 1) {
                // Create a new popup with the custom class
                var popup = L.popup({ className: 'custom-popup', closeButton: false });
                // Bind the popup to the layer
                layer.bindPopup(popup);
                // Set the content of the popup
                popup.setContent(sidebarInfoImages);
                // Open the popup
                layer.openPopup();
            } else {
                // Add content to existing panel 'furtherInfoPanel' without changing the existing title and existing content saved in 'pane'
                var furtherInfoContent = document.getElementById('furtherInfoContent');
                furtherInfoContent.innerHTML = sidebarInfoContent + sidebarInfoImages;
                sidebar.open('furtherInfoPanel');
            }
            L.DomEvent.stopPropagation(e);
        });

        layer.alwaysKeepClickable = alwaysKeepClickable;

        // Add a tooltip to the layer, so when the mouse stays on it without click
        // the name of the layer is shown.
        if (layer.feature && layer.feature.properties && layer.feature.properties.name) {
            layer.bindTooltip(layer.feature.properties.name);
        }
        //layer.bindPopup(popupContent);
    });
}

function createImagePath(path) {
    if (!path.endsWith('/')) {
        path += '/';
    }
    return path;
}

/**
 * Fills the popup content with properties from a layer feature.
 *
 * @param {Object} layer - The layer object containing the feature.
 * @param {string} popupContent - The current content of the popup.
 * @param {string[]} propertiesToShow - An array of properties to include in the popup content. If empty, all properties will be included.
 * @param {string[]} propertiesToExclude - An array of properties to exclude from the popup content.
 * @param {Object} propertyNameMap - An object mapping original property names to new property names.
 * @returns {string} - The updated popup content.
 */

function fillPopupContentTechnicalLayers(layer, popupContent, propertiesToShow, propertiesToExclude, propertyNameMap) {
    for (var property in layer.feature.properties) {
        // Check if the propertiesToShow array is empty or if the property is in the array
        if ((propertiesToShow.length === 0 || propertiesToShow.includes(property)) && !propertiesToExclude.includes(property)) {
            // Check if the propertyNameMap is not empty
            //if (Object.keys(propertyNameMap).length > 0) {
                // Get the new property name from the propertyNameMap, if it exists
                let propertyName = (propertyNameMap[property]) ? propertyNameMap[property] : property;
                let propertyValue = (layer.feature.properties[property] !== null) ? layer.feature.properties[property] : "N/A";
                // Add the  property name and value to the popupContent
                popupContent += "<b>" + propertyName + "</b>: " + propertyValue + "<br>";
            //}
        }
    }
    return popupContent;
}

/**
 * Enlarges the size of markers and polylines on hover.
 * 
 * @param {L.Layer} layer - The Leaflet layer object.
 * @param {L.Map} map - The Leaflet map object.
 * 
 */
export function enlargeOnHover(layer) {
    let hoverFactor = 1.25;
    let hoverFactorCircle = 1.5;
    layer.on('mouseover', function(e) {
        layer.options.hovered = true;
        // Check if the layer is a Marker
        if (layer instanceof L.Marker) {
            var icon = layer.options.icon;
            if (icon && icon.options && Array.isArray(icon.options.iconSize)) {
                // Increase the icon size
                icon.options.iconSize = icon.options.iconSize.map(size => size * hoverFactor);
                // Set the updated icon to the marker
                layer.setIcon(icon);
            }
        }
        // Check if the layer is a Polyline
        else if (layer instanceof L.Polyline) {
            // Increase the polyline's weight
            layer.setStyle({ weight: layer.options.weight * hoverFactor });
        }
        // Check if the layer is a CircleMarker
        else if (layer instanceof L.CircleMarker) {
            // Increase the radius of Circle Marker
            layer.setStyle({ radius: layer.options.radius * hoverFactorCircle });
        }
    });

    layer.on('mouseout', function(e) {
        layer.options.hovered = false;
        // Check if the layer is a Marker
        if (layer instanceof L.Marker) {
            var icon = layer.options.icon;
            if (icon && icon.options && Array.isArray(icon.options.iconSize)) {
                // Reset the icon size
                icon.options.iconSize = icon.options.iconSize.map(size => size / hoverFactor);
                // Set the updated icon to the marker
                layer.setIcon(icon);
            }
        }
        // Check if the layer is a Polyline
        else if (layer instanceof L.Polyline) {
            // Reset the polyline's weight
            layer.setStyle({ weight: layer.options.weight / hoverFactor });
        }
        // Check if the layer is a CircleMarker
        else if (layer instanceof L.CircleMarker) {
            // Reset the radius of Circle Marker
            layer.setStyle({ radius: layer.options.radius / hoverFactorCircle });
        }
    });
}