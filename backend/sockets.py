from flask import request
from flask_socketio import SocketIO, emit, join_room, leave_room
from datetime import datetime

socketio = SocketIO(cors_allowed_origins="*")

# Опціонально: зберігаємо останню кімнату користувача
user_rooms = {}

@socketio.on('join')
def handle_join(data):
    chat_id = data.get('chatId')
    sid = request.sid

    if chat_id is not None:
        new_room = f"chat_{chat_id}"

        # Якщо вже є стара кімната, залишаємо її
        old_room = user_rooms.get(sid)
        if old_room and old_room != new_room:
            leave_room(old_room)
            print(f"User {sid} left room: {old_room}")

        join_room(new_room)
        user_rooms[sid] = new_room
        print(f"User {sid} joined room: {new_room}")


@socketio.on('leave')
def handle_leave(data):
    chat_id = data.get('chatId')
    sid = request.sid

    if chat_id is not None:
        room = f"chat_{chat_id}"
        leave_room(room)
        if user_rooms.get(sid) == room:
            del user_rooms[sid]
        print(f"User {sid} left room: {room}")


@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    room = user_rooms.pop(sid, None)
    if room:
        print(f"User {sid} disconnected and left room: {room}")


@socketio.on('new_message')
def handle_new_message(data):
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
