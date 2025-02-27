import { createLegendSymbol } from "./create-legend-symbols.js";
import { makeULDivCollapsable } from "./collapsable-list.js";
import { enlargeOnHover, updateMarkerIconSize } from "./map-style-functions.js";

/**
 * Adds a checkbox layer switcher to the sidebar panel with id 'geoJSONLayerCheckbox'.
 * @param {Layer} featureGroup - The feature group to add the checkbox for.
 * @param {Map} map - The map object.
 * @param {Sidebar} sidebar - The sidebar object.
 */
export function addCheckboxLayerSwitcher(featureGroup, map, sidebar){
    if (!document.getElementById('geoJSONLayerCheckbox')){
        // If the sidebar panel with id 'geoJSONLayerCheckbox' does not exist, 
        // return because there is no need of the checkboxes for layers -> see sidebar-main.js to add one!
        return; 
    }

    let geoJSONLayerCheckboxContent = document.getElementById('geoJSONLayerCheckboxDiv');
    if (geoJSONLayerCheckboxContent.querySelector('ul') === null){
        let ul = document.createElement('ul');
        geoJSONLayerCheckboxContent.appendChild(ul);
        geoJSONLayerCheckboxContent = ul;
    } else {
        geoJSONLayerCheckboxContent = geoJSONLayerCheckboxContent.querySelector('ul');
    }

    let name = (featureGroup.getLayerName !== undefined) ? featureGroup.getLayerName() : 'noName';

    let checkbox;
    let parentDiv;
    let label;
    if(document.getElementById(name)){
        checkbox = document.getElementById(name);
        parentDiv = checkbox.parentElement;
        label = checkbox.nextSibling;
    } else {
        // Create a new div element for whole featureGroup
        parentDiv = document.createElement('li');
        parentDiv.classList.add('legend');

        // Create a new checkbox element for the whole featureGroup
        checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = name;
        checkbox.checked = map.hasLayer(featureGroup);
        checkbox.style.transform = 'scale(0.8)';

        parentDiv.prepend(checkbox);

        // Create a new label element for the whole featureGroup with name of the featureGroup
        label = document.createElement('label');
        label.htmlFor = name;
        label.style = 'white-space: normal; flex-grow: 1; font-weight: bold;';
        label.appendChild(document.createTextNode(name)); 

        parentDiv.appendChild(label);
    }

    // split layers of featureGroup into subgroups depending on stroke color.
    let layers = featureGroup.getLayers();
    let colors = {};
    layers.forEach(layer => {
        let color = layer.options.color;
        colors[color] = colors[color] || [];
        colors[color].push(layer);
    });
    
    // Add a checkbox for each color group
    // If there is only one color, add the color to the label
    // If there are multiple colors, add a checkbox for each color group
    try{
        if (Object.keys(colors).length > 1){
            var childsUL;
            if(parentDiv.querySelectorAll('ul').length === 0){
                childsUL = document.createElement('ul');
                parentDiv.appendChild(childsUL);
            } else{
                childsUL = parentDiv.querySelectorAll('ul')[0];
            }
            for (const color in colors){
                let colorFeatureGroup = L.featureGroup(colors[color]);
                let colorCheckbox = addColorLayerCheckbox(color, colors[color][0], name, childsUL);
                checkboxLayerAddRemoveHandler(colorCheckbox, map, colorFeatureGroup);
            }
            makeULDivCollapsable(parentDiv);
        } else if (!label.querySelector('img') && (!label.querySelector('div') || 
        label.querySelector('div').getAttribute('id')===null)){
            let onlyColor = Object.keys(colors)[0];
            let exampleLayer = colors[onlyColor][0];
            // Create a color symbol for the label in the legend
            let stroke = createLegendSymbol(exampleLayer, onlyColor);
            if (stroke) label.insertBefore(stroke, label.firstChild);
        }
    } catch (e){
        throw new Error('Error in addCheckboxLayerSwitcher when trying to add symbol to label: ' + e);
    }

    // Add content to existing panel 'furtherInfoPanel' without changing the existing title and existing content saved in 'pane'
    checkboxLayerAddRemoveHandler(checkbox, map, featureGroup);
    geoJSONLayerCheckboxContent.appendChild(parentDiv);
}

/**
 * Creates a color layer checkbox and adds it to the specified parent element.
 *
 * @param {string} color - The color of the checkbox.
 * @param {object} exampleLayer - The example layer object.
 * @param {string} type - The type or name of the layer (see layerstyle-classes.js).
 * @param {HTMLElement} parentDivUL - The parent element to which the checkbox and li-element will be added.
 * @returns {HTMLInputElement} - The created color checkbox element.
 */
function addColorLayerCheckbox(color, exampleLayer, type, parentDivUL){
        if (document.getElementById(type + color)){
            return document.getElementById(type + color)
        }
        
        let colorDiv = document.createElement('li');
        colorDiv.classList.add('align-center', 'legend');

        // Create a new checkbox element
        var colorCheckbox = document.createElement('input');
        colorCheckbox.type = 'checkbox';
        colorCheckbox.id = type + color;
        colorCheckbox.checked = true;
        colorCheckbox.style.transform = 'scale(0.7)';

        colorDiv.prepend(colorCheckbox);

        // Create a new div element for the color
        let stroke = createLegendSymbol(exampleLayer, color);

        // Create a new label element
        var colorLabel = document.createElement('label');
        colorLabel.htmlFor = type + color;
        colorLabel.style.whiteSpace = 'normal';
        colorLabel.style.flexGrow = '1';
        let divlabel = (exampleLayer.options.label !== undefined) ? exampleLayer.options.label : color; 
        colorLabel.appendChild(stroke);
        colorLabel.appendChild(document.createTextNode(divlabel));


        // If parentDivUL.querySelector('input[type="checkbox"]').checked is false,
        // color the checkboy and the label sliglty grey.
        var trueParentDiv;
        if (parentDivUL.nodeName === 'UL' && parentDivUL.parentElement.querySelector('input[type="checkbox"]')){
            trueParentDiv = parentDivUL.parentElement;
        } else if (parentDivUL.querySelector('input[type="checkbox"]')){
            trueParentDiv = parentDivUL;
        } else {
            console.warn('Neither the parent of parentDivUL nor the parentDivUL itself has a checkbox');
        }

        if (!trueParentDiv.querySelector('input[type="checkbox"]').checked){
            colorCheckbox.style.filter = 'grayscale(70%)';
            colorLabel.style.filter = 'grayscale(70%)';
        }

        colorDiv.appendChild(colorLabel);       
        parentDivUL.appendChild(colorDiv);
        return colorCheckbox;
}

/**
 * Adds an event listener to the checkbox to handle the addition and removal of layers based on the checkbox state.
 * 
 * @param {HTMLInputElement} checkbox - The checkbox input element that triggers the layer addition/removal.
 * @param {Map} map - The map object.
 * @param {Layer} featureGroup - The feature group to add or remove from the map.
 * 
 */
function checkboxLayerAddRemoveHandler(checkbox, map, featureGroup){
    // Add an event listener to the checkbox
    if (!featureGroup instanceof L.LayerGroup) return;
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            /** Without looping over each layer, the layer is not directly removed when clicking 
             * the checkbox inside the list. Because regardeless of the unique id, 
             * the layer is not removed from the map, when color checkboxes are first clicked.
             * Otherwise map.addLayer(featureGroup) would be enough.
             */
            featureGroup.eachLayer(function(layer){
                if(!map.hasLayer(layer)){
                    map.addLayer(layer);
                    enlargeOnHover(layer);
                }
            });
            if (this.style.filter !== 'none'){
                this.style.filter = 'none';
                if(this.nextSibling.nodeName.toLowerCase() === 'label'){
                    this.nextSibling.style.filter = 'none';
                }
            }
            updateMarkerIconSize(featureGroup, map.getZoom());
        } else {
            featureGroup.eachLayer(function(layer){
                map.removeLayer(layer);
            });
        }
        if (checkbox.parentElement.querySelector('ul')){
            checkboxLayerAddRemoveHandlerHelper(checkbox);
        }
    });
}


/**
 * This function is a helper for handling the addition and removal of layers based on checkbox state.
 * It takes a checkbox as an argument and applies a grayscale filter to the child checkboxes and their labels
 * if the parent checkbox is unchecked. If the parent checkbox is checked, it removes any grayscale filter from the child checkboxes and their labels.
 *
 * @param {HTMLInputElement} checkbox - The checkbox input element that triggers the layer addition/removal.
 */
function checkboxLayerAddRemoveHandlerHelper(checkbox) {
    // Get the checked state of the checkbox
    let checked = checkbox.checked;

    // Get the parent div of the checkbox
    let parentCheckboxDiv = checkbox.parentElement;

    // Select all child divs of the parent div
    let childInputCheckboxes = parentCheckboxDiv.querySelectorAll('input');

    // Iterate over each child div
    childInputCheckboxes.forEach(function(colorCheckbox, index) {
        // Skip the first child input, which is the checkbox we started with
        if (index === 0) return;
        // If childDiv has a colorCheckbox, remove any grayscale filter if checked is true,
        // otherwise add a grayscale filter if checked is false
        if (colorCheckbox.parentElement.nodeName.toLowerCase() === 'li'){
            if(colorCheckbox.nextSibling.nodeName.toLowerCase() === 'label'){
            let label = colorCheckbox.nextSibling;
            if (checked){
                // Remove any grayscale filter from the colorCheckbox and its label
                colorCheckbox.style.filter = 'none';
                label.style.filter = 'none';
                colorCheckbox.checked = true;
            } else {
                // Add a grayscale filter to the colorCheckbox and its label
                colorCheckbox.style.filter = 'grayscale(70%)';
                label.style.filter = 'grayscale(70%)';
            }
        }}
    });
}


