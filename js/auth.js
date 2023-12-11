// auth.js

document.addEventListener('DOMContentLoaded', function () {
    const authContainer = document.getElementById('authContainer');
    const taskFilterSelect = document.getElementById('taskFilter');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showSignupFormButton = document.getElementById('showSignupFormButton');
    const showLoginFormButton = document.getElementById('showLoginFormButton');

    let authToken = null;

    const apiUrl = 'https://65708cfd09586eff664198e0.mockapi.io';

    // Check if the user is already logged in
    const storedAuthToken = localStorage.getItem('authToken');
    if (storedAuthToken) {
        authToken = storedAuthToken;
        showTaskContainer();
        fetchTasks();
    } else {
        showLoginForm();
    }

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        login(username, password);
    });

    signupForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupPasswordConfirm').value;
        if (password === confirmPassword) {
            signup(username, password);
        } else {
            alert('Password and Confirm Password do not match.');
        }
    });

    showSignupFormButton.addEventListener('click', function () {
        showSignupForm();
    });

    showLoginFormButton.addEventListener('click', function () {
        showLoginForm();
    });

    function showLoginForm() {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    }

    function showSignupForm() {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }

    function showTaskContainer() {
        authContainer.style.display = 'none';
        taskContainer.style.display = 'block';
    }

    function signup(username, password) {
        fetch(`${apiUrl}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password,
            }),
        })
        .then(response => response.json())
        .then(data => {
            alert('Sign-up successful. You can now log in.');
            showLoginForm();
        })
        .catch(error => {
            console.error('Error during sign-up:', error);
            alert('Sign-up failed. Please try again.');
        });
    }

    function login(username, password) {
        fetch(`${apiUrl}/users`, {
            method: 'GET',
        })
        .then(response => response.json())
        .then(users => {
            const user = users.find(user => user.username === username && user.password === password);
            if (user) {
                authToken = user.token || generateToken(); // Assuming the server provides a token for authentication
                localStorage.setItem('authToken', authToken);
                showTaskContainer();
                fetchTasks();
            } else {
                alert('Login failed. Please check your credentials.');
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
            alert('Login failed. Please check your credentials.');
        });
    }

    function generateToken() {
        return Math.random().toString(36).substr(2);
    }

    
});
