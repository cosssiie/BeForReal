from backend import app
from backend.views import socketio

if __name__ == '__main__':
    socketio.run(app, debug=True)
