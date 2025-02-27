
import {getHTMLMainDescriptionText } from "./custom-settings.js";
/**
 * Adds sidebar main info to the sidebar container.
 * 
 * @param {Sidebar} sidebar - The sidebar container.
 * @param {string} projectDescription - The project description, initially defined in custom-settings.js.
 * @returns {Promise<void>} - A promise that resolves when the sidebar main info is added.
 */
export async function addSidebarMainInfo(sidebar, projectDescription){

    if (!sidebar.getContainer().querySelector('#projectInfoPanelContent')) {
        console.warn('The sidebar does not contain an element with the id "projectInfoPanelContent".');
        return;
    }

    let infoText = projectDescription;
    infoText = await getHTMLMainDescriptionText(projectDescription);

    // Scan infotext.innerHTML for keywords and add a icon and refereence link to specific sidebar panels
    // The keywords are case insensitive

    // Define a mapping of keywords to URLs or sidebar panel IDs
    const keywordMap = {
        "Legende": {
            id: "#geoJSONLayerCheckbox",
            icon: '<i class="bi bi-stack"></i>'
        },
        "Hintergrundkarten": {
            id: "#backgroundMapControlPanel",
            icon: '<i class="bi bi-map-fill"></i>'
        },
    };

    replaceKeywordsWithLinks(keywordMap, infoText);
    
    // Set the innerHTML of the projectInfoPanelContent element to the modified infoText
    sidebar.getContainer().querySelector('#projectInfoPanelContent').innerHTML = infoText.innerHTML;

    // Add a 'click' event listener to the document body
    document.body.addEventListener('click', function(event) {
        // Check if the clicked element is a hyperlink with the class 'sidebar-link'
        if (event.target.tagName === 'A' && event.target.classList.contains('sidebar-link')) {
            // Prevent the default link behavior
            event.preventDefault();

            // Open the sidebar panel
            sidebar.open(event.target.getAttribute('href').slice(1)); // Remove the '#' from the id
        }
    });
}

/**
 * Replaces keywords in the infoText with hyperlinks based on the keywordMap.
 * @param {Object} keywordMap - An object mapping keywords to their sidebar panel IDs and icons.
 * @param {HTMLElement} infoText - The HTML element containing the text to be processed.
 */
export function replaceKeywordsWithLinks(keywordMap, infoText) {
    // Iterate over the keywordMap object
    for (let keyword in keywordMap) {
        // Create a new RegExp object for the keyword
        //let regex = new RegExp(`(\\b${keyword}\\b)`, 'gi');
        let regex = new RegExp(`(?<!\\w)(['"„“]?)(\\b${keyword}\\b)(['"„“]?)(?!\\w)`, 'gi');

        // Replace the keyword with a hyperlink
        infoText.innerHTML = infoText.innerHTML.replace(regex, function(match) {
            // Get the sidebar panel ID and icon for the matched keyword
            let { id, icon } = keywordMap[keyword];
            // If match starts and ends with a whitespace
            if (match.startsWith(' ') && match.endsWith(' ')) {
                return `<a href="${id}" class="sidebar-link" style="text-decoration: none;"> "${keyword}" ${icon} </a>`;
            } else { // Replace the keyword with a hyperlink, placing the icon inside the hyperlink but outside of the quotes
                return `<a href="${id}" class="sidebar-link" style="text-decoration: none;">"${keyword}" ${icon}</a>`;
            }
        });
    }
    // Check for double "" or '" or "' in the text and replace them with a single "
    //infoText.innerHTML = infoText.innerHTML.replace(/\"\"/g, '"');
    infoText.innerHTML = infoText.innerHTML.replace(/""/g, '"');
}

export function createSidebar(map){
    var sidebar = L.control.sidebar({
        autopan: true,       // whether to maintain the centered map point when opening the sidebar
        closeButton: true,    // whether to add a close button to the panes
        container: 'mysidebar', // the DOM container or #ID of a predefined sidebar container that should be used
        position: 'left',     // left or right
    });
    map.addControl(sidebar);
    createSidebarPanels(sidebar);
    return sidebar;
}

function createSidebarPanels(sidebar){

     var infoSidePanel = {
        id: 'projectInfoPanelID',                     // UID, used to access the panel
        tab: '<i class="bi bi-bicycle"></i>',  // content can be passed as HTML string,
        title: 'Radschnellweg',              // an optional pane header
        pane: ''+'<div id="projectInfoPanelContent"></div>', // 'Informationen über den Radschnellweg',
        position: 'top'                  // optional vertical alignment, defaults to 'top'
    };

    var furtherInfoPanel = {
        id: 'furtherInfoPanel',                     // UID, used to access the panel
        tab: '<i class="bi bi-cone-striped"></i>',  // content can be passed as HTML string,
        title: 'Weitere Informationen',              // an optional pane header
        pane: '' +                              //'Content of popup windows and further explanations' +
        '<div id="furtherInfoContent">Klicken Sie auf Elemente, zu denen Sie weitere Informationen erfahren wollen.</div>',
        position: 'top'                  // optional vertical alignment, defaults to 'top'
    };

    var geoJSONLayerCheckbox = {
        id: 'geoJSONLayerCheckbox',         // UID, used to access the panel
        tab: '<i class="bi bi-stack"></i>', // content can be passed as HTML string,
        title: 'Legende',                   // an optional pane header
        pane: '<div id="geoJSONLayerCheckboxDiv"></div>',                //'<h3>Choose which layers you want to show:</h3><div id="layerCheckbox"></div>',
        position: 'top'                     // optional vertical alignment, defaults to 'top'
    };

    var backmapControlPanel = {
        id: 'backgroundMapControlPanel',
        tab: '<i class="bi bi-map-fill"></i>',
        title: 'Hintergrundkarten',
        pane: '<div id="layer-control"></div>'
    };

    var contactPanel = {
        id: 'contactPanel',
        tab: '<i class="bi bi-info-circle-fill" id="contactButton"></i>',
        title: "Impressum und Datenschutz",
        button: function() {window.open('https://mobilitaetsloesung.de/kontakt/', '_blank');} //Open contact page in new tab
    };
    
    sidebar.addPanel(infoSidePanel);
    sidebar.addPanel(furtherInfoPanel);
    sidebar.addPanel(geoJSONLayerCheckbox);
    sidebar.addPanel(backmapControlPanel);
    sidebar.addPanel(contactPanel);

    sidebar.open('projectInfoPanelID');
    
    /**
    // Listen for the 'content' event on the sidebar to detect when the panel is closed
    sidebar.on('content', function(e) {
        // e.id contains the id of the opened panel
        if (e.id !== 'furtherInfoPanel' && e.id !== 'furtherInfoContent') {
            // The panel for more information for clicked elements has been closed
            // Get the div
            var abschnittInfoContent = document.getElementById('furtherInfoContent');
            // Set the default text
            abschnittInfoContent.innerHTML = 
                'Klicken Sie auf Elemente, zu denen Sie weitere Informationen erfahren wollen.';
        }
    })
    */
}