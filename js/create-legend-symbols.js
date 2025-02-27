
/**
 * Creates a legend symbol based on the layer type and color.
 * @param {Object} layer - The layer object.
 * @param {string} color - The color of the legend symbol.
 * @returns {HTMLElement|null} - The created legend symbol element or null if color is undefined.
 */
export function createLegendSymbol(layer, color){
    let stroke;
    if (color !== undefined && color !== 'undefined') {
        if (layer.options.radius !== undefined){
            stroke = createLegendCircle(color, layer.options.fillColor, layer.options.radius);
        } else if (layer instanceof L.Polygon){
            stroke = createLegendParallelogram(color, layer.options.fillColor);
        } else {
            stroke = createLegendStroke(color);
        }
    } else {
        stroke = null; // Set stroke to null if color is undefined
    }
    return stroke;
}

/**
 * Creates a stroke legend symbol.
 * @param {string} color - The color of the stroke.
 * @param {number} [weight] - The weight of the stroke.
 * @returns {HTMLElement} - The created stroke legend symbol element.
 */
function createLegendStroke(color, weight){
    // Create a small line stroke
    let stroke = document.createElement('img');
    stroke.style.width = '1em';  // Adjust the width as needed
    stroke.style.border = '0.15em solid ' + color;  
    stroke.fill = color;
    stroke.style.margin = '0.3em';  // Add some space between the stroke and the label
    stroke.style.verticalAlign = 'middle';
    return stroke;
}

/**
 * Creates a circle legend symbol.
 * @param {string} color - The color of the circle border.
 * @param {string} fillColor - The color of the circle fill.
 * @param {number} radius - The radius of the circle.
 * @returns {HTMLElement} - The created circle legend symbol element.
 */
function createLegendCircle(color, fillColor, radius){
    // Create a small circle
    let circle = document.createElement('div');
    // Set ID of circle to 'img'
    circle.id = 'img';
    circle.style.width = '0.5em';  // Set the width to the diameter of the circle
    circle.style.height = '0.5em'; //radius*0.1 + 'em';  // Set the height to the diameter of the circle
    circle.style.backgroundColor = fillColor;  // Set the color of the circle
    circle.style.border = '0.05em solid ' + color;  // Add a border to the circle
    circle.style.borderRadius = '50%';  // Make the div circular
    circle.style.marginRight = '5px';  // Add some space between the circle and the label
    circle.style.marginLeft = '5px';
    circle.style.marginBottom = '0.05em';
    circle.style.display = 'inline-block';
    return circle;
}

/**
 * Creates a parallelogram legend symbol.
 * @param {string} borderColor - The color of the parallelogram border.
 * @param {string} [fillColor] - The color of the parallelogram fill. If not provided, borderColor will be used.
 * @returns {HTMLElement} - The created parallelogram legend symbol element.
 */
function createLegendParallelogram(borderColor, fillColor) {
    // Create a parallelogram
    let parallelogram = document.createElement('div');
    parallelogram.id = 'img';
    parallelogram.style.width = '0.5em';
    parallelogram.style.height = '0.5em';
    parallelogram.style.border = '0.05em solid ' + borderColor;
    parallelogram.style.transform = 'skew(-20deg)';
    parallelogram.style.margin = '0.3em';
    parallelogram.style.backgroundColor = fillColor ? fillColor : borderColor;
    parallelogram.style.fillOpacity = 0.8;
    parallelogram.style.display = 'inline-block';

    return parallelogram;
}
