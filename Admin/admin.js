// Tabs functionality
const tabs = document.querySelectorAll(".sidebar ul li");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
        // Remove active class from all tabs and content
        tabs.forEach((t) => t.classList.remove("active"));
        tabContents.forEach((tc) => tc.classList.remove("active"));

        // Add active class to clicked tab and corresponding content
        tab.classList.add("active");
        tabContents[index].classList.add("active");
    });
});

// Firebase configuration (Replace these values with your Firebase project settings)
const firebaseConfig = {
    apiKey: "AIzaSyA7WCKudR6woO-nvyEa8jUKEw04teGzKg0",
    authDomain: "http://zapgo-591e9.firebaseapp.com",
    databaseURL: "https://zapgo-591e9.firebaseio.com",
    projectId: "zapgo-591e9",
    storageBucket: "http://zapgo-591e9.firebasestorage.app",
    messagingSenderId: "61529599451",
    appId: "1:61529599451:web:dd23db761a87c27b670bfe",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM Elements
const usersTable = document.getElementById("usersTable");

// Fetch and display registered users from Firebase
function fetchUsersFromFirebase() {
    const usersRef = database.ref("users"); // Assuming "users" is the node in the database
    usersRef.on("value", (snapshot) => {
        usersTable.innerHTML = ""; // Clear the table before populating
        snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${childSnapshot.key}</td> <!-- User ID -->
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <button class="delete-btn" onclick="deleteUser('${childSnapshot.key}')">Delete</button>
                </td>
            `;
            usersTable.appendChild(row);
        });
    });
}

// Delete a user from Firebase
function deleteUser(userId) {
    if (confirm("Are you sure you want to delete this user?")) {
        database
            .ref("users/" + userId)
            .remove()
            .then(() => alert("User deleted successfully!"))
            .catch((error) => alert("Error deleting user: " + error.message));
    }
}

// Charging stations management
const addStationForm = document.getElementById("addStationForm");
const stationsList = document.getElementById("stationsList");

addStationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const stationName = document.getElementById("stationName").value;
    const stationLocation = document.getElementById("stationLocation").value;

    // Add station to Firebase (you can replace this with Firebase logic)
    const stationRef = database.ref("stations").push();
    stationRef
        .set({
            name: stationName,
            location: stationLocation,
        })
        .then(() => {
            const listItem = document.createElement("li");
            listItem.textContent = `${stationName} - ${stationLocation}`;
            stationsList.appendChild(listItem);

            // Clear form fields
            addStationForm.reset();
        })
        .catch((error) => alert("Error adding station: " + error.message));
});

// Fetch and display charging stations (optional)
function fetchStationsFromFirebase() {
    const stationsRef = database.ref("stations");
    stationsRef.on("value", (snapshot) => {
        stationsList.innerHTML = ""; // Clear the list before populating
        snapshot.forEach((childSnapshot) => {
            const station = childSnapshot.val();
            const listItem = document.createElement("li");
            listItem.textContent = `${station.name} - ${station.location}`;
            stationsList.appendChild(listItem);
        });
    });
}

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", () => {
    window.location.href = "login.html"; // Redirect to login page
});

// Statistics (Placeholder for chart.js or any other library)
document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("statsChart").getContext("2d");

    // Dummy chart using Chart.js (Add the library in the future for real data)
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
                {
                    label: "Bookings",
                    data: [10, 15, 7, 20, 30, 25],
                    backgroundColor: "#1fb800",
                },
            ],
        },
        options: {
            responsive: true,
        },
    });
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    window.location.href = 'admin-login.html'; // Redirect to admin-login page
});

// Call the fetch functions to load data dynamically
fetchUsersFromFirebase();
fetchStationsFromFirebase();
