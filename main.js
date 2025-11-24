// Mobile menu functionality - POPRAWIONA
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerButton = document.querySelector('.hamburger-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    const body = document.body;
    
    if (hamburgerButton && mobileMenu) {
        hamburgerButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            hamburgerButton.classList.toggle('active');
            body.classList.toggle('menu-open');
        });
    }
    
    // Close mobile menu when clicking on a link
    const mobileLinks = document.querySelectorAll('.mobile-menu a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            hamburgerButton.classList.remove('active');
            body.classList.remove('menu-open');
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = mobileMenu.contains(event.target);
        const isClickOnHamburger = hamburgerButton && hamburgerButton.contains(event.target);
        
        if (mobileMenu.classList.contains('active') && !isClickInsideMenu && !isClickOnHamburger) {
            mobileMenu.classList.remove('active');
            if (hamburgerButton) hamburgerButton.classList.remove('active');
            body.classList.remove('menu-open');
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            if (hamburgerButton) hamburgerButton.classList.remove('active');
            body.classList.remove('menu-open');
        }
    });
    
    // Resize observer - zamknij menu przy zmianie rozmiaru na desktop
    if (typeof ResizeObserver !== 'undefined') {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const width = entry.contentRect.width;
                if (width > 768 && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    if (hamburgerButton) hamburgerButton.classList.remove('active');
                    body.classList.remove('menu-open');
                }
            }
        });
        
        if (body) {
            resizeObserver.observe(body);
        }
    }
    
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
    
// Funkcje dostępności
function toggleHighContrast() {
    document.body.classList.toggle('high-contrast');
    localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
}

function increaseTextSize() {
    const currentSize = localStorage.getItem('textSize') || '1';
    const newSize = Math.min(4, parseInt(currentSize) + 1);
    setTextSize(newSize);
}

function decreaseTextSize() {
    const currentSize = localStorage.getItem('textSize') || '1';
    const newSize = Math.max(1, parseInt(currentSize) - 1);
    setTextSize(newSize);
}

function setTextSize(size) {
    // Usuń poprzednie klasy
    document.body.classList.remove('text-scale-1', 'text-scale-2', 'text-scale-3', 'text-scale-4');
    
    // Dodaj nową klasę
    document.body.classList.add(`text-scale-${size}`);
    localStorage.setItem('textSize', size.toString());
}

function resetAccessibility() {
    document.body.classList.remove('high-contrast', 'text-scale-1', 'text-scale-2', 'text-scale-3', 'text-scale-4');
    localStorage.removeItem('highContrast');
    localStorage.removeItem('textSize');
}

// Załaduj ustawienia przy starcie
document.addEventListener('DOMContentLoaded', function() {
    // Wysoki kontrast
    if (localStorage.getItem('highContrast') === 'true') {
        document.body.classList.add('high-contrast');
    }
    
    // Rozmiar tekstu
    const savedSize = localStorage.getItem('textSize');
    if (savedSize) {
        setTextSize(parseInt(savedSize));
    }
});

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
    
    // Sprawdź stan logowania
    updateAuthUI();
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
            const mobileLoginBtn = document.getElementById('mobileLoginBtn');
            const mobileUserMenu = document.getElementById('mobileUserMenu');
            
            if (loginBtn) loginBtn.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
            if (mobileLoginBtn) mobileLoginBtn.style.display = 'flex';
            if (mobileUserMenu) mobileUserMenu.style.display = 'none';
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

// Aktualizuj stan logowania co 30 sekund (opcjonalnie)
setInterval(updateAuthUI, 30000);


        // Funkcje dostępności
        function toggleHighContrast() {
            document.body.classList.toggle('high-contrast');
            localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
        }

        function increaseTextSize() {
            const currentSize = localStorage.getItem('textSize') || '1';
            const newSize = Math.min(4, parseInt(currentSize) + 1);
            setTextSize(newSize);
        }

        function decreaseTextSize() {
            const currentSize = localStorage.getItem('textSize') || '1';
            const newSize = Math.max(1, parseInt(currentSize) - 1);
            setTextSize(newSize);
        }

        function setTextSize(size) {
            // Usuń poprzednie klasy
            document.body.classList.remove('text-scale-1', 'text-scale-2', 'text-scale-3', 'text-scale-4');
            
            // Dodaj nową klasę
            document.body.classList.add(`text-scale-${size}`);
            localStorage.setItem('textSize', size.toString());
        }

        function resetAccessibility() {
            document.body.classList.remove('high-contrast', 'text-scale-1', 'text-scale-2', 'text-scale-3', 'text-scale-4');
            localStorage.removeItem('highContrast');
            localStorage.removeItem('textSize');
        }

        // Funkcja wylogowania
        function logout() {
            if (confirm('Czy na pewno chcesz się wylogować?')) {
                fetch('/api/logout', {
                    method: 'POST'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = 'index.html';
                    }
                })
                .catch(error => {
                    console.error('Błąd wylogowania:', error);
                    window.location.href = 'index.html';
                });
            }
        }

        // Załaduj ustawienia dostępności przy starcie
        document.addEventListener('DOMContentLoaded', function() {
            // Wysoki kontrast
            if (localStorage.getItem('highContrast') === 'true') {
                document.body.classList.add('high-contrast');
            }
            
            // Rozmiar tekstu
            const savedSize = localStorage.getItem('textSize');
            if (savedSize) {
                setTextSize(parseInt(savedSize));
            }

            // Sprawdź status logowania i zaktualizuj UI
            fetch('/api/check-auth')
                .then(response => response.json())
                .then(data => {
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
                    } else {
                        // Użytkownik niezalogowany - pokaż "Zaloguj się"
                        if (loginBtn) loginBtn.style.display = 'flex';
                        if (userMenu) userMenu.style.display = 'none';
                        if (mobileLoginBtn) mobileLoginBtn.style.display = 'flex';
                        if (mobileUserMenu) mobileUserMenu.style.display = 'none';
                    }
                })
                .catch(error => {
                    console.error('Błąd sprawdzania auth:', error);
                });

            // Newsletter form
            const newsletterForm = document.getElementById('newsletterForm');
            if (newsletterForm) {
                newsletterForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const email = document.getElementById('newsletterEmail').value;
                    
                    if (!email) {
                        alert('Proszę wpisać adres email');
                        return;
                    }
                    
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