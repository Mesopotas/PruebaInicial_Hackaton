/*const categoryList = document.getElementById('category-list');

async function fetchCategories() {
    try {
        const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/categories');
        const data = await response.json();

        displayCategories(data.categories);
    } catch (error) {
        console.error('Error fetching data from NASA API:', error);
    }
}

function displayCategories(categories) {
    categoryList.innerHTML = ''; // Limpiar la lista antes de agregar nuevas categorías
    categories.forEach(category => {
        const li = document.createElement('li');
        li.textContent = category.title; // Mostrar el nombre de la categoría
        categoryList.appendChild(li);
    });
}

fetchCategories(); // Llamar a la función para cargar las categorías al cargar la página


const eventTableBody = document.querySelector('#event-table tbody');

async function fetchEvents() {
    try {
        const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events');
        const data = await response.json();

        // Mostrar los 5 eventos más recientes
        displayEvents(data.events.slice(0, 5));
    } catch (error) {
        console.error('Error fetching data from NASA API:', error);
    }
}

function displayEvents(events) {
    eventTableBody.innerHTML = ''; // Limpiar las filas antes de agregar nuevos eventos

    events.forEach(event => {
        const row = document.createElement('tr');
        
        const titleCell = document.createElement('td');
        const categoryCell = document.createElement('td');
        const coordinatesCell = document.createElement('td');

        titleCell.textContent = event.title;
        categoryCell.textContent = event.categories[0].title;
        
        if (event.geometry && event.geometry.length > 0) {
            const coords = event.geometry[0].coordinates;
            coordinatesCell.textContent = `Latitud: ${coords[1]}, Longitud: ${coords[0]}`;
        } else {
            coordinatesCell.textContent = 'No disponibles';
        }

        row.appendChild(titleCell);
        row.appendChild(categoryCell);
        row.appendChild(coordinatesCell);
        eventTableBody.appendChild(row);
    });
}

fetchEvents();*/

// Cambia el nombre de las variables relacionadas con los mapas base y overlays
const baseLayerMapOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
});

const baseLayerMapOSMHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
});

const baseLayerOpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
});

// Inicializa el mapa usando la vista general
const mapInteractiveNaturalEvents = L.map('map', {
    center: [20, 0],
    zoom: 2,
    layers: [baseLayerMapOSM] // Capa base por defecto
});

// Renombra las variables para los controles de capas
const baseMapsLayerControl = {
    "OpenStreetMap": baseLayerMapOSM,
    "OpenStreetMap.HOT": baseLayerMapOSMHOT,
    "OpenTopoMap": baseLayerOpenTopoMap
};

// Continúa utilizando el mismo conjunto de eventos como overlay
const overlayNaturalEventMarkers = {
    "Eventos Naturales": L.layerGroup()
};

// Añadir control de capas con opciones base y overlays
L.control.layers(baseMapsLayerControl, overlayNaturalEventMarkers).addTo(mapInteractiveNaturalEvents);

// Resto del código para gestionar los eventos, filtros, etc.

const eventIcons = {
    'Drought': './IMG/drought.png',
    'Dust and Haze': './IMG/dustandhaze.png',
    'Earthquakes': './IMG/earthquake.png',
    'Floods': './IMG/floods.png',
    'Landslides': './IMG/landslide.png',
    'Manmade': './IMG/manmade.png',
    'Sea and Lake Ice': './IMG/seaandicelakes.png',
    'Severe Storms': './IMG/storm.png',
    'Temperature Extremes': './IMG/temperature.png',
    'Volcanoes': './IMG/volcano.png',
    'Water Color': './IMG/watercolo.png',
    'Wildfires': './IMG/wildfire.png',
};

let markersArray = [];
let activeEventFilters = new Set();  // Almacena los eventos activos

// Función para agregar las opciones del filtro con checkbox y las imágenes de los eventos
function addEventFilterOptionsToForm(events) {
    const eventFilterDiv = document.getElementById('event-filter');

    // Limpiar las opciones previas
    eventFilterDiv.innerHTML = '';

    const uniqueEventCategories = [...new Set(events.map(event => event.categories[0].title))];

    uniqueEventCategories.forEach(category => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true; // Por defecto, todos están activados
        checkbox.value = category;

        // Evento para filtrar los marcadores cuando el checkbox cambia
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                activeEventFilters.add(this.value);
            } else {
                activeEventFilters.delete(this.value);
            }
            updateMapMarkers();
        });

        // Imagen correspondiente a la categoría
        const icon = document.createElement('img');
        icon.src = eventIcons[category] || './IMG/default.png';  // Usa una imagen por defecto si no existe
        icon.style.width = '20px';
        icon.style.height = '20px';
        icon.style.marginRight = '5px';

        // Agregar el checkbox, la imagen y el nombre del evento al filtro
        label.appendChild(checkbox);
        label.appendChild(icon);
        label.appendChild(document.createTextNode(category));
        eventFilterDiv.appendChild(label);
        eventFilterDiv.appendChild(document.createElement('br'));

        // Inicialmente activa todos los filtros
        activeEventFilters.add(category);
    });
}

// Función para actualizar los marcadores según los filtros activos
function updateMapMarkers() {
    clearMapMarkers();  // Eliminar todos los marcadores

    markersArray.forEach(markerObj => {
        if (activeEventFilters.has(markerObj.category)) {
            markerObj.marker.addTo(mapInteractiveNaturalEvents);  // Añadir marcador al mapa si está filtrado
        }
    });
}

// Función para limpiar los marcadores del mapa
function clearMapMarkers() {
    markersArray.forEach(markerObj => mapInteractiveNaturalEvents.removeLayer(markerObj.marker));
}

// Función para obtener los eventos y agregar marcadores
async function fetchAndDisplayNaturalEvents() {
    try {
        const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events');
        const data = await response.json();

        // Filtra eventos con coordenadas disponibles
        const eventsWithCoordinates = data.events.filter(event =>
            event.geometry && event.geometry.length > 0 &&
            event.geometry[0].coordinates.length >= 2
        );

        // Añadir las opciones del filtro
        addEventFilterOptionsToForm(eventsWithCoordinates);

        // Añadir los eventos al mapa
        eventsWithCoordinates.forEach(event => {
            const category = event.categories[0].title;
            const coordinates = event.geometry[0].coordinates;
            const eventDate = new Date(event.geometry[0].date).toLocaleDateString();
            const title = event.title;

            if (coordinates.length === 2) {
                const [lng, lat] = coordinates;

                // Usa el ícono personalizado según la categoría del evento, o un ícono por defecto
                const icon = L.icon({
                    iconUrl: eventIcons[category] || './IMG/default.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                });

                // Agrega un marcador con el ícono personalizado
                const marker = L.marker([lat, lng], { icon: icon })
                    .bindPopup(`<strong>${title}</strong><br>Category: ${category}<br>Date: ${eventDate}`);

                // Almacena el marcador y su categoría
                markersArray.push({ marker, category });
            }
        });

        // Inicialmente, muestra todos los marcadores
        updateMapMarkers();
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

fetchAndDisplayNaturalEvents();
