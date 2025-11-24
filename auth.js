// Obsługa formularza logowania
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const messageDiv = document.getElementById('loginMessage');
            
            // Walidacja podstawowa
            if (!email || !password) {
                showMessage('Proszę wypełnić wszystkie pola', 'error');
                return;
            }
            
            // Wyślij żądanie logowania
            loginUser(email, password);
        });
    }
});

// Funkcja logowania użytkownika
function loginUser(email, password) {
    const messageDiv = document.getElementById('loginMessage');
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Pokazanie ładowania
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logowanie...';
    submitBtn.disabled = true;
    
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Błąd sieci');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showMessage('Logowanie udane! Przekierowujemy...', 'success');
            
            // Zapisz token lub dane sesji
            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }
            if (data.user) {
                localStorage.setItem('userData', JSON.stringify(data.user));
            }
            
            // Przekieruj do panelu użytkownika po krótkim opóźnieniu
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } else {
            showMessage(data.message || 'Błąd logowania', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    })
    .catch(error => {
        console.error('Błąd logowania:', error);
        showMessage('Wystąpił błąd podczas logowania. Spróbuj ponownie.', 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// Funkcja wyświetlania komunikatów
function showMessage(message, type) {
    const messageDiv = document.getElementById('loginMessage');
    if (!messageDiv) return;
    
    messageDiv.style.display = 'block';
    messageDiv.textContent = message;
    messageDiv.className = ''; // Reset classes
    
    if (type === 'success') {
        messageDiv.style.backgroundColor = '#d4edda';
        messageDiv.style.color = '#155724';
        messageDiv.style.border = '1px solid #c3e6cb';
    } else if (type === 'error') {
        messageDiv.style.backgroundColor = '#f8d7da';
        messageDiv.style.color = '#721c24';
        messageDiv.style.border = '1px solid #f5c6cb';
    }
}

// Sprawdź czy użytkownik jest już zalogowany (przekieruj z login.html jeśli tak)
function checkAuthStatus() {
    const currentPage = window.location.pathname;
    
    // Jeśli jesteś na stronie logowania i już jesteś zalogowany, przekieruj do dashboard
    if (currentPage.includes('login.html')) {
        fetch('/api/check-auth')
            .then(response => response.json())
            .then(data => {
                if (data.logged_in) {
                    window.location.href = 'dashboard.html';
                }
            })
            .catch(error => {
                console.error('Błąd sprawdzania statusu auth:', error);
            });
    }
    
    // Jeśli jesteś na dashboard i nie jesteś zalogowany, przekieruj do login
    if (currentPage.includes('dashboard.html')) {
        fetch('/api/check-auth')
            .then(response => response.json())
            .then(data => {
                if (!data.logged_in) {
                    window.location.href = 'login.html';
                }
            })
            .catch(error => {
                console.error('Błąd sprawdzania statusu auth:', error);
                window.location.href = 'login.html';
            });
    }
}

// Uruchom sprawdzenie statusu przy załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});