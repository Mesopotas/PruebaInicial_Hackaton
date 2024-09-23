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


const map = L.map('map').setView([20, 0], 2);

// Agrega un mapa base desde OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Diccionario para asignar íconos personalizados según la categoría del evento
const eventIcons = {
    'Drought': L.icon({
        iconUrl: './IMG/drought.png',
        iconSize: [32, 32], // Tamaño del icono
        iconAnchor: [16, 32], // Punto del icono que se ubicará en el marcador
        popupAnchor: [0, -32] // Ajuste para el pop-up
    }),
    'Dust and Haze': L.icon({
        iconUrl: './IMG/dustandhaze.png',
        iconSize: [32, 32], // Tamaño del icono
        iconAnchor: [16, 32], // Punto del icono que se ubicará en el marcador
        popupAnchor: [0, -32] // Ajuste para el pop-up
    }),
    'Earthquakes': L.icon({
        iconUrl: './IMG/earthquake.png',
        iconSize: [32, 32], // Tamaño del icono
        iconAnchor: [16, 32], // Punto del icono que se ubicará en el marcador
        popupAnchor: [0, -32] // Ajuste para el pop-up
    }),
    'Floods': L.icon({
        iconUrl: './IMG/floods.png',
        iconSize: [32, 32], // Tamaño del icono
        iconAnchor: [16, 32], // Punto del icono que se ubicará en el marcador
        popupAnchor: [0, -32] // Ajuste para el pop-up
    }),
    'Landslides': L.icon({
        iconUrl: './IMG/landslide.png',
        iconSize: [32, 32], // Tamaño del icono
        iconAnchor: [16, 32], // Punto del icono que se ubicará en el marcador
        popupAnchor: [0, -32] // Ajuste para el pop-up
    }),
    'Manmade': L.icon({
        iconUrl: './IMG/manmade.png',
        iconSize: [32, 32], // Tamaño del icono
        iconAnchor: [16, 32], // Punto del icono que se ubicará en el marcador
        popupAnchor: [0, -32] // Ajuste para el pop-up
    }),
    'Sea and Lake Ice': L.icon({
        iconUrl: './IMG/seaandicelakes.png',
        iconSize: [32, 32], // Tamaño del icono
        iconAnchor: [16, 32], // Punto del icono que se ubicará en el marcador
        popupAnchor: [0, -32] // Ajuste para el pop-up
    }),
    'Severe Storms': L.icon({
        iconUrl: './IMG/storm.png',
        iconSize: [32, 32], // Tamaño del icono
        iconAnchor: [16, 32], // Punto del icono que se ubicará en el marcador
        popupAnchor: [0, -32] // Ajuste para el pop-up
    }),
    'Temperature Extremes': L.icon({
        iconUrl: './IMG/temperature.png',
        iconSize: [32, 32], // Tamaño del icono
        iconAnchor: [16, 32], // Punto del icono que se ubicará en el marcador
        popupAnchor: [0, -32] // Ajuste para el pop-up
    }),
    'Volcanoes': L.icon({
        iconUrl: './IMG/volcano.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }),
    'Water Color': L.icon({
        iconUrl: './IMG/watercolo.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }),
    'Wildfires': L.icon({
        iconUrl: './IMG/wildfire.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }),
};

// Función para obtener los datos de la API de EONET
async function fetchEvents() {
    try {
        const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events');
        const data = await response.json();

        // Filtra eventos con coordenadas disponibles
        const eventsWithCoordinates = data.events.filter(event => 
            event.geometry && event.geometry.length > 0 &&
            event.geometry[0].coordinates.length >= 2
        );

        // Procesa los eventos y los añade al mapa
        eventsWithCoordinates.forEach(event => {
            const title = event.title;
            const category = event.categories[0].title;
            const coordinates = event.geometry[0].coordinates;
            
            // Verifica si las coordenadas están en el formato [longitud, latitud]
            if (coordinates.length === 2) {
                const [lng, lat] = coordinates; // Leaflet usa [lat, lng]

                // Usa el ícono personalizado según la categoría del evento, o un ícono por defecto
                const icon = eventIcons[category] || L.icon({
                    iconUrl: './IMG/default.png', // Usa un ícono por defecto si no se encuentra la categoría
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                });

                // Agrega un marcador con el ícono personalizado
                L.marker([lat, lng], { icon: icon })
                    .addTo(map)
                    .bindPopup(`<strong>${title}</strong><br>Category: ${category}`);
            }
        });
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

// Llama a la función para cargar los eventos
fetchEvents();
