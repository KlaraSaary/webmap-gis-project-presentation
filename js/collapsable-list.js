/**
 * Makes a list item collapsable by adding a click event listener to toggle its visibility.
 * @param {HTMLElement} liElementWithChilds - The list item element that contains child elements.
 */
export function makeULDivCollapsable(liElementWithChilds){
    var triangle = document.createElement('span');
    triangle.style = 'display: inline-block; width: 0; height: 0; border-style: solid; border-width: 5px 0 5px 8px; border-color: transparent transparent transparent black; margin-right: 5px;';

    // Add the triangle to the ulElement
    liElementWithChilds.prepend(triangle);

    // Get the ul child of the li
    let ulChild = liElementWithChilds.querySelector('ul');

    // If the li has a ul child, toggle its visibility and the direction of the triangle
    if (ulChild && ulChild.style.display !== 'none') {
        triangle.style.transform = 'rotate(90deg)';
    }

    // Add a click event listener to the li element
    triangle.addEventListener('click', function(event) {
        // Prevent the event from bubbling up to parent elements
        event.stopPropagation();

        // If the li has a ul child, toggle its visibility and the direction of the triangle
        if (ulChild) {
            ulChild.style.display = ulChild.style.display === 'none' ? 'block' : 'none';
            triangle.style.transform = ulChild.style.display === 'none' ? 'rotate(0deg)' : 'rotate(90deg)';
        }
    });
}