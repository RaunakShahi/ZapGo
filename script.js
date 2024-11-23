let map;
let directionsService;
let directionsRenderer;
let geocoder;

const electricIcon = {
    url: 'https://i.ibb.co/WGHKvFP/Untitled-design-4.png', // Replace with your custom icon URL
    scaledSize: new google.maps.Size(40, 40),
};

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    geocoder = new google.maps.Geocoder();
    directionsRenderer.setMap(map);

    new google.maps.places.Autocomplete(document.getElementById('start'));
    new google.maps.places.Autocomplete(document.getElementById('end'));
}

document.getElementById('planRoute').addEventListener('click', () => {
    document.getElementById('planRoute').innerHTML = '<i class="bi bi-arrow-repeat loading"></i> Planning...';

    setTimeout(() => {
        calculateRoute();
        document.getElementById('planRoute').innerHTML = 'Plan Route';
    }, 1500);
});

function calculateRoute() {
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;
    const initialCharge = parseFloat(document.getElementById('initialCharge').value);
    const finalCharge = parseFloat(document.getElementById('finalCharge').value);
    const range = parseFloat(document.getElementById('range').value);
    const startTime = document.getElementById('startTime').value;

    if (!start || !end || isNaN(initialCharge) || isNaN(finalCharge) || isNaN(range) || !startTime) {
        alert('Please fill out all fields!');
        return;
    }

    const request = {
        origin: start,
        destination: end,
        travelMode: 'DRIVING',
    };

    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);

            // Pass the entire route object to calculateStops
            calculateStops(result, initialCharge, finalCharge, range, startTime);
        } else {
            alert('Could not calculate route.');
        }
    });
}

function findStations(lat, lng, range) {
    // Example: Return mock data with distinct stations
    return [
        { name: "Charging Station A", lat: lat + 0.05, lng: lng + 0.05, duration: 30 },
        { name: "Charging Station B", lat: lat + 0.1, lng: lng + 0.1, duration: 45 },
        { name: "Charging Station C", lat: lat + 0.15, lng: lng + 0.15, duration: 30 },
    ];
}

function calculateStops(route, initialCharge, finalCharge, range, startTime) {
    const legs = route.routes[0].legs;
    const stops = [];
    let currentCharge = initialCharge;
    let time = new Date(`1970-01-01T${startTime}:00`);
    let distanceCovered = 0; // Track distance covered so far

    for (let i = 0; i < legs.length; i++) {
        const leg = legs[i];
        const steps = leg.steps;

        for (let j = 0; j < steps.length; j++) {
            const step = steps[j];
            const distance = step.distance.value / 1000; // in km
            const travelTimeMinutes = step.duration.value / 60; // Travel time in minutes

            if (currentCharge < distance) {
                // Find nearby stations
                const lat = step.end_location.lat();
                const lng = step.end_location.lng();
                const stations = findStations(lat, lng, range);

                if (stations.length > 0) {
                    const station = stations[0]; // Choose the first station for simplicity

                    // Update time with travel time
                    time.setMinutes(time.getMinutes() + travelTimeMinutes);

                    // Add the first station's travel time only once
                    if (distanceCovered === 0) {
                        time.setMinutes(time.getMinutes() + Math.floor(distance / 80 * 60)); // Approx 80 km/h travel
                    }
                    distanceCovered += distance;

                    stops.push({
                        name: station.name,
                        lat: station.lat,
                        lng: station.lng,
                        location: { lat: station.lat, lng: station.lng },
                        arrivalTime: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        duration: station.duration,
                    });

                    // Add charging time to current time
                    time.setMinutes(time.getMinutes() + station.duration);

                    currentCharge = range; // Assume full charge after stop
                }
            }

            currentCharge -= distance;
        }
    }

    // Resolve and display actual addresses in the sidebar
    resolveAddresses(stops);
}

function resolveAddresses(stops) {
    const promises = stops.map((stop) => {
        return new Promise((resolve, reject) => {
            geocoder.geocode({ location: stop.location }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    // Extract proper city or locality name
                    const addressComponents = results[0].address_components;
                    const city = addressComponents.find((comp) =>
                        comp.types.includes('locality')
                    );
                    const state = addressComponents.find((comp) =>
                        comp.types.includes('administrative_area_level_1')
                    );

                    // Use "City, State" format or fallback to full address
                    stop.city = city
                        ? `${city.long_name}, ${state ? state.long_name : ''}`
                        : results[0].formatted_address;
                } else {
                    stop.city = 'Unknown Location';
                }
                resolve(stop);
            });
        });
    });

    Promise.all(promises).then((resolvedStops) => {
        showRouteDetails(resolvedStops);
    });
}

function showRouteDetails(stops) {
    const routeDetails = document.getElementById('routeDetails');
    const chargingStops = document.getElementById('chargingStops');

    routeDetails.classList.remove('hidden');
    chargingStops.innerHTML = '';

    stops.forEach((stop) => {
        const stopElement = document.createElement('div');
        stopElement.className = 'p-3 bg-gray-50 rounded-md';
        stopElement.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h4 class="font-medium">${stop.city || stop.name}</h4>
                    <p class="text-sm text-gray-500">
                        Arrival Time: ${stop.arrivalTime} <br>
                        Charge Duration: ${stop.duration} mins
                    </p>
                </div>
                <button class="text-blue-500 text-sm hover:underline">Book</button>
            </div>
        `;
        chargingStops.appendChild(stopElement);

        // Add marker on the map
        new google.maps.Marker({
            position: stop.location,
            map: map,
            icon: electricIcon,
        });
    });
}

window.onload = initMap;
