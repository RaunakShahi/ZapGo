// Toggle Password Visibility
document.querySelectorAll('.togglePassword').forEach(button => {
    button.addEventListener('click', () => {
        const input = button.previousElementSibling;
        const icon = button.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('bi-eye', 'bi-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('bi-eye-slash', 'bi-eye');
        }
    });
});

// Show Loading Spinner
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission for demonstration
    document.getElementById('loadingSpinner').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('loadingSpinner').classList.add('hidden');
        alert('Login Successful!');
    }, 2000); // Simulate loading delay
});

// Toggle Between Email and Phone Fields
document.querySelectorAll('[name="loginMethod"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const emailField = document.getElementById('emailField');
        const phoneField = document.getElementById('phoneField');
        if (radio.value === 'email') {
            emailField.classList.remove('hidden');
            phoneField.classList.add('hidden');
        } else {
            emailField.classList.add('hidden');
            phoneField.classList.remove('hidden');
        }
    });
});
