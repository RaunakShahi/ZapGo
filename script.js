let map;
let directionsService;
let directionsRenderer;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    new google.maps.places.Autocomplete(document.getElementById('start'));
    new google.maps.places.Autocomplete(document.getElementById('end'));
}

document.getElementById('loginBtn').addEventListener('click', () => {
    document.getElementById('loginModal').classList.remove('hidden');
});

document.getElementById('planRoute').addEventListener('click', () => {
    document.getElementById('planRoute').innerHTML = '<i class="bi bi-arrow-repeat loading"></i> Planning...';

    setTimeout(() => {
        calculateRouteWithChargingStations();
        document.getElementById('planRoute').innerHTML = 'Plan Route';
    }, 1500);
});

document.getElementById('bookAll').addEventListener('click', () => {
    document.getElementById('paymentModal').classList.remove('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('fixed')) {
        e.target.classList.add('hidden');
    }
});

function calculateRouteWithChargingStations() {
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;

    if (!start || !end) return;

    const request = {
        origin: start,
        destination: end,
        travelMode: 'DRIVING',
    };

    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            findChargingStations(result.routes[0]);
        }
    });
}

function findChargingStations(route) {
    const routeDetails = document.getElementById('routeDetails');
    const chargingStops = document.getElementById('chargingStops');
    routeDetails.classList.remove('hidden');
    chargingStops.innerHTML = '';

    const path = route.overview_path;
    const stops = [];

    const service = new google.maps.places.PlacesService(map);

    let completedRequests = 0;
    const interval = Math.max(1, Math.floor(path.length / 10)); // Adjust interval dynamically

    for (let i = 0; i < path.length; i += interval) {
        const waypoint = path[i];
        const request = {
            location: waypoint,
            radius: 5000,
            type: 'electric_vehicle_charging_station',
        };

        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                stops.push(results[0]); // Pick the first charging station from results
            }

            completedRequests++;
            if (completedRequests === Math.ceil(path.length / interval)) {
                displayChargingStops(stops);
                displayChargingMarkers(stops);
            }
        });
    }
}

function displayChargingStops(stops) {
    const chargingStops = document.getElementById('chargingStops');
    stops.forEach((stop) => {
        const stopElement = document.createElement('div');
        stopElement.className = 'p-3 bg-gray-50 rounded-md';
        stopElement.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h4 class="font-medium">${stop.name}</h4>
                    <p class="text-sm text-gray-500">${stop.vicinity}</p>
                </div>
                <button class="text-blue-500 text-sm hover:underline">Book</button>
            </div>
        `;
        chargingStops.appendChild(stopElement);
    });
}

function displayChargingMarkers(stops) {
    const electricIcon = {
        url: 'https://cdn-icons-png.flaticon.com/512/477/477235.png', // Replace with a custom EV icon URL if needed
        scaledSize: new google.maps.Size(30, 30), // Size of the icon
    };

    stops.forEach((stop) => {
        new google.maps.Marker({
            position: stop.geometry.location,
            map: map,
            icon: electricIcon,
            title: stop.name,
        });
    });
}

window.onload = initMap;