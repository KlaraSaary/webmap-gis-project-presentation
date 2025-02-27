
import * as settings from './custom-settings.js';


/**
 * Custom class for Querungen layer style.
 * @class Querungen
 * @extends L.GeoJSON
 * @memberof module:LayerstyleClasses
 */
export const Querungen = L.GeoJSON.extend({
    initialize: function(geojson, options, filename) {
        L.GeoJSON.prototype.initialize.call(this, geojson, options);
        this._propertiesToShow = (settings.propertiesToShow[filename] !== undefined) ? settings.propertiesToShow[filename] : []; 
        this._propertiesToExclude = (settings.propertiesToExclude[filename] !== undefined) ? settings.propertiesToExclude[filename] : [];
        // Set new Names for the properties to show in the popup
        this._propertyNameMap = (settings.propertyNameMap[filename] !== undefined) ? settings.propertyNameMap[filename] : [];
        this._layerName = (settings.layerName[filename] !== undefined) ? settings.layerName[filename] : "Querungsformen";
    },
    options: {
        pointToLayer: function(feature, latlng) {
            //var latlng = L.latLng(feature.geometry['coordinates']);
            var pathToSVGMarkers = '../../images';
            var QuerungenIcons = L.Icon.extend({
                options: {
                    iconSize: [15, 15]
                }
            });
            var customIcon = new QuerungenIcons({
                iconUrl: L.Icon.Default.imagePath
            });
            var path = {join: function (string1, string2, string3){
                return [string1,string2,string3].join('/');
            }};
            var LSA = feature.properties['LSA'];
            var Highway = feature.properties['highway'];
            var Crossing = feature.properties['crossing'];
            var FSA = feature.properties['fsa'];
            var Zebra = feature.properties['zebra'];
            var Insel = feature.properties['Insel'];
            var Crossing_i = feature.properties['crossing_i'];
            var Unterfuehr = feature.properties['Unterfuehr'];
            var Ueberfuehr = feature.properties['Ueberfuehr'];
            var VB = feature.properties['VB'];
            var TZ30 = feature.properties['TZ30'];

            if (LSA =='1' || Highway=='traffic_signals'){
                customIcon.options.iconUrl = [pathToSVGMarkers, '01_SMM_Grundplan', 'Ampel_LSA.svg'].join('/');
            } else if ((Highway  ==  'crossing' &&  Crossing  ==  'traffic_signals' ) || FSA == '1'){
                customIcon.options.iconUrl = path.join(pathToSVGMarkers, '01_SMM_Grundplan', 'Ampel_FSA.svg');
            } else if (Zebra == '1' || (
                Highway == 'crossing' && (
                Crossing == 'Zebra' ||
                Crossing == 'uncontrolled' ||
                Crossing == 'marked'))){
                customIcon.options.iconUrl = path.join(pathToSVGMarkers, '01_SMM_Grundplan', 'Fußgängerüberweg-Zebrastreifen.svg');
            } else if (Insel == '1' || Crossing_i == '1'){
                customIcon.options.iconUrl = path.join(pathToSVGMarkers, '01_SMM_Grundplan', 'Mittelinsel.svg');
            } else if (Unterfuehr == '1'){
                customIcon.options.iconUrl = path.join(pathToSVGMarkers, '01_SMM_Grundplan', 'Unterführung.svg');
            } else if (Ueberfuehr == '1'){
                customIcon.options.iconUrl = path.join(pathToSVGMarkers, '01_SMM_Grundplan', 'Brücke_Überführung.svg');
            } else if (VB == '1'){
                    customIcon.options.iconUrl = path.join(pathToSVGMarkers, '01_SMM_Grundplan', 'verkehrsberuhigter_Bereich.svg');
            } else if (TZ30 == '1'){
                    customIcon.options.iconUrl = path.join(pathToSVGMarkers, '01_SMM_Grundplan', 'Tempo_30-Zone.svg');
            }else{
                customIcon.options.iconUrl = [pathToSVGMarkers, '01_SMM_Grundplan', 'Mittelinsel.svg'].join('/');
            }
            return L.marker(latlng,{icon: customIcon});
    }},
    getLayerName() {
        return this._layerName;
    },
    getPropertyNameMap() {
        return this._propertyNameMap;
    },
    getPropertiesToShow() {
        return this._propertiesToShow;
    }
});


/**
 * Custom class for Laufrouten layer style.
 * @class Laufrouten
 * @extends L.GeoJSON
 * @memberof module:LayerstyleClasses
 */
export const Laufrouten = L.GeoJSON.extend({
    initialize: function(geojson, options, filename) {
        L.GeoJSON.prototype.initialize.call(this, geojson, options);
        this._propertiesToShow = (settings.propertiesToShow[filename] !== undefined) ? settings.propertiesToShow[filename] : []; 
        this._propertiesToExclude = (settings.propertiesToExclude[filename] !== undefined) ? settings.propertiesToExclude[filename] : [];
        // Set new Names for the properties to show in the popup
        this._propertyNameMap = (settings.propertyNameMap[filename] !== undefined) ? settings.propertyNameMap[filename] : [];
        this._layerName = (settings.layerName[filename] !== undefined) ? settings.layerName[filename] : "Laufrouten";
    },
    options: {
        // Define default style options
        style: function(feature) {
            // Default style properties
            var defaultStyle = {
                fillColor: '#b9e1e4',
                fillOpacity: 0.2,
                label: 'Anzahl Schulkinder: ' + feature.properties['Anzahl SuS'],
                
            };
      
      // Check feature properties
      var anzahlSuS = feature.properties['Anzahl SuS'];
      if (anzahlSuS <= 2) {
          // Set style for 'Anzahl SuS' <= 2
          defaultStyle =Object.assign({}, defaultStyle, {
              color: '#4d4d4d',
              weight: 2
          });
      } else if (anzahlSuS >= 3 && anzahlSuS <= 4) {
          // Set style for 'Anzahl SuS' between 3 and 4
          defaultStyle =Object.assign({}, defaultStyle, {
              color: '#b9e1e4',
              weight: 3.5
          });
      } else if (anzahlSuS >= 5 && anzahlSuS <= 10) {
          // Set style for 'Anzahl SuS' between 3 and 4
          defaultStyle =Object.assign({}, defaultStyle, {
              color: '#6688cc',
              weight: 4
          });
      } else if (anzahlSuS >= 11 && anzahlSuS <= 20) {
          // Set style for 'Anzahl SuS' between 3 and 4
          defaultStyle =Object.assign({}, defaultStyle, {
              color: '#44bb55',
              weight: 5
          });
      } else if (anzahlSuS >= 21 && anzahlSuS <= 50) {
          // Set style for 'Anzahl SuS' between 3 and 4
          defaultStyle =Object.assign({}, defaultStyle, {
              color: '#ee6600',
              weight: 6
          });
      } else if (anzahlSuS > 50) {
          // Set style for 'Anzahl SuS' between 3 and 4
          defaultStyle =Object.assign({}, defaultStyle, {
              color: '#ee1100',
              weight: 7.5
          });
      } 
      defaultStyle =Object.assign({}, defaultStyle, {
        originalWeight: defaultStyle.weight
      });
      return defaultStyle;
    }},
    getLayerName() {
        return this._layerName;
    },
    getPropertyNameMap() {
        return this._propertyNameMap;
    },
    getPropertiesToShow() {
        return this._propertiesToShow;
    }
});

/**
 * Custom class for Radschnellweg layer style.
 * @class Radschnellweg
 * @extends L.GeoJSON
 * @memberof module:LayerstyleClasses
 */
export const Fuehrungsform = L.GeoJSON.extend({
    initialize: function(geojson, options, filename) {
        L.GeoJSON.prototype.initialize.call(this, geojson, options);
        this._propertiesToShow = (settings.propertiesToShow[filename] !== undefined) ? settings.propertiesToShow[filename] : []; 
        this._propertiesToExclude = (settings.propertiesToExclude[filename] !== undefined) ? settings.propertiesToExclude[filename] : [];
        // Set new Names for the properties to show in the popup
        this._propertyNameMap = (settings.propertyNameMap[filename] !== undefined) ? settings.propertyNameMap[filename] : [];
        this._layerName = (settings.layerName[filename] !== undefined) ? settings.layerName[filename] : "Führungsform im Bestand";
    },
    options: {
        // Define default style options
        style: function(feature) {
            // Default style properties
            var defaultStyle = {
                color: '#d5ff01',
                weight: 5
            };
      
            // Check feature properties
            var bestand = feature.properties['Bestand'];
            if (bestand == 1) {
                defaultStyle =Object.assign({}, defaultStyle, {
                    color: '#33a02c',
                    label: 'Radfahrstreifen'            
                });
            } else if (bestand == 2) {
                defaultStyle =Object.assign({}, defaultStyle, {
                    color: '#8d5a99',
                    label: 'Schutzstreifen'
                });
            } else if (bestand == 3) {
                defaultStyle =Object.assign({}, defaultStyle, {
                    color: '#4628bb',
                    label: ' Getrennter Geh- und Radweg'
                });
            } else if (bestand == 4) {
                defaultStyle =Object.assign({}, defaultStyle, {
                    color: '#4362ff',
                    label: 'Gemeinsamer Geh- und Radweg'
                });
            } else if (bestand == 5) {
                defaultStyle =Object.assign({}, defaultStyle, {
                    color: '#a6cee3',
                    label: 'Mischverkehr'
                });
            } else if (bestand == 6) {
                defaultStyle =Object.assign({}, defaultStyle, {
                    color: '#c5886d',
                    label: 'Land- und Forstwirtschaftlicher Weg'
                });
            } else if (bestand == 7) {
                defaultStyle =Object.assign({}, defaultStyle, {
                    color: '#191919',
                    label: 'unklar/unbekannt'
                });
            } else if (bestand == 8) {
                defaultStyle =Object.assign({}, defaultStyle, {
                    color: '#c40300',
                    label: 'Netzlücke/ kein Weg/ Verbot Radverkehr'
                });
            } else if (bestand == 9) {
                defaultStyle =Object.assign({}, defaultStyle, {
                    color: '#fb9a99',
                    label: 'Ingenieurbauwerk'
                });
            } else if (bestand == 10) {
                defaultStyle =Object.assign({}, defaultStyle, {
                    color: '#ff7f00',
                    label: 'Gehweg + Rad frei/Fußgängerzone'
                });
            } else if (bestand == 11) {
                defaultStyle =Object.assign({}, defaultStyle, {
                    color: '#4362ff',
                    label: 'Radweg im Bau'
                });
            } else if (bestand == 12) {
                defaultStyle =Object.assign({}, defaultStyle, {
                    color: '#e1be24',
                    label: 'Verkehrsberuhigter Bereich'
                });
            }
            defaultStyle =Object.assign({}, defaultStyle, {
                originalWeight: defaultStyle.weight
            });
            return defaultStyle;
        },
    },
    getLayerName() {
        return this._layerName;
    },
    getPropertyNameMap() {
        return this._propertyNameMap;
    },
    getPropertiesToShow() {
        return this._propertiesToShow;
    }
});


export const Massnahmen = L.GeoJSON.extend({
    initialize: function(geojson, options, filename) {
        this._propertiesToShow = (settings.propertiesToShow[filename] !== undefined) ? settings.propertiesToShow[filename] : []; 
        this._propertiesToExclude = (settings.propertiesToExclude[filename] !== undefined) ? settings.propertiesToExclude[filename] : [];
        // Set new Names for the properties to show in the popup
        this._propertyNameMap = (settings.propertyNameMap[filename] !== undefined) ? settings.propertyNameMap[filename] : [];
        this._layerName = (settings.layerName[filename] !== undefined) ? settings.layerName[filename] : "Empfehlungsvariante";
        /**
        if (geojson.features[0].geometry.type.includes('Line')) {
            this._layerName = (settings.layerName[filename] !== undefined) ? settings.layerName[filename] : "Streckenverlauf der Empfehlungsvariante";
        }else if (geojson.features[0].geometry.type.includes('Point')) {
            this._layerName = (settings.layerName[filename] !== undefined) ? settings.layerName[filename] : "Knotenpunkte auf der Empfehlungsvariante";
            if (settings.propertyNameMap[filename] !== undefined) {
                Object.assign(this._propertyNameMap, settings.propertyNameMap[filename]);
            } else {
                this._propertyNameMap = {};
            }
        }else 
            this._layerName = "Empfehlungsvariante"; */
        L.GeoJSON.prototype.initialize.call(this, geojson, options);
    },
    options: {
        // Define default style options
        style: function(feature) {
            // Default style properties
            var defaultStyle = { 
                weight: 5
            };
            // If the feature is a LineString, set the stroke color to '#eb6408'
            if (feature.geometry.type.includes('Line')) {
                defaultStyle.color = '#4555e4';
            }
            return defaultStyle;
        },
        pointToLayer: function(feature, latlng,options) {
            // Use a circle marker for Point features
            if (feature.geometry.type === 'Point') {
                var marker = L.circleMarker(latlng,{
                    radius: 5, 
                    // yellow-ish color for good visibility even with color-blindness
                    color: '#eba608', //'#599000', 
                    fillColor: '#ebc508',//'#82ba26', 
                    fillOpacity: 0.9,
                    weight: 2,
                    pane: 'markerPane'
                });
                marker.options.originalRadius = marker.options.radius;
                marker.options.originalStrokeWidth = marker.options.weight;
                marker.on('add', function() {
                    this.bringToFront();
                });

                marker.getLayerName = function() {
                    return this._layerName;
                };  
                marker.getPropertyNameMap = function() {
                    return this._propertyNameMap;
                };
                return marker;
            }
        }
    },
    getLayerName() {
        return this._layerName;
    },
    getPropertyNameMap() {
        return this._propertyNameMap;
    },
    getPropertiesToShow() {
        return this._propertiesToShow;
    },
    getPropertiesToExclude() {
        return this._propertiesToExclude;
    }

});

export const Schutzgebiete = L.GeoJSON.extend({

    initialize: function(geojson, options, filename) {
        L.GeoJSON.prototype.initialize.call(this, geojson, options);
        this._propertiesToShow = (settings.propertiesToShow[filename] !== undefined) ? settings.propertiesToShow[filename] : []; 
        this._propertiesToExclude = (settings.propertiesToExclude[filename] !== undefined) ? settings.propertiesToExclude[filename] : [];
        // Set new Names for the properties to show in the popup
        this._propertyNameMap = (settings.propertyNameMap[filename] !== undefined) ? settings.propertyNameMap[filename] : [];
        this._layerName = (settings.layerName[filename] !== undefined) ? settings.layerName[filename] : "Schutzgebiete";
    },
    options: {
        // Define default style options
        style: function(feature) {
            // Default style properties
            var defaultStyle = {
                color: '#487008',
                weight: 2,
                fillOpacity: 0.7,
                pane: 'polygonPane',
            };
            return defaultStyle;     
        }
    },
    getLayerName() {
        return this._layerName;
    },
    getPropertyNameMap() {
        return this._propertyNameMap;
    },
    getPropertiesToShow() {
        return this._propertiesToShow;
    }
});

export const Fotopunkte = L.GeoJSON.extend({

    initialize: function(geojson, options, filename) {
        L.GeoJSON.prototype.initialize.call(this, geojson, options);
        this._propertiesToShow = (settings.propertiesToShow[filename] !== undefined) ? settings.propertiesToShow[filename] : []; 
        this._propertiesToExclude = (settings.propertiesToExclude[filename] !== undefined) ? settings.propertiesToExclude[filename] : [];
        // Set new Names for the properties to show in the popup
        this._propertyNameMap = (settings.propertyNameMap[filename] !== undefined) ? settings.propertyNameMap[filename] : [];
        this._layerName = (settings.layerName[filename] !== undefined) ? settings.layerName[filename] : "Foto-Dokumentation";
    },
    options: {
        pointToLayer: function(feature, latlng,options) {
            // Use a circle marker for Point features
            if (feature.geometry.type === 'Point') {
                var marker = L.circleMarker(latlng,{
                    radius: 5, 
                    
                    color: '#599000', // lila #599000' , 
                    fillColor: '#599000',//'#82ba26', 
                    fillOpacity: 0.9,
                    weight: 2,
                    pane: 'markerPane'
                });
                marker.options.originalRadius = marker.options.radius;
                marker.options.originalStrokeWidth = marker.options.weight;
                marker.on('add', function() {
                    this.bringToFront();
                });

                marker.getLayerName = function() {
                    return this._layerName;
                };  
                marker.getPropertyNameMap = function() {
                    return this._propertyNameMap;
                };
                return marker;
            }
        }
    },
    getLayerName() {
        return this._layerName;
    },
    getPropertyNameMap() {
        return this._propertyNameMap;
    },
    getPropertiesToShow() {
        return this._propertiesToShow;
    },
    getPropertiesToExclude() {
        return this._propertiesToExclude;
    }

});

/**
 * LayerstyleClasses is an object that maps class names to their corresponding classes and search terms.
 * It is populated by iterating over the ClassSearchTerms object imported from custom-settings.js.
 * For each key-value pair in ClassSearchTerms, a new entry is created in LayerstyleClasses where:
 * - the key is the class name,
 * - the value is an object containing the class and the search term.
 * 
 * This allows the classes to be dynamically selected based on the type and search term in importGeoJSONAsLayer.js.
 * 
 * @type {Object}
 */

// add explanation of how const classes works and how to deal with it

/**
 * An object that maps class names to their corresponding classes.
 * This object is used to populate the LayerstyleClasses object.
 * Each key is a class name and each value is the actual class.
 * 
 * If you add a new class to this file, you should also add it to this object. 
 * For example, if you add a new class named 'NewClass', you should update this object like so:
 * const classes = { Querungen, Laufrouten, Fuehrungsform, Massnahmen, NewClass };
 * 
 * @type {Object}
 */
const classes = { Querungen, Laufrouten, Fuehrungsform, Massnahmen , Schutzgebiete, Fotopunkte};

export var LayerstyleClasses = {};

for (const className in settings.ClassSearchTerms) {
    if (classes[className]) {
        LayerstyleClasses[className] = {
            class: classes[className],
            searchTerm: settings.ClassSearchTerms[className]
        };
    }    
}