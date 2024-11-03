require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Editor",
    "esri/layers/GeoJSONLayer",
    "esri/renderers/SimpleRenderer",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/widgets/BasemapGallery",
    "esri/widgets/LayerList" , 
    "esri/geometry/Point" , 
    "esri/geometry/geometryEngine" , 
    "esri/geometry/projection" , 
    "esri/geometry/SpatialReference" , 
    "esri/widgets/Sketch",
    "esri/layers/GraphicsLayer",
    "esri/Graphic"
    
], function(Map, MapView, FeatureLayer, Editor, GeoJSONLayer, SimpleRenderer, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, BasemapGallery , LayerList , Point , geometryEngine , projection ,SpatialReference , Sketch , GraphicsLayer, Graphic ) {

    // Create a map and view with "streets-vector" as the default basemap
    const map = new Map({
        basemap: "streets",
    });

    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-7.0926, 31.7917], // Longitude, latitude for Morocco
        zoom: 5
    });

    // Add each feature layer with its specific sublayer ID
    const pointLayer = new FeatureLayer({
        url: "https://services7.arcgis.com/VdEK6E3X6dXrUHgJ/arcgis/rest/services/Feature/FeatureServer/0",
        renderer: new SimpleRenderer({
            symbol: new SimpleMarkerSymbol({
                color: "black", // Color for points
                size: "8px", // Size of points
                outline: {
                    color: "white",
                    width: 1
                }
            })
        })
    });

    const lineLayer = new FeatureLayer({
        url: "https://services7.arcgis.com/VdEK6E3X6dXrUHgJ/arcgis/rest/services/Feature/FeatureServer/1",
        renderer: new SimpleRenderer({
            symbol: new SimpleLineSymbol({
                color: "green", // Color for lines
                width: 2
            })
        })
    });

    const polygonLayer = new FeatureLayer({
        url: "https://services7.arcgis.com/VdEK6E3X6dXrUHgJ/arcgis/rest/services/Feature/FeatureServer/2",
        renderer: new SimpleRenderer({
            symbol: new SimpleFillSymbol({
                color: [255, 0, 0, 0.5], // Red fill for polygons
                outline: {
                    color: "red", // Border color
                    width: 1
                }
            })
        })
    });

   // Create GeoJSON layer for provinces with a pop-up template
const provincesLayer = new GeoJSONLayer({
    url: "./data/provinces.geojson",
    title: "Provinces",
    popupTemplate: {
        title: "{Nom}", // Use the Nom property for the title
        content: "This province is called {Nom}." // You can add more details if available
    },
    renderer: {
        type: "simple",
        symbol: {
            type: "simple-fill",
            color: "rgba(0, 0, 255, 0.0)", // Transparent fill
            outline: { color: "blue", width: 2 }
        }
    }
});

// Create GeoJSON layer for regions with a pop-up template
const regionsLayer = new GeoJSONLayer({
    url: "./data/regions.geojson",
    title: "Regions",
    popupTemplate: {
        title: "{NOM_REG}",
        content: "This region is called {NOM_REG} and the id is : {OBJECTID}."
    },
    renderer: {
        type: "simple",
        symbol: {
            type: "simple-fill",
            color: "rgba(0, 128, 0, 0.0)", // Transparent fill
            outline: { color: "yellow", width: 2 }
        }
    }
});

const transportLayer = new FeatureLayer({
    url: "https://services7.arcgis.com/VdEK6E3X6dXrUHgJ/arcgis/rest/services/Transport/FeatureServer/0",
    popupTemplate: {
        title: "{name}",
        content: "Type: {fclass}"
    }
    
});


    // Add all layers to the map
    map.addMany([ provincesLayer , regionsLayer,  polygonLayer , lineLayer ,  transportLayer , pointLayer]);

    // Create an editor widget
    const editor = new Editor({
        view: view,
        layerInfos: [
            {
                layer: transportLayer,
                enableUpdate: true, 
                fieldConfig: [
                    {
                        name: "name", 
                        label: "Bus Station Name",
                        required: true
                    },
                    {
                        name: "fclass", // Field for the feature class
                        label: "Feature Class",
                        required: true
                    }
                ]
            },
            
            {
                layer: pointLayer,
                enableUpdate: true,
                fieldConfig: [{
                    name: "name", // Adjust based on your layer fields
                    label: "Point Name",
                    required: true
                }]
            },
            {
                layer: lineLayer,
                enableUpdate: true,
                fieldConfig: [{
                    name: "description", // Adjust based on your layer fields
                    label: "Description",
                    required: true
                }]
            },
            {
                layer: polygonLayer,
                enableUpdate: true,
                fieldConfig: [{
                    name: "areaName", // Adjust based on your layer fields
                    label: "Area Name",
                    required: true
                }]
            },
            {
                layer: provincesLayer,
                enableUpdate: true // Enable update if applicable
            },
            {
                layer: regionsLayer,
                enableUpdate: true // Enable update if applicable
            }
        ]
    });

    // Add the editor widget to the top right of the view
    view.ui.add(editor, "top-right");

    const  basemapGallery = new BasemapGallery({
        view: view
      });
      // Add widget to the top right corner of the view
      view.ui.add(basemapGallery, {
        position: "top-left"
      });
    basemapGallery.container.classList.add("custom-basemap-gallery");

    const layerList = new LayerList({
        view: view,
        listItemCreatedFunction: function(event) {
            const item = event.item;
            if (item.layer.title) {
                item.panel = {
                    content: "legend",
                    open: true
                };
            }
        }
    });
    view.ui.add(layerList, "bottom-left");
    layerList.container.classList.add("esri-layer-list");

    const regionDropdown = document.getElementById("regionDropdown");

    regionsLayer.queryFeatures({
        where: "1=1", // Select all features to populate the dropdown
        outFields: ["NOM_REG"],
        returnGeometry: false
    }).then(results => {
        const uniqueRegions = new Set();
        results.features.forEach(feature => {
            uniqueRegions.add(feature.attributes.NOM_REG);
        });
        uniqueRegions.forEach(region => {
            const option = document.createElement("option");
            option.value = region;
            option.textContent = region;
            regionDropdown.appendChild(option);
        });
    }).catch(error => {
        console.error("Error querying regionsLayer:", error);
    });

    // Function to filter transport stations based on selected region
    function filterTransportStations() {
        const selectedRegion = regionDropdown.value;

        if (!selectedRegion) {
            transportLayer.definitionExpression = "1=1"; // Show all if no region selected
        } else {
            transportLayer.definitionExpression = `NOM_REG = '${selectedRegion}'`; // Filter by selected region
        }
    }

    // Add event listener to dropdown
    regionDropdown.addEventListener("change", filterTransportStations);
    
    // Assuming your projection and geometryEngine are already set up
    projection.load().then(() => {
        const tangierCenter = new Point({
            longitude: -5.8,
            latitude: 35.767,
            spatialReference: { wkid: 4326 }
        });
    
        const agadirCenter = new Point({
            longitude: -9.6,  // Agadir's longitude
            latitude: 30.4,   // Agadir's latitude
            spatialReference: { wkid: 4326 }
        });
    
        const tangierCenter102100 = projection.project(tangierCenter, new SpatialReference({ wkid: 102100 }));
        const agadirCenter102100 = projection.project(agadirCenter, new SpatialReference({ wkid: 102100 }));
    
        function findTransportPointsWithin1km() {
            const buffer = geometryEngine.geodesicBuffer(tangierCenter102100, 1, "kilometers");
            transportLayer.definitionExpression = "";
    
            transportLayer.queryFeatures().then((results) => {
                const graphics = results.features.filter((feature) => {
                    if (feature.geometry) {
                        const projectedGeometry = projection.project(feature.geometry, new SpatialReference({ wkid: 102100 }));
                        return geometryEngine.contains(buffer, projectedGeometry);
                    }
                    return false;
                });
    
                transportLayer.definitionExpression = "OBJECTID IN (" + graphics.map(g => g.attributes.OBJECTID).join(",") + ")";
    
                if (graphics.length === 0) {
                    console.log("No transport points found within 1 km of Tangier Center.");
                } else {
                    console.log(`${graphics.length} transport points found within 1 km of Tangier Center.`);
                }
            });
        }
    
        function findTransportPointsWithin3km() {
            const buffer = geometryEngine.geodesicBuffer(agadirCenter102100, 3, "kilometers");
            transportLayer.definitionExpression = "";
    
            transportLayer.queryFeatures().then((results) => {
                const graphics = results.features.filter((feature) => {
                    if (feature.geometry) {
                        const projectedGeometry = projection.project(feature.geometry, new SpatialReference({ wkid: 102100 }));
                        return geometryEngine.contains(buffer, projectedGeometry);
                    }
                    return false;
                });
    
                transportLayer.definitionExpression = "OBJECTID IN (" + graphics.map(g => g.attributes.OBJECTID).join(",") + ")";
    
                if (graphics.length === 0) {
                    console.log("No transport points found within 3 km of Agadir Center.");
                } else {
                    console.log(`${graphics.length} transport points found within 3 km of Agadir Center.`);
                }
            });
        }
    
        function resetToShowAllTransportPoints() {
            // Clear any existing filters to show all points
            transportLayer.definitionExpression = "";
            transportLayer.refresh(); // Refresh the layer to display all features
            console.log("All transport points displayed.");
        }
    
        // Add event listener for filters dropdown
        document.getElementById("filters").addEventListener("change", (event) => {
            if (event.target.value === "1km") {
                findTransportPointsWithin1km();
            } else if (event.target.value === "drawPolygon") {
                findTransportPointsWithin3km();
            } else {
                resetToShowAllTransportPoints(); 
            }
        });
    
    }).catch((error) => {
        console.error("Error loading projection module:", error);
    });

    const polygon = new GraphicsLayer();
    map.add(polygon);

 
    const sketch = new Sketch({
        view: view,
        layer: polygon,
        creationMode: "single",
        visibleElements: {
            selectionTools: false,
            settingsMenu: false
        }
    });


    let isDrawing = false;

    // Button click event to toggle polygon drawing
    const drawButton = document.getElementById("toggleDrawPolygonBtn");
    drawButton.addEventListener("click", () => {
        isDrawing = !isDrawing;

        if (isDrawing) {
            drawButton.textContent = "Cancel Drawing";
            startDrawingPolygon();
        } else {
            drawButton.textContent = "Draw Polygon to Select Transport Stations";
            cancelDrawing();
        }
    });

    function startDrawingPolygon() {
        view.graphics.removeAll(); // Clear any existing graphics
        sketch.create("polygon"); // Start polygon drawing
    }

    function cancelDrawing() {
        view.graphics.removeAll(); // Clear all graphics from the view
        polygon.removeAll();  // Clear all graphics from the polygon layer
        isDrawing = false;
    }

    // Function to query and display transport points within the drawn polygon
    function queryFeatureLayer(polygonGeometry) {
        const buffer = geometryEngine.buffer(polygonGeometry, 0, "meters");

        transportLayer.queryFeatures({
            geometry: buffer,
            spatialRelationship: "contains",
            returnGeometry: true,
            outFields: ["*"]
        }).then((results) => {
            view.graphics.removeAll(); // Clear previous points

            results.features.forEach((feature) => {
                const graphic = new Graphic({
                    geometry: feature.geometry,
                    symbol: {
                        type: "simple-marker",
                        color: "black",
                        size: "8px"
                    }
                });
                view.graphics.add(graphic);
            });
        });
    }

    // Sketch create event to handle when drawing finishes
    sketch.on("create", (event) => {
        if (event.state === "complete") {
            queryFeatureLayer(event.graphic.geometry);
        }
    });

    // Sketch update event to handle ongoing drawing and show points in real-time
    sketch.on("update", (event) => {
        if (event.graphics[0].geometry) {
            queryFeatureLayer(event.graphics[0].geometry);
        }
    });

    // Sketch delete event to clear graphics when drawing is canceled
    sketch.on("delete", () => {
        view.graphics.removeAll();
    });

});
