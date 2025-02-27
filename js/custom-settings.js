/**
 * Diese Datei enthält benutzerdefinierte Einstellungen für die Website-Daten.
 * 
 * Die Einstellungen beinhalten Projektbeschreibungen, Layer-Namen, Eigenschaftsnamen, anzuzeigende und auszuschließende Eigenschaften,
 * sowie andere Einstellungen für jede Geojson-Datei. Sie enthält auch Suchbegriffe für Klassennamen.
 * 
 * Die Projektbeschreibung wird von einer angegebenen URL abgerufen und im Haupttab der Seitenleiste angezeigt.
 * 
 * Layer-Namen und ihre entsprechenden Anzeigenamen sind im 'layerName' Objekt festgelegt.
 * 
 * Das 'propertyNameMap' Objekt ordnet die Eigenschaftsnamen lesbareren und beschreibenderen Namen zu.
 * 
 * Das 'propertiesToShow' Objekt legt die für jede Geojson-Datei anzuzeigenden Eigenschaften fest.
 * Ist es leer, werden alle Eigenschaften außer denen in 'propertiesToExclude' angezeigt.
 * 
 * Das 'propertiesToExclude' Objekt legt die für jede Geojson-Datei auszuschließenden Eigenschaften fest.
 * Ist es leer, werden alle Eigenschaften oder alle in 'propertiesToShow' definierten angezeigt.
 * 
 * Das 'otherSettings' Objekt enthält andere Einstellungen für jede Geojson-Datei.
 * 
 * Das 'ClassSearchTerms' Objekt ordnet die Klassennamen ihren entsprechenden Suchbegriffen zu.
 * Der Klassenname ist der Name der Klasse, die in layerstyle-classes.js definiert wird,
 * und der Suchbegriff ist eine Teilzeichenkette, die Sie definieren können.
 */



/**
 * Beschreibung des angezeigten Projekts. Wird im Haupttab der Seitenleiste angezeigt.
 * Der einfachste Weg ist, Ihren Text aus einem Texteditor wie Word oder LibreOffice in eine HTML-Datei zu exportieren.
 * Sie können dann entweder den <body> der HTML-Datei in die Variable kopieren oder die HTML-Datei
 * auf den Server im Verzeichnis data/html-description hochladen und sie über jQuery laden.
 * 
 * Für letzteres stellen Sie entweder sicher, dass Ihre Datei 'text_web_GIS.html' heißt oder ändern Sie die Abruf-URL im untenstehenden Code.
 * Dafür finden Sie die folgende Zeile im Code unten:
 * fetch('projectDescription?project=[ÄNDERN SIE DIESE VARIABLE ZU IHREM DATEINAMEN OHNE .html]')
 * 
 * Ihr Textstil bleibt gleich wie in Ihrem Word-Dokument, außer für CSS-Stile, die in custom.css 
 * unter '#radschnellwegInfoContent p' festgelegt sind. Sollte das Body-Element Ihrer HTML-Datei andere Tags als '<p>'
 * enthalten und Sie möchten das Aussehen dieser Tags gestalten, können Sie das entsprechende Tag zum 
 * CSS-Selektor in custom.css hinzufügen (direkt hinter dem 'p' in '#radschnellwegInfoContent p').
 * 
 * @type {string}
*/
export const projectDescription = document.createElement('div');

//Füge deinen Infotext hinter dem Gleichheitszeichen ein und setze ihn in Anführungszeichen.
projectDescription.innerHTML = '';

/**
 * Alternativ können Sie den Text aus einer HTML-Datei laden. Lade dazu die Datei
 * in das Verzeichnis /data/html-description hoch und ändere den Dateinamen 
 * hinter '?project=' in den Dateinamen Ihrer Datei ohne .html
 * fetch('projectDescription?project=[ÄNDERN SIE DIESE VARIABLE ZU IHREM DATEINAMEN OHNE .html]')
 * 
 * Die Funktion wird später in map.js aufgerufen.
 */
export async function getHTMLMainDescriptionText(projectDescription){
    return fetch('projectDescription?project=text_web_GIS') //Ändere "text_web_GIS" zu deinem Dateinamen ohne ".html
    .then(response => response.text())
    .then(data => {
        if (data){           
            projectDescription.innerHTML = data; 
        }
        return projectDescription;
    });
}

/**
 * Legt die Layernamen und ihre entsprechenden Anzeigenamen fest.
 * Der Layername ist der Name der Geojson-Datei und 
 * der Anzeigename ist der Name, der in der Seitenleiste angezeigt wird.
 * 
 * Die Variable wird auch verwendet, um zu bestimmen, welche Dateien 
 * im Verzeichnis /data/geojson-layer geladen werden sollen.
 * @type {Object}
 */
export const layerName = {
    "240607_Web-GIS_Maßnahmen-Linie": "Streckenverlauf der Empfehlungsvariante",
    "240410_Web-GIS_Maßnahmen-Punkt": "Knotenpunkte auf der Empfehlungsvariante",
    "Radschnellweg_240607_Führungsform-im-Bestand": "Führungsform im Bestand"
};
/** 
 * Ordnet die Eigenschaftsnamen lesbareren und beschreibenderen Namen zu.
 * 
 * Der Schlüssel ist der Name der Geojson-Datei ohne Endung '.geojson'
 * und die Werte sind Objekte, die die ursprünglichen Eigenschaftsnamen 
 * als Schlüssel und die neuen Namen als Werte enthalten.
 * 
 * Beispiel:
 * "Urprünglischer Feldname in QGIS": "Neuer Name angezeigt in der Popup-Box",
 * 
 * Achte darauf das beide Namen jeweils in Anführungszeichen stehen und 
 * durch ein Doppelpunkt getrennt sind. 
 * Alle Zeilen müssen zudem durch ein Komma getrennt sein.
 * 
 * @type {Object}
 */
export const propertyNameMap = {
    // geojson-filename
    "240607_Web-GIS_Maßnahmen-Linie": {
        "Maßnahmenempfehlungen_2024-02-14 — Maßnahmen_Field6": "Abschnittsstrecke der Variante",
        "ID": "Abschnitts - Nr.",
        "Maßnahmenempfehlungen_2024-02-14 — Maßnahmen_Field20": "Anzustrebende Führungform",
        "Maßnahmenempfehlungen_2024-02-14 — Maßnahmen_Field21": "Musterlösung",
        "Maßnahmenempfehlungen_2024-02-14 — Maßnahmen_Field19": "Qualitätsstandard (nach Umsetzung)",
        "Maßnahmenempfehlungen_2024-02-14 — Maßnahmen_Field14": "Baulast ",
        "Maßnahmenempfehlungen_2024-02-14 — Maßnahmen_Field18": "Potential [Rf/d]",
    },
    "240410_Web-GIS_Maßnahmen-Punkt": {
        'Maßnahmenempfehlungen_2024-02-14 — Maßnahmen_Field6': "Knoten der Variante",
        "id": "Knoten - Nr.",
        "Maßnahmenempfehlungen_2024-02-14 — Maßnahmen_Field20": "Anzustrebende Führungsform über den Knotenpunkt",
        "Maßnahmenempfehlungen_2024-02-14 — Maßnahmen_Field21": "Musterlösung",
        "Maßnahmenempfehlungen_2024-02-14 — Maßnahmen_Field19": "Qualitätsstandard (nach Umsetzung)",
        "Maßnahmenempfehlungen_2024-02-14 — Maßnahmen_Field14": "Baulast ",
        "Maßnahmenempfehlungen_2024-02-14 — Maßnahmen_Field18": "Potential [Rf/d]",
    },
    "Radschnellweg_240607_Führungsform-im-Bestand": {
        "Bestand": "Führungsform im Bestand"
    },
    "Schutzgebiete": {
        "BEZEICHN": "Schutzgebiet"
    }
};

/**
 * Gibt die anzuzeigenden Eigenschaften für jeden Geojson-Dateinamen an.
 * Wenn leer (also hinter dem Dateinamen nur ein :[] steht),
 * werden alle Eigenschaften außer denen in 'propertiesToExclude' angezeigt.
 * 
 * Beispiel:
 * "geojson-filename": ["Zu zeigende Eigenschaft1", "Zu zeigende Eigenschaft2", ...],
 * 
 * Achte darauf, dass die Eigenschaften in Anführungszeichen stehen und durch ein Komma getrennt sind,
 * sowie dass alle Zeilen durch ein Komma getrennt sind und sich innerhalb der geschweiften Klammern befinden.
 * 
 * @type {Object}
 */
export const propertiesToShow = {
    "240607_Web-GIS_Maßnahmen-Linie": [
        "Maßnahmenempfehlungen_2024-02-14 — Maßnahmen_Field6",
        "ID",
        "Maßnahmenempfehlungen_2024-02-14 — Maßnahmen_Field20",
        "Maßnahmenempfehlungen_2024-02-14 — Maßnahmen_Field21",
        "Maßnahmenempfehlungen_2024-02-14 — Maßnahmen_Field19",
        "Maßnahmenempfehlungen_2024-02-14 — Maßnahmen_Field14",
        "Maßnahmenempfehlungen_2024-02-14 — Maßnahmen_Field18"
    ],
    "240410_Web-GIS_Maßnahmen-Punkt": [],
    "Radschnellweg_240607_Führungsform-im-Bestand": [],
    "240528_FotoPunktlayer": [' '],
};

/**
 * Gibt die auszuschließenden Eigenschaften für jeden Geojson-Dateinamen an.
 * Wenn leer, werden alle Eigenschaften oder alle in 'propertiesToShow' definierten angezeigt.
 * Wenn eine Eigenschaft sowohl in 'propertiesToShow' als auch in 'propertiesToExclude' definiert ist,
 * wird sie nicht angezeigt.
 * 
 * Beispiel:
 * "geojson-filename": ["Ausgeschlossene Eigenschaft1", "Ausgeschlossene Eigenschaft2", ...],
 * 
 * Achte darauf, dass die Eigenschaften in Anführungszeichen stehen und durch ein Komma getrennt sind,
 * sowie dass alle Zeilen durch ein Komma getrennt sind und sich innerhalb der geschweiften Klammern befinden.
 * 
 * @type {Object}
 */
export const propertiesToExclude = {
    "240607_Web-GIS_Maßnahmen-Linie": ["user", "Maßnahmenempfehlungen_2024-02-14 — Maßnahmen_Field9"],
    "240410_Web-GIS_Maßnahmen-Punkt": ["user", "Maßnahmenempfehlungen_2024-02-14 — Maßnahmen_Field9"],
    "Radschnellweg_240607_Führungsform-im-Bestand": ["user"]
};

/**
 * Weitere Einstellungen für jeden Geojson-Dateinamen.
 * 
 * 'showPopupForLayerWhenClicked' gibt an, ob der Inhalt dieser Ebene als PopUp/Seitenleiste angezeigt wird,
 *  wenn auf Elemente/Features dieser Ebene geklickt wird.
 * 
 * 'showLayerOnStart' gibt an, ob diese Ebene beim Start auf der Karte angezeigt wird.
 * 
 * 'alwaysKeepClickable' gibt an, ob der Inhalt dieser Ebene als PopUp/Seitenleiste angezeigt wird,
 * auch wenn sie nicht ausgewählt ist und/oder eine andere Ebene darüber gezeichnet wird, 
 * die kein eigenes Klick-Ereignis/PopUp-Inhalt hat. Dies kann nützlich sein, wenn 
 * mehrer Features/Elemente an der gleichen Stelle eingeblendet werden können, jedoch nur
 * eines davon tatsächlich weitere Informationen bereit hält die bei Klick in der Seitenleiste angezeigt werden,
 * diese Informationen aber auch für die anderen Elemente relevant sind.
 * 
 * Beispiel:
 * "geojson-filename": {
 *      showPopupForLayerWhenClicked: true, // true or false
 *      showLayerOnStart: true              // true or false
 *      alwaysKeepClickable: true           // true or false
 * },
 * 
 * Achte darauf, dass du ausschliesßlich die Werte 'true' oder 'false' verwendest
 * und die Schlüssel 'showPopupForLayerWhenClicked','showLayerOnStart' und 
 * 'alwaysKeepClickable' in Anführungszeichen stehen. 
 * Jede Zeile muss durch ein Komma getrennt sein und sich innerhalb der geschweiften Klammern befinden.
 * Der Dateiname muss in Anführungszeichen stehen und vor dem Doppelpunkt stehen,
 * sowie keine Dateiendung aufweisen.
 * 
 * Wenn kein Wert für 'showPopupForLayerWhenClicked', 'showLayerOnStart' oder '
 * alwaysKeepClickable' angegeben ist, wird standardmäßig 'true' verwendet.
 * 
 * Aber wenn die Datei nicht aufgeführt wird hier, steht der Wert auf 'false',
 * aber die Datei wird als Ebene in der Legende angezeigt und kann über die Legende ein- und ausgeblendet werden.
 * 
 * 
 * @type {Object} 
 */
export const otherSettings = {
    "240607_Web-GIS_Maßnahmen-Linie": {
        alwaysKeepClickable: true, 
     
    },
    "240410_Web-GIS_Maßnahmen-Punkt": {
       
    },
    "Radschnellweg_240607_Führungsform-im-Bestand": {
        showPopupForLayerWhenClicked: false,
        showLayerOnStart: false
    },
    "Schutzgebiete": {
        showPopupForLayerWhenClicked: true,
        showLayerOnStart: false
    },
    "240528_FotoPunktlayer":{
        showPopupForLayerWhenClicked: true,
        showLayerOnStart: false,
        showAsPopUp: true,
        loadImages: true,
    }
};

/**
 * js/map-config/layerstyle-classes.js enthält die Klassen, die die Klasse L.GeoJSON erweitern
 * und implementieren verschiedene Stile ähnlich den regelbasierten Stilen in QGIS.
 * Für Ihre Daten können Sie die vorhandenen Klassen verwenden oder neue erstellen und Ihre eigenen Regeln
 * für verschiedene Linienstile oder benutzerdefinierte SVG-Marker implementieren.
 * 
 * Die Variable ClassSearchTerms ordnet den Klassennamen entsprechende Suchbegriffe zu.
 * Der Klassenname ist der Name der Klasse, die in layerstyle-classes.js definiert wird,
 * und der Suchbegriff ist ein Teilstring, den Sie definieren können.
 * 
 * In layerstyle-classes.js werden die eigentlichen Klassen definiert und das LayerstyleClasses-Objekt
 * wird basierend auf den Informationen in ClassSearchTerms gefüllt.
 * Jeder Eintrag in LayerstyleClasses ordnet einen Klassennamen einem Objekt zu, das die Klasse
 * und den Suchbegriff enthält.
 * 
 * Der Typ jeder Datei wird durch das erste Wort im Dateinamen vor dem ersten Unterstrich ('_') bestimmt.
 * Dies ist eine Konvention, die in der Datei `database-communication.js` festgelegt wird, 
 * wenn die GeoJSON-Daten abgerufen werden.
 * 
 * Beispiel:
 * Sie haben eine Geojson-Datei mit dem Titel Querungen_im_Nimmerland.geojson und eine weitere Geojson-Datei
 * mit dem Titel Nimmerland_und_seine_Querungen.geojson. Sie möchten, dass beide Datensätze 
 * als Teil der Klasse 'Querungen' gezeichnet werden.
 * 
 * Der Typ der ersten Datei wäre 'Querungen' (das erste Wort vor dem Unterstrich) und
 * der Typ der zweiten Datei wäre 'Nimmerland' (das erste Wort vor dem Unterstrich).
 * Um beide mit der Klasse Querungen zu zeichnen, können Sie 'Nimmerland' als Suchbegriff für die
 * Querungen Klasse hinzufügen. Die Variable ClassSearchTerms würde dann so aussehen:
 * 
 * export const ClassSearchTerms = {
 *    Querungen: 'Nimmerland'
 * };
 * 
 * Auf diese Weise würden beide Dateien mit dem gleichen Stil gezeichnet.
 * 
 * In layerstyle-classes.js werden die eigentlichen Klassen definiert und das LayerstyleClasses-Objekt
 * wird basierend auf den Informationen in ClassSearchTerms gefüllt.
 * Jeder Eintrag in LayerstyleClasses ordnet einen Klassennamen einem Objekt zu, das die Klasse
 * und den Suchbegriff enthält.
 * 
 * @type {Object}
 */

export const ClassSearchTerms = {
    Querungen: 'Querungen',
    Laufrouten: 'Laufrouten',
    Fuehrungsform: ['Fuehrungsform', 'Führungsform', 'Radschnellweg'],
    Massnahmen: ['-Linie','-Punkt'],
    Schutzgebiete: 'Schutzgebiete',
    Fotopunkte: 'FotoPunktlayer'
};