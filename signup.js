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

// Show Loading Spinner on Submit
document.getElementById('signupForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission for demonstration
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    document.getElementById('loadingSpinner').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('loadingSpinner').classList.add('hidden');
        alert('Signup Successful!');
    }, 2000); // Simulate loading delay
});
