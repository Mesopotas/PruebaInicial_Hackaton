// Inicializa el mapa centrado en el mundo
const map = L.map('map').setView([20, 0], 2);

// Agrega un mapa base desde OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Mapa de asociaciones entre categorías y nombres de archivos de imágenes
const categoryToImage = {
    'Drought': 'drough.png',
    'Dust and Haze': 'dustandhaze.png',
    'Earthquake': 'earthquake.png',
    'Floods': 'floods.png',
    'Landslide': 'landslide.png',
    'Manmade': 'manmade.png',
    'Sea and Ice Lakes': 'seaandicelakes.png',
    'Storm': 'storm.png',
    'Snow': 'snow.png',
    'Temperature': 'temperature.png',
    'Volcano': 'volcano.png',
    'Watercolor': 'watercolor.png',
    'Wildfire': 'wildfire.png'
};

// URL de la imagen personalizada para los puntos
const customImageUrl = 'https://images.emojiterra.com/google/android-11/512px/1f525.png';

// Función para obtener los datos de la API de EONET
async function fetchEvents(startDate = null, endDate = null) {
    try {
        const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events');
        const data = await response.json();

        // Filtra eventos con coordenadas disponibles
        const eventsWithCoordinates = data.events.filter(event => 
            event.geometry && event.geometry.length > 0 &&
            event.geometry[0].coordinates.length >= 2
        );

        // Filtra eventos por fechas
        const filteredEvents = eventsWithCoordinates.filter(event => {
            const eventDate = new Date(event.geometries[0].date);
            if (startDate && endDate) {
                return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
            }
            return true; // Si no hay fechas de inicio y fin, no se filtra por fecha
        });

        // Limpia los marcadores existentes
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Procesa los eventos y los añade al mapa
        filteredEvents.forEach(event => {
            const title = event.title;
            const category = event.categories[0].title;
            const coordinates = event.geometry[0].coordinates;

            // Verifica si las coordenadas están en el formato [longitud, latitud]
            if (coordinates.length === 2) {
                const [lng, lat] = coordinates; // Leaflet usa [lat, lng]
                
                // Obtiene la imagen correspondiente a la categoría del evento
                const imageUrl = categoryToImage[category] ? `IMG/${categoryToImage[category]}` : customImageUrl;
                
                // Crea un ícono personalizado con la imagen
                const icon = L.icon({
                    iconUrl: imageUrl,
                    iconSize: [32, 32], // Ajusta el tamaño del ícono según sea necesario
                    iconAnchor: [16, 32], // Ajusta el ancla del ícono
                    popupAnchor: [0, -32] // Ajusta el ancla del popup
                });
                
                // Agrega un marcador al mapa con el ícono personalizado
                L.marker([lat, lng], { icon })
                    .addTo(map)
                    .bindPopup(`<strong>${title}</strong><br>Category: ${category}`);
            }
        });
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

// Maneja el envío del formulario de filtro por fechas
document.getElementById('date-filter').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    fetchEvents(startDate, endDate);
});

// Llama a la función para cargar los eventos inicialmente
fetchEvents();
