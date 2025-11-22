// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerButton = document.querySelector('.hamburger-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (hamburgerButton) {
        hamburgerButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on a link
    const mobileLinks = document.querySelectorAll('.mobile-menu a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    });
    
    // Newsletter form submission
    const newsletterForm = document.querySelector('.footer form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            alert(`Dziękujemy za zapisanie się do newslettera! Wiadomość potwierdzająca została wysłana na adres: ${email}`);
            newsletterForm.reset();
        });
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Sprawdź stan logowania i zaktualizuj UI
function updateAuthUI() {
    fetch('/api/check-auth')
        .then(response => response.json())
        .then(data => {
            const loginBtn = document.getElementById('loginBtn');
            const userMenu = document.getElementById('userMenu');
            const authSection = document.getElementById('authSection');
            
            if (data.logged_in) {
                // Użytkownik zalogowany - pokaż "Moje Konto"
                loginBtn.style.display = 'none';
                userMenu.style.display = 'flex';
                
                // Możesz też dodać imię użytkownika
                const accountBtn = userMenu.querySelector('.account-btn');
                accountBtn.textContent = `Witaj, ${data.user}`;
            } else {
                // Użytkownik niezalogowany - pokaż "Zaloguj się"
                loginBtn.style.display = 'block';
                userMenu.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Błąd sprawdzania auth:', error);
        });
}

// Wylogowanie
function logout() {
    fetch('/api/logout')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Zaktualizuj UI
                updateAuthUI();
                // Przekieruj na stronę główną
                window.location.href = '/';
            }
        });
}

// Uruchom przy załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    
    // Aktualizuj co 30 sekund (opcjonalnie)
    setInterval(updateAuthUI, 30000);
});


// Funkcja aktualizująca UI logowania
function updateAuthUI() {
    console.log('Sprawdzam logowanie...');
    fetch('/api/check-auth')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network error');
            }
            return response.json();
        })
        .then(data => {
            console.log('Odpowiedź auth:', data);
            
            const loginBtn = document.getElementById('loginBtn');
            const userMenu = document.getElementById('userMenu');
            const mobileLoginBtn = document.getElementById('mobileLoginBtn');
            const mobileUserMenu = document.getElementById('mobileUserMenu');
            
            if (data.logged_in) {
                // Użytkownik zalogowany - pokaż "Moje Konto"
                if (loginBtn) loginBtn.style.display = 'none';
                if (userMenu) userMenu.style.display = 'flex';
                if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
                if (mobileUserMenu) mobileUserMenu.style.display = 'flex';
                console.log('Użytkownik zalogowany - UI zaktualizowane');
            } else {
                // Użytkownik niezalogowany - pokaż "Zaloguj się"
                if (loginBtn) loginBtn.style.display = 'flex';
                if (userMenu) userMenu.style.display = 'none';
                if (mobileLoginBtn) mobileLoginBtn.style.display = 'flex';
                if (mobileUserMenu) mobileUserMenu.style.display = 'none';
                console.log('Użytkownik niezalogowany - UI zaktualizowane');
            }
        })
        .catch(error => {
            console.error('Błąd sprawdzania auth:', error);
            // W przypadku błędu pokaż przycisk logowania
            const loginBtn = document.getElementById('loginBtn');
            const userMenu = document.getElementById('userMenu');
            if (loginBtn) loginBtn.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        });
}

// Funkcja wylogowania
function logout() {
    if (confirm('Czy na pewno chcesz się wylogować?')) {
        fetch('/api/logout')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Zaktualizuj UI
                    updateAuthUI();
                    // Przekieruj na stronę główną
                    window.location.href = '/';
                }
            })
            .catch(error => {
                console.error('Błąd wylogowania:', error);
            });
    }
}

// Uruchom przy załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
    console.log('Strona załadowana - inicjalizacja auth UI');
    
    // Mobile menu toggle
    const hamburgerButton = document.querySelector('.hamburger-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (hamburgerButton && mobileMenu) {
        hamburgerButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
        });
    }
    
    // Sprawdź stan logowania
    updateAuthUI();
    
    // Newsletter form submission
    const newsletterForm = document.querySelector('.footer form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = document.getElementById('email');
            if (!emailInput) return;
            
            const email = emailInput.value;
            
            if (!email) {
                alert('Proszę wpisać adres email');
                return;
            }
            
            // Zapisz do newslettera przez API
            fetch('/api/newsletter', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email: email, action: 'subscribe'})
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                } else {
                    alert('Błąd: ' + data.message);
                }
                newsletterForm.reset();
            })
            .catch(error => {
                alert('Wystąpił błąd. Spróbuj ponownie.');
                console.error('Błąd newslettera:', error);
            });
        });
    }
});