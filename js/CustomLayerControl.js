export const CustomLayersControl = L.Control.Layers.extend({
    // Extend or override methods as needed
	_getClassName(layerName) {
		// Define mappings of layer names to class names
		const classNameMap = {
			'OSM': 'osm',
			'TPO Web': 'tpo_web',
			'TPO Grey': 'tpo_grey',
			'TPO Grey Light': 'tpo_grey_light',
			'TPO Web Light': 'tpo_web_light',
			'Satellite': 'sat',
			'Cycle': 'cycle',
			'Topo': 'topo'
			// Add more mappings as needed
		};

		// Check if the layer name matches any mapping
		for (const name in classNameMap) {
			if (layerName.toLowerCase().includes(name.toLowerCase())) {
				return classNameMap[name];
			}
		}
		// Return a default class if no match is found
		return 'default';
	}, 

    _addItem(obj) { 
        const label = document.createElement('label');
        const checked = this._map.hasLayer(obj.layer);
   
        // Create a clickable image element
		const img = document.createElement('div');
		//img.src = ''; // Set the image path
		//img.alt = obj.name;
		img.className = 'bgmap ' + this._getClassName(obj.name); // Set class name directly

		if (checked){
			img.classList.add('selected');
		}

		const divname = document.createElement('div');
		divname.className = 'bgmap-name';
		divname.innerHTML = obj.name;

		img.appendChild(divname);

		// Create a hidden input to store the layer state
		let input;

		if (obj.overlay) {
			input = document.createElement('input');
			input.type = 'checkbox';
		} else {
			input = this._createRadioElement(`leaflet-base-layers_${L.Util.stamp(this)}`, checked);
		}
		
		input.style.display = 'none';
		// input.className = 'leaflet-control-layers-selector';
		input.defaultChecked = checked;
		this._layerControlInputs.push(input);
		input.layerId = L.Util.stamp(obj.layer);

		L.DomEvent.on(img, 'click', () => {
			input.checked = !input.checked; // Toggle the checked state of the input
			if (!img.classList.contains('selected')){
				// Remove the 'selected' class from all labels
				const labels = container.querySelectorAll('.bgmap');
				for (let i = 0; i < labels.length; i++) {
					labels[i].classList.remove('selected');
				}	
				// Add the 'selected' class to the clicked label
				img.classList.add('selected');
				this._onInputClick(); // Manually trigger the input click handler
			}
		}, this);

		const holder = document.createElement('span');
		label.appendChild(holder);
		holder.appendChild(input);
		holder.appendChild(img);

        const container = obj.overlay ? this._overlaysList : this._baseLayersList;
        container.appendChild(label)
	    
        this._checkDisabledLayers();
        return label;
    },

	onAdd(map) {
		this._initLayout();
		this._update();

		this._map = map;
		map.on('zoomend', this._checkDisabledLayers, this);

		for (let i = 0; i < this._layers.length; i++) {
			this._layers[i].layer.on('add remove', this._onLayerChange, this);
		}

		if (!this.options.collapsed) {
			// update the height of the container after resizing the window
			map.on('resize', this._expandIfNotCollapsed, this);
		}

        // Remove the unwanted classes
        L.DomUtil.removeClass(this._container, 'leaflet-control');
        L.DomUtil.removeClass(this._container, 'leaflet-control-layers');

		return this._container;
	},
	addTo(map) {
		this.remove();
		this._map = map;

		const container = this._container = this.onAdd(map),
		    pos = this.getPosition(),
		    corner = map._controlCorners[pos];

		//container.classList.add('leaflet-control');

		if (pos.includes('bottom')) {
			corner.insertBefore(container, corner.firstChild);
		} else {
			corner.appendChild(container);
		}

		this._map.on('unload', this.remove, this);

		return this;
	},
});

// Factory function to create the custom layers control
export const customLayersControl = function (baseLayers, overlays, options) {
    return new CustomLayersControl(baseLayers, overlays, options);
};