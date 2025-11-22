from flask import Flask, send_file, jsonify, request, session, redirect, url_for
import json
import os
import re
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'tajny-klucz-minimum-20-znakow-123456789')
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True

# Prosta "baza danych" użytkowników
users = {
    'admin@mway.pl': {'password': 'admin123', 'name': 'Administrator'},
    'test@example.com': {'password': 'test123', 'name': 'Test User'}
}

# Baza newslettera
newsletter_subscribers = set()

# Baza ofert
offers = [
    {"id": 1, "name": "Ubezpieczenie AUTO", "price": 299, "category": "samochod"},
    {"id": 2, "name": "Ubezpieczenie DOM", "price": 199, "category": "mieszkanie"},
    {"id": 3, "name": "Ubezpieczenie ŻYCIE", "price": 149, "category": "zycie"},
    {"id": 4, "name": "Ubezpieczenie PODRÓŻ", "price": 99, "category": "podroz"}
]

# Obsługa plików statycznych
@app.route('/')
def index():
    return send_file('index.html')

@app.route('/<page>')
def static_pages(page):
    if '.' not in page and os.path.exists(f'{page}.html'):
        return send_file(f'{page}.html')
    if os.path.exists(page):
        return send_file(page)
    return 'Strona nie istnieje', 404

# API logowania
@app.route('/api/login', methods=['POST'])
def api_login():
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()
        password = data.get('password', '')
        
        if not email or not password:
            return {'success': False, 'message': 'Wpisz email i hasło'}, 400
        
        if email in users and users[email]['password'] == password:
            session['user'] = email
            session['user_name'] = users[email]['name']
            session['login_time'] = datetime.now().isoformat()
            return {
                'success': True, 
                'message': 'Zalogowano pomyślnie!', 
                'user': users[email]['name']
            }
        else:
            return {'success': False, 'message': 'Nieprawidłowy email lub hasło'}, 401
            
    except Exception as e:
        return {'success': False, 'message': 'Błąd serwera'}, 500

# Sprawdź czy użytkownik jest zalogowany
@app.route('/api/check-auth')
def check_auth():
    if 'user' in session:
        return {
            'logged_in': True, 
            'user': session['user_name'],
            'email': session['user']
        }
    return {'logged_in': False}

# Wylogowanie
@app.route('/api/logout')
def logout():
    session.clear()
    return {'success': True, 'message': 'Wylogowano pomyślnie'}

# API ofert
@app.route('/api/offers')
def api_offers():
    category = request.args.get('category', '')
    if category:
        filtered_offers = [offer for offer in offers if offer['category'] == category]
        return {'offers': filtered_offers}
    return {'offers': offers}

# API newslettera
@app.route('/api/newsletter', methods=['POST', 'GET'])
def newsletter():
    try:
        if request.method == 'GET':
            # Pobierz status newslettera dla zalogowanego użytkownika
            if 'user' in session:
                is_subscribed = session['user'] in newsletter_subscribers
                return {'subscribed': is_subscribed}
            return {'subscribed': False}
        
        data = request.get_json()
        email = data.get('email', '')
        action = data.get('action', '')
        
        if action == 'subscribe':
            if not email and 'user' in session:
                email = session['user']
            
            if email in newsletter_subscribers:
                return {'success': False, 'message': 'Już jesteś zapisany do newslettera!'}
            
            newsletter_subscribers.add(email)
            return {
                'success': True, 
                'message': 'Zapisano do newslettera! Dziękujemy!',
                'subscribed': True
            }
        
        elif action == 'unsubscribe':
            if not email and 'user' in session:
                email = session['user']
            
            newsletter_subscribers.discard(email)
            return {
                'success': True, 
                'message': 'Wypisano z newslettera',
                'subscribed': False
            }
            
        elif action == 'toggle':
            if 'user' in session:
                user_email = session['user']
                if user_email in newsletter_subscribers:
                    newsletter_subscribers.discard(user_email)
                    return {
                        'success': True, 
                        'message': 'Wypisano z newslettera',
                        'subscribed': False
                    }
                else:
                    newsletter_subscribers.add(user_email)
                    return {
                        'success': True, 
                        'message': 'Zapisano do newslettera!',
                        'subscribed': True
                    }
        
        return {'success': False, 'message': 'Nieznana akcja'}, 400
        
    except Exception as e:
        return {'success': False, 'message': 'Błąd serwera'}, 500

# API zakupów
@app.route('/api/purchase', methods=['POST'])
def purchase():
    if 'user' not in session:
        return {'success': False, 'message': 'Musisz być zalogowany'}, 403
    
    try:
        data = request.get_json()
        offer_id = data.get('offer_id')
        
        # Znajdź ofertę
        offer = next((o for o in offers if o['id'] == offer_id), None)
        if not offer:
            return {'success': False, 'message': 'Oferta nie istnieje'}, 404
        
        # Symulacja zakupu
        purchase_data = {
            'offer_id': offer_id,
            'offer_name': offer['name'],
            'price': offer['price'],
            'user': session['user'],
            'purchase_date': datetime.now().isoformat(),
            'status': 'completed'
        }
        
        return {
            'success': True, 
            'message': f'Kupiono {offer["name"]} za {offer["price"]} zł!',
            'purchase': purchase_data
        }
        
    except Exception as e:
        return {'success': False, 'message': 'Błąd podczas zakupu'}, 500

# Middleware - sprawdzanie dostępu do dashboard
@app.route('/dashboard.html')
def dashboard_protected():
    if 'user' not in session:
        return redirect('/login.html')
    return send_file('dashboard.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)