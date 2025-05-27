from flask import Flask
from models import db

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mydb.db'  # або інша БД
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
