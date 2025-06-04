from flask import Flask
from flask_cors import CORS
from backend.models import db
from backend.views import views # твій Blueprint
from backend.auth import auth
from flask_socketio import SocketIO
from .sockets import socketio
from flask_login import LoginManager

def create_app():
    app = Flask(__name__)

    # Конфігурація
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mydb.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.secret_key = 'your-secret-key'

    # Ініціалізація розширень
    CORS(app)
    db.init_app(app)

    # Ініціалізація Flask-Login
    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'  # Куди редіректити, якщо не залогінений
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        from backend.models import User
        return User.query.get(int(user_id))

    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')

    socketio.init_app(app)

    return app


app = create_app()