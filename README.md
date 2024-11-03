# WebApparcgisJs

This repository contains a GIS mapping application that allows users to view and interact with multiple geographic layers, including transport points, lines, and polygons. The application uses custom configurations and layers for a tailored user experience.

## Features
Display multiple layers, including transport stations, regions, and provinces, with interactive pop-ups.
Allow users to select regions and provinces from dropdowns to filter transport stations.
Enable drawing polygons to find transport stations within user-defined areas.
Provide proximity search for transport stations within specified distances from selected cities (e.g., 1 km radius from Tangier Center).
User interface with interactive tools for map exploration, layer management, and basemap selection.
## Requirements
JavaScript
HTML5
GIS data in .geojson and .csv formats (place these in the data folder).
Esri Feature Layer URLs, accessible with authentication, for displaying dynamic map layers.

#### Note :Due to recent changes in Esri's authentication requirements, direct use of the ArcGIS API in this application was not feasible. Accessing certain feature layers requires user authentication, which prevents public sharing of these resources directly. Therefore, a specific authentication account was created exclusively for this project to allow secure access to these layers while preserving the necessary data privacy and project integrity.
