document.getElementById('adminLoginForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Simulate login validation
    if (username === 'admin' && password === 'password123') {
        // Successful login
        alert('Login successful!');
        window.location.href = 'admin-dashboard.html'; // Redirect to admin dashboard
    } else {
        // Display error message
        errorMessage.textContent = 'Invalid username or password!';
        errorMessage.classList.remove('hidden');
    }
});

document.getElementById("loginButton").addEventListener("click", () => {
    window.location.href = 'admin.html'; // Redirect to admin-login page
});