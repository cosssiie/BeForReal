from flask import Flask
from flask_cors import CORS
from backend.models import db
from backend.views import views # твій Blueprint
from flask_socketio import SocketIO
from .sockets import socketio


def create_app():
    app = Flask(__name__)

    # Конфігурація
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mydb.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.secret_key = 'your-secret-key'  # заміни на щось надійне

    # Ініціалізація розширень
    CORS(app)
    db.init_app(app)
    socketio.init_app(app)

    # Реєстрація Blueprint'ів
    app.register_blueprint(views, url_prefix='/')

    # SocketIO та інші плагіни:

    return app

app = create_app()