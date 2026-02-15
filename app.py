import os
import sqlite3
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, flash, session

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'portfolio-secret-key-change-in-production')

# --- Database Setup ---
# Vercel has a read-only filesystem except /tmp
IS_VERCEL = os.environ.get('VERCEL', False)
if IS_VERCEL:
    DATABASE_DIR = '/tmp'
    DATABASE_PATH = os.path.join(DATABASE_DIR, 'database.db')
else:
    DATABASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database')
    DATABASE_PATH = os.path.join(DATABASE_DIR, 'database.db')

def get_db():
    """Get a database connection."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database and create tables."""
    os.makedirs(DATABASE_DIR, exist_ok=True)
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# --- Projects Data ---
PROJECTS = [
    {
        "title": "Smart Wheelchair / SMATSI",
        "description": "IoT-powered smart wheelchair system designed to improve mobility and quality of life for wheelchair users, featuring intelligent monitoring and connected assistive technology.",
        "tech": ["ESP32", "IoT", "Sensor Integration", "C++"],
        "github": "https://github.com/Zyxxboy",
        "year": "2024",
        "image": "images/projects/smatsi.jpg"
    },
    {
        "title": "AIRIS — Adaptive Intelligence Room Inside System",
        "description": "An AI-driven smart room system that adapts lighting, temperature, and environment based on occupant behavior using machine learning and IoT sensors.",
        "tech": ["Python", "Machine Learning", "ESP32", "Flask"],
        "github": "https://github.com/ZyxxBoy",
        "year": "2025",
        "image": "images/projects/airis.png"
    },
    {
        "title": "AQUASENSE",
        "description": "Smart water quality monitoring system using IoT sensors for real-time analysis of water parameters with cloud-based data visualization and alerts.",
        "tech": ["ESP32", "ThingSpeak", "Sensors", "MicroPython"],
        "github": "https://github.com/ZyxxBoy",
        "year": "2024",
        "image": "images/projects/aquasense.jpg"
    },
    {
        "title": "BEVISAT",
        "description": "AI-powered system integrating data annotation, classification, and validation to support intelligent decision-making and AI model development.",
        "tech": ["Python", "Roboflow", "Data Annotation", "AI"],
        "github": "https://github.com/ZyxxBoy",
        "year": "2025",
        "image": "images/projects/bevisat.jpg"
    },
    {
        "title": "SESA — Smart Energy System Analysis",
        "description": "IoT-based energy monitoring and analysis platform for tracking power consumption patterns with smart analytics and efficiency recommendations.",
        "tech": ["ESP32", "Python", "Data Analysis", "IoT"],
        "github": "https://github.com/ZyxxBoy",
        "year": "2024",
        "image": "images/projects/sesa.png"
    },
    {
        "title": "Deteksi Bahasa Isyarat Menggunakan Jari",
        "description": "Computer vision application for real-time hand sign language detection and recognition using finger tracking and machine learning models.",
        "tech": ["Python", "Computer Vision", "TensorFlow", "OpenCV"],
        "github": "https://github.com/ZyxxBoy",
        "year": "2024"
    },
    {
        "title": "OceanGuard — IoT Coastal Monitoring",
        "description": "Real-time coastal monitoring IoT dashboard for tracking sea level and wind speed with live charts, 7-day predictions, and smart alert system.",
        "tech": ["Python", "Flask", "IoT", "Chart.js"],
        "github": "https://github.com/ZyxxBoy",
        "year": "2026",
        "image": "images/projects/oceanguard.png"
    },
    {
        "title": "RBG — AI Background Removal",
        "description": "AI-powered background removal web application with drag-and-drop upload, before/after image comparison, and instant download functionality.",
        "tech": ["Python", "Flask", "rembg", "AI"],
        "github": "https://github.com/ZyxxBoy",
        "year": "2026",
        "image": "images/projects/rbg.png"
    },
    {
        "title": "SMARTNGON",
        "description": "Next-generation smart IoT system with integrated monitoring, automation, and intelligent control for modern connected environments.",
        "tech": ["ESP32", "IoT", "Flask", "MicroPython"],
        "github": "https://github.com/ZyxxBoy",
        "year": "2026",
        "image": "images/projects/smartngon.jpg"
    }
]

# --- Admin Password ---
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Koalapo')

# --- Routes ---
@app.route('/')
def index():
    """Render the main portfolio page."""
    return render_template('index.html', projects=PROJECTS)

@app.route('/contact', methods=['POST'])
def contact():
    """Handle contact form submission."""
    name = request.form.get('name', '').strip()
    email = request.form.get('email', '').strip()
    message = request.form.get('message', '').strip()

    # Validation
    if not name or not email or not message:
        flash('All fields are required.', 'error')
        return redirect(url_for('index') + '#contact')

    if '@' not in email or '.' not in email:
        flash('Please enter a valid email address.', 'error')
        return redirect(url_for('index') + '#contact')

    if len(message) < 10:
        flash('Message must be at least 10 characters long.', 'error')
        return redirect(url_for('index') + '#contact')

    # Store in database
    try:
        conn = get_db()
        conn.execute(
            'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
            (name, email, message)
        )
        conn.commit()
        conn.close()
        flash('Thank you! Your message has been sent successfully.', 'success')
    except Exception as e:
        flash('An error occurred. Please try again later.', 'error')
        print(f"Database error: {e}")

    return redirect(url_for('index') + '#contact')

@app.route('/admin', methods=['GET', 'POST'])
def admin():
    """Admin panel to view submitted messages."""
    if request.method == 'POST':
        password = request.form.get('password', '')
        if password == ADMIN_PASSWORD:
            session['admin_authenticated'] = True
        else:
            flash('Incorrect password.', 'error')
            return redirect(url_for('admin'))

    if not session.get('admin_authenticated'):
        return render_template('admin.html', authenticated=False, messages=[])

    # Fetch all messages
    conn = get_db()
    messages = conn.execute(
        'SELECT * FROM contacts ORDER BY created_at DESC'
    ).fetchall()
    conn.close()

    return render_template('admin.html', authenticated=True, messages=messages)

@app.route('/admin/logout')
def admin_logout():
    """Logout from admin panel."""
    session.pop('admin_authenticated', None)
    flash('Logged out successfully.', 'success')
    return redirect(url_for('admin'))

# --- Initialize DB ---
init_db()

# --- Run (local dev only) ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)
