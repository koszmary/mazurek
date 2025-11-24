// Obsługa panelu użytkownika
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    setupTabNavigation();
    loadUserBookings();
    setupProfileForm();
});

// Załaduj dane użytkownika
function loadUserData() {
    // Pobierz dane z localStorage lub z API
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (userData.name) {
        document.getElementById('userName').textContent = `Witaj, ${userData.name}!`;
    }
    if (userData.email) {
        document.getElementById('userEmail').textContent = userData.email;
        document.getElementById('email').value = userData.email;
    }
    if (userData.firstName) {
        document.getElementById('firstName').value = userData.firstName;
    }
    if (userData.lastName) {
        document.getElementById('lastName').value = userData.lastName;
    }
    if (userData.phone) {
        document.getElementById('phone').value = userData.phone;
    }
}

// Obsługa nawigacji między zakładkami
function setupTabNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (this.getAttribute('onclick') === 'logout()') return;
            
            e.preventDefault();
            
            // Usuń aktywną klasę ze wszystkich elementów
            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Dodaj aktywną klasę do klikniętego elementu
            this.classList.add('active');
            
            // Pokaż odpowiednią zawartość
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Załaduj rezerwacje użytkownika
function loadUserBookings() {
    const bookingsList = document.getElementById('bookingsList');
    
    fetch('/api/user/bookings')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.bookings) {
                displayBookings(data.bookings);
            } else {
                bookingsList.innerHTML = '<div class="no-data">Brak rezerwacji</div>';
            }
        })
        .catch(error => {
            console.error('Błąd ładowania rezerwacji:', error);
            bookingsList.innerHTML = '<div class="no-data">Błąd ładowania rezerwacji</div>';
        });
}

// Wyświetl rezerwacje
function displayBookings(bookings) {
    const bookingsList = document.getElementById('bookingsList');
    
    if (bookings.length === 0) {
        bookingsList.innerHTML = `
            <div class="no-data">
                <i class="fas fa-suitcase-rolling fa-3x"></i>
                <h3>Brak rezerwacji</h3>
                <p>Nie masz jeszcze żadnych rezerwacji.</p>
                <a href="offers.html" class="btn btn-primary">Przeglądaj oferty</a>
            </div>
        `;
        return;
    }
    
    const bookingsHTML = bookings.map(booking => `
        <div class="booking-card">
            <div class="booking-header">
                <h4>${booking.destination}</h4>
                <span class="booking-status ${booking.status}">${booking.status}</span>
            </div>
            <div class="booking-details">
                <p><i class="fas fa-calendar"></i> ${booking.date}</p>
                <p><i class="fas fa-users"></i> ${booking.travelers} osoby</p>
                <p><i class="fas fa-hotel"></i> ${booking.hotel}</p>
            </div>
            <div class="booking-price">
                <strong>${booking.price} zł</strong>
            </div>
            <div class="booking-actions">
                <button class="btn btn-light btn-sm">Szczegóły</button>
                <button class="btn btn-primary btn-sm">Pobierz potwierdzenie</button>
            </div>
        </div>
    `).join('');
    
    bookingsList.innerHTML = bookingsHTML;
}

// Obsługa formularza profilu
function setupProfileForm() {
    const profileForm = document.getElementById('profileForm');
    
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value
            };
            
            updateUserProfile(formData);
        });
    }
}

// Aktualizacja profilu użytkownika
function updateUserProfile(formData) {
    const submitBtn = document.querySelector('#profileForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Zapisywanie...';
    submitBtn.disabled = true;
    
    fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Profil został zaktualizowany!');
            // Zaktualizuj dane w localStorage
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const updatedData = { ...userData, ...formData };
            localStorage.setItem('userData', JSON.stringify(updatedData));
            
            // Zaktualizuj wyświetlane dane
            loadUserData();
        } else {
            alert('Błąd aktualizacji profilu: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Błąd aktualizacji profilu:', error);
        alert('Wystąpił błąd podczas aktualizacji profilu');
    })
    .finally(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}