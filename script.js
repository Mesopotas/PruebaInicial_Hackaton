

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
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }),
    'Dust and Haze': L.icon({
        iconUrl: './IMG/dustandhaze.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }),
    'Earthquakes': L.icon({
        iconUrl: './IMG/earthquake.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }),
    'Floods': L.icon({
        iconUrl: './IMG/floods.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }),
    'Landslides': L.icon({
        iconUrl: './IMG/landslide.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }),
    'Manmade': L.icon({
        iconUrl: './IMG/manmade.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }),
    'Sea and Lake Ice': L.icon({
        iconUrl: './IMG/seaandicelakes.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }),
    'Severe Storms': L.icon({
        iconUrl: './IMG/storm.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }),
    'Temperature Extremes': L.icon({
        iconUrl: './IMG/temperature.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
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

// Variable para almacenar los marcadores del mapa
let markers = [];

// Función para limpiar los marcadores del mapa
function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

// Función para obtener el clima de una ubicación
async function fetchWeather(lat, lon) {
    const apiKey = '4d3d3efc4f8402b61207aaa2b39dd6be';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return `${data.weather[0].description}, ${data.main.temp} °C`;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return 'No weather data available';
    }
}

// Función para obtener eventos filtrados por fecha
async function fetchEvents(startDate = null, endDate = null) {
    try {
        const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events');
        const data = await response.json();

        const eventsWithCoordinates = data.events.filter(event =>
            event.geometry && event.geometry.length > 0 &&
            event.geometry[0].coordinates.length >= 2
        );

        const filteredEvents = eventsWithCoordinates.filter(event => {
            const eventDate = new Date(event.geometry[0].date);

            if (startDate && endDate) {
                return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
            } else if (startDate) {
                return eventDate >= new Date(startDate);
            } else if (endDate) {
                return eventDate <= new Date(endDate);
            }

            return true;
        });

        clearMarkers();

        for (const event of filteredEvents) {
            const title = event.title;
            const category = event.categories[0].title;
            const coordinates = event.geometry[0].coordinates;

            if (coordinates.length === 2) {
                const [lon, lat] = coordinates;

                const icon = eventIcons[category] || L.icon({
                    iconUrl: './IMG/default.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                });

                // Crear el marcador
                const marker = L.marker([lat, lon], { icon: icon }).addTo(map);
                
                // Obtener el clima y agregarlo al popup
                const weatherInfo = await fetchWeather(lat, lon);
                marker.bindPopup(`<strong>${title}</strong><br>Category: ${category}<br>Weather: ${weatherInfo}`);
                
                markers.push(marker);
            }
        }
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

// Agregar el evento "submit" para filtrar los eventos por fechas
document.getElementById('date-filter').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (startDate || endDate) {
        fetchEvents(startDate, endDate);
    } else {
        alert('Por favor, selecciona al menos una fecha.');
    }
});

// Cargar los eventos al inicio sin filtrar por fechas
fetchEvents();
