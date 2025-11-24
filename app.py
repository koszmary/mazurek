from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_from_directory
import os
import json
from datetime import datetime, timedelta

app = Flask(__name__, 
            template_folder='.',
            static_folder='.')

app.secret_key = 'mway-travel-secret-key-2025'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

# Baza danych użytkowników (tymczasowo w pamięci)
users_db = {
    'user@example.com': {
        'password': 'password123',
        'name': 'Jan Kowalski',
        'firstName': 'Jan',
        'lastName': 'Kowalski',
        'phone': '+48123456789'
    }
}

bookings_db = {
    'user@example.com': [
        {
            'id': 1,
            'destination': 'Bali - Tropical Paradise',
            'date': '2025-06-15 do 2025-06-22',
            'travelers': 2,
            'hotel': 'Bali Beach Resort',
            'price': '2,499',
            'status': 'confirmed'
        }
    ]
}

# Ładowanie ofert z pliku JSON
def load_offers():
    try:
        with open('data/offers.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        # Domyślne oferty jeśli plik nie istnieje
        return {
            "offers": [
                {
                    "id": 1,
                    "title": "Tropical Paradise - Bali",
                    "description": "7 dni w raju na ziemi z all inclusive i wycieczkami po wyspie",
                    "price": "2,499",
                    "duration": "7 dni",
                    "persons": "2 osoby",
                    "rating": "4.8",
                    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
                    "destination": "Bali"
                },
                {
                    "id": 2,
                    "title": "Wyspy Greckie - rejs",
                    "description": "10-dniowy rejs po najpiękniejszych greckich wyspach z pełnym wyżywieniem",
                    "price": "3,199",
                    "duration": "10 dni",
                    "persons": "2 osoby",
                    "rating": "4.9",
                    "image": "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
                    "destination": "Grecja"
                }
            ]
        }

# Strony
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/index.html')
def index_alt():
    return redirect('/')

@app.route('/login.html')
def login_page():
    if 'user' in session:
        return redirect('/dashboard.html')
    return render_template('login.html')

@app.route('/register.html')
def register_page():
    if 'user' in session:
        return redirect('/dashboard.html')
    return render_template('register.html')

@app.route('/dashboard.html')
def dashboard():
    if 'user' not in session:
        return redirect('/login.html')
    return render_template('dashboard.html')

@app.route('/about.html')
def about():
    return render_template('about.html')

@app.route('/contact.html')
def contact():
    return render_template('contact.html')

@app.route('/offers.html')
def offers():
    return render_template('offers.html')

@app.route('/booking.html')
def booking():
    if 'user' not in session:
        return redirect('/login.html')
    return render_template('booking.html')

@app.route('/insurance.html')
def insurance():
    return render_template('insurance.html')

@app.route('/help.html')
def help():
    return render_template('help.html')

@app.route('/complaints.html')
def complaints():
    return render_template('complaints.html')

# API
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        firstName = data.get('firstName')
        lastName = data.get('lastName')
        phone = data.get('phone')
        
        if not email or not password or not firstName or not lastName:
            return jsonify({'success': False, 'message': 'Wszystkie pola są wymagane'}), 400
        
        if email in users_db:
            return jsonify({'success': False, 'message': 'Użytkownik już istnieje'}), 400
        
        # Dodaj nowego użytkownika
        users_db[email] = {
            'password': password,
            'name': f"{firstName} {lastName}",
            'firstName': firstName,
            'lastName': lastName,
            'phone': phone or ''
        }
        
        # Automatyczne logowanie po rejestracji
        session['user'] = email
        session['user_data'] = {
            'email': email,
            'name': users_db[email]['name'],
            'firstName': users_db[email]['firstName'],
            'lastName': users_db[email]['lastName'],
            'phone': users_db[email]['phone']
        }
        
        return jsonify({
            'success': True,
            'message': 'Rejestracja udana!',
            'user': session['user_data']
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': 'Wystąpił błąd serwera'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'success': False, 'message': 'Email i hasło są wymagane'}), 400
        
        user = users_db.get(email)
        if user and user['password'] == password:
            session['user'] = email
            session['user_data'] = {
                'email': email,
                'name': user['name'],
                'firstName': user['firstName'],
                'lastName': user['lastName'],
                'phone': user.get('phone', '')
            }
            
            return jsonify({
                'success': True,
                'message': 'Logowanie udane!',
                'user': session['user_data']
            })
        else:
            return jsonify({'success': False, 'message': 'Nieprawidłowy email lub hasło'}), 401
            
    except Exception as e:
        return jsonify({'success': False, 'message': 'Wystąpił błąd serwera'}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Wylogowano pomyślnie'})

@app.route('/api/check-auth')
def check_auth():
    if 'user' in session:
        return jsonify({
            'logged_in': True,
            'user': session['user_data']
        })
    else:
        return jsonify({'logged_in': False})

@app.route('/api/user/bookings')
def user_bookings():
    if 'user' not in session:
        return jsonify({'success': False, 'message': 'Nieautoryzowany dostęp'}), 401
    
    user_email = session['user']
    bookings = bookings_db.get(user_email, [])
    
    return jsonify({
        'success': True,
        'bookings': bookings
    })

@app.route('/api/user/profile', methods=['PUT'])
def update_profile():
    if 'user' not in session:
        return jsonify({'success': False, 'message': 'Nieautoryzowany dostęp'}), 401
    
    data = request.get_json()
    user_email = session['user']
    
    if user_email in users_db:
        users_db[user_email].update({
            'firstName': data.get('firstName'),
            'lastName': data.get('lastName'),
            'name': f"{data.get('firstName')} {data.get('lastName')}",
            'phone': data.get('phone')
        })
        
        session['user_data'] = {
            'email': user_email,
            'name': users_db[user_email]['name'],
            'firstName': users_db[user_email]['firstName'],
            'lastName': users_db[user_email]['lastName'],
            'phone': users_db[user_email].get('phone', '')
        }
        
        return jsonify({'success': True, 'message': 'Profil zaktualizowany pomyślnie'})
    
    return jsonify({'success': False, 'message': 'Użytkownik nie istnieje'})

@app.route('/api/offers')
def get_offers():
    offers_data = load_offers()
    return jsonify(offers_data)

@app.route('/api/book', methods=['POST'])
def book_trip():
    if 'user' not in session:
        return jsonify({'success': False, 'message': 'Musisz być zalogowany, aby zarezerwować wycieczkę'}), 401
    
    data = request.get_json()
    user_email = session['user']
    
    # Dodaj rezerwację
    if user_email not in bookings_db:
        bookings_db[user_email] = []
    
    new_booking = {
        'id': len(bookings_db[user_email]) + 1,
        'destination': data.get('destination'),
        'date': data.get('date'),
        'travelers': data.get('travelers'),
        'hotel': data.get('hotel'),
        'price': data.get('price'),
        'status': 'confirmed',
        'booking_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    bookings_db[user_email].append(new_booking)
    
    return jsonify({
        'success': True,
        'message': 'Rezerwacja zakończona pomyślnie!',
        'booking': new_booking
    })

@app.route('/api/newsletter', methods=['POST'])
def newsletter():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'success': False, 'message': 'Email jest wymagany'})
    
    return jsonify({'success': True, 'message': 'Dziękujemy za zapisanie się do newslettera!'})

# Static files - poprawiona obsługa plików statycznych
@app.route('/<path:filename>')
def serve_static(filename):
    # Lista dozwolonych rozszerzeń
    allowed_extensions = ('.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.html')
    
    if filename.endswith(allowed_extensions):
        try:
            return send_from_directory('.', filename)
        except Exception as e:
            print(f"Błąd przy serwowaniu pliku {filename}: {e}")
            return "Not found", 404
    
    # Dla nieznanych ścieżek, przekieruj na stronę główną
    return redirect('/')

# Specjalna obsługa dla plików w podkatalogach
@app.route('/images/<path:filename>')
def serve_images(filename):
    try:
        return send_from_directory('images', filename)
    except:
        return "Image not found", 404

@app.route('/data/<path:filename>')
def serve_data(filename):
    try:
        return send_from_directory('data', filename)
    except:
        return "Data not found", 404

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return redirect('/')

if __name__ == '__main__':
    print("🚀 Uruchamianie Mway Travel...")
    print("📍 Frontend: http://localhost:5000")
    print("🔑 Testowe konto: user@example.com / password123")
    print("📁 Static files serving from: .")
    app.run(debug=True, host='0.0.0.0', port=5000)