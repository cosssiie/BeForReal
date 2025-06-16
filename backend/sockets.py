from flask_socketio import SocketIO, emit, join_room, leave_room
from datetime import datetime

socketio = SocketIO(cors_allowed_origins="*")


@socketio.on('join')
def handle_join(data):
    """
    data: { "chatId": 123 }
    """
    chat_id = data.get('chatId')
    if chat_id is not None:
        room = f"chat_{chat_id}"
        join_room(room)
        print(f"User joined room: {room}")


@socketio.on('leave')
def handle_leave(data):
    """
    data: { "chatId": 123 }
    """
    chat_id = data.get('chatId')
    if chat_id is not None:
        room = f"chat_{chat_id}"
        leave_room(room)
        print(f"User left room: {room}")


@socketio.on('new_message')
def handle_new_message(data):
    """
    data: {
        "text": "Hello",
        "userId": 1,
        "chatId": 123,
        "time": "...",
        "sender": {...}
    }
    """
    chat_id = data.get('chatId')
    if chat_id is None:
        return

    room = f"chat_{chat_id}"
    message = {
        'text': data.get('text'),
        'userId': data.get('userId'),
        'chatId': chat_id,
        'time': data.get('time') or datetime.utcnow().isoformat(),
        'sender': data.get('sender')
    }
    emit('new_message', message, room=room)
    print(f"Sent message to room: {room}")
