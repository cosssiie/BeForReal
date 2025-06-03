from flask_socketio import SocketIO, emit, join_room, leave_room
from datetime import datetime
from flask_socketio import SocketIO

socketio = SocketIO(cors_allowed_origins="*")

@socketio.on('join')
def handle_join(room):
    join_room(room)

@socketio.on('leave')
def handle_leave(room):
    leave_room(room)

@socketio.on('new_message')
def handle_new_message(data):
    room = data.get('room')
    message = {
        'text': data.get('text'),
        'userId': data.get('userId'),
        'chatId': data.get('chatId'),
        'time': data.get('time') or datetime.utcnow().isoformat(),
        'sender': data.get('sender')
    }
    emit('new_message', message, room=room)


