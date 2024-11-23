let map;
let directionsService;
let directionsRenderer;
let geocoder;
let markers = []; // Array to store all markers

const electricIcon = {
    url: "https://i.ibb.co/WGHKvFP/Untitled-design-4.png", // Replace with your custom icon URL
    scaledSize: new google.maps.Size(40, 40),
};

const startIcon = {
    url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png", // Green marker for start
    scaledSize: new google.maps.Size(40, 40),
};

const endIcon = {
    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", // Red marker for end
    scaledSize: new google.maps.Size(40, 40),
};

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true, // Prevent default A and B markers
    });
    geocoder = new google.maps.Geocoder();

    new google.maps.places.Autocomplete(document.getElementById("start"));
    new google.maps.places.Autocomplete(document.getElementById("end"));
}

document.getElementById("planRoute").addEventListener("click", () => {
    document.getElementById("planRoute").innerHTML =
        '<i class="bi bi-arrow-repeat loading"></i> Planning...';

    setTimeout(() => {
        calculateRoute();
        document.getElementById("planRoute").innerHTML = "Plan Route";
    }, 1500);
});

function clearMarkers() {
    // Remove all markers from the map
    markers.forEach((marker) => marker.setMap(null));
    markers = []; // Clear the markers array
}

function calculateRoute() {
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;
    const initialCharge = parseFloat(
        document.getElementById("initialCharge").value
    );
    const finalCharge = parseFloat(document.getElementById("finalCharge").value);
    const range = parseFloat(document.getElementById("range").value);

    // Separate time inputs
    const hours = parseInt(document.getElementById("hours").value, 10);
    const minutes = parseInt(document.getElementById("minutes").value, 10);
    const ampm = document.getElementById("ampm").value;

    // Validate inputs
    if (
        !start ||
        !end ||
        isNaN(initialCharge) ||
        isNaN(finalCharge) ||
        isNaN(range) ||
        isNaN(hours) ||
        isNaN(minutes) ||
        hours < 1 ||
        hours > 12 ||
        minutes < 0 ||
        minutes > 59
    ) {
        alert("Please fill out all fields with valid inputs!");
        return;
    }

    // Convert time to 24-hour format
    const time24 =
        ampm === "PM" && hours !== 12
            ? hours + 12
            : ampm === "AM" && hours === 12
            ? 0
            : hours;
    const startTime = `${time24.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:00`;

    const request = {
        origin: start,
        destination: end,
        travelMode: "DRIVING",
    };

    clearMarkers(); // Clear previous markers before displaying the new route

    directionsService.route(request, (result, status) => {
        if (status === "OK") {
            directionsRenderer.setDirections(result);

            const leg = result.routes[0].legs[0];

            // Add custom start marker
            const startMarker = new google.maps.Marker({
                position: leg.start_location,
                map: map,
                title: "Start Point",
                icon: startIcon,
            });
            markers.push(startMarker);

            // Add custom end marker
            const endMarker = new google.maps.Marker({
                position: leg.end_location,
                map: map,
                title: "End Point",
                icon: endIcon,
            });
            markers.push(endMarker);

            // Pass the entire route object to calculateStops
            calculateStops(result, initialCharge, finalCharge, range, startTime);
        } else {
            alert("Could not calculate route.");
        }
    });
}

function findStations(lat, lng, range) {
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
    let time = new Date(`1970-01-01T${startTime}`);

    for (let i = 0; i < legs.length; i++) {
        const leg = legs[i];
        const steps = leg.steps;

        for (let j = 0; j < steps.length; j++) {
            const step = steps[j];
            const distance = step.distance.value / 1000; // in km
            const travelTimeMinutes = step.duration.value / 60; // Travel time in minutes

            if (currentCharge < distance) {
                const lat = step.end_location.lat();
                const lng = step.end_location.lng();
                const stations = findStations(lat, lng, range);

                if (stations.length > 0) {
                    const station = stations[0]; // Choose the first station for simplicity

                    // Update time with travel time
                    time.setMinutes(time.getMinutes() + travelTimeMinutes);

                    stops.push({
                        name: station.name,
                        lat: station.lat,
                        lng: station.lng,
                        location: { lat: station.lat, lng: station.lng },
                        arrivalTime: time.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                        duration: station.duration,
                    });

                    // Add charging time
                    time.setMinutes(time.getMinutes() + station.duration);
                    currentCharge = range; // Full charge after stop
                }
            }

            currentCharge -= distance;
        }
    }

    resolveAddresses(stops);
}

function resolveAddresses(stops) {
    const promises = stops.map((stop) => {
        return new Promise((resolve, reject) => {
            geocoder.geocode({ location: stop.location }, (results, status) => {
                if (status === "OK" && results[0]) {
                    const addressComponents = results[0].address_components;
                    const city = addressComponents.find((comp) =>
                        comp.types.includes("locality")
                    );
                    const state = addressComponents.find((comp) =>
                        comp.types.includes("administrative_area_level_1")
                    );

                    stop.city = city
                        ? `${city.long_name}, ${state ? state.long_name : ""}`
                        : results[0].formatted_address;
                } else {
                    stop.city = "Unknown Location";
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
    const routeDetails = document.getElementById("routeDetails");
    const chargingStops = document.getElementById("chargingStops");

    routeDetails.classList.remove("hidden");
    chargingStops.innerHTML = "";

    stops.forEach((stop) => {
        const stopElement = document.createElement("div");
        stopElement.className = "p-3 bg-gray-50 rounded-md";
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

        const stopMarker = new google.maps.Marker({
            position: stop.location,
            map: map,
            icon: electricIcon,
        });
        markers.push(stopMarker); // Track each stop marker
    });
}

window.onload = initMap;