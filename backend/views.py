from flask_socketio import SocketIO, emit

from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from flask_socketio import emit

from .models import User, Post, Chat, ChatUser, Message
from . import db
from sqlalchemy import desc, and_, or_ # can descending order the oder_by database. or_ is for multiple search termers


views = Blueprint('views', __name__)
months = {1:"January",2:"February",3:"March",4:"April",5:"May",6:"June",7:"July",8:"August",9:"September",10:"October",11:"November",12:"December"}

@views.route('/api/posts', methods=['GET'])
def get_posts():
    posts = db.session.query(Post, User).join(User, Post.user_id == User.id).order_by(Post.date.desc()).limit(10).all()
    result = []
    for post, user in posts:
        result.append({
            'id': post.id,
            'content': post.content,
            'date': post.date.isoformat(),
            'username': user.username
        })
    return {'posts': result}


@views.route('/api/chats/<int:user_id>', methods=['GET'])
def get_chats(user_id):
    chats = Chat.query.join(ChatUser).filter(ChatUser.user_id == user_id).all()
    chat_list = []
    for chat in chats:
        last_message = Message.query.filter_by(chat_id=chat.id).order_by(Message.date.desc()).first()
        chat_list.append({
            'id': chat.id,
            'name': f'Chat {chat.id}',  # або витягни назву групи/юзерів
            'lastMessage': last_message.message_text if last_message else '',
        })
    return jsonify(chat_list)

@views.route('/api/messages/<int:chat_id>', methods=['GET'])
def get_messages(chat_id):
    messages = Message.query.filter_by(chat_id=chat_id).order_by(Message.date).all()
    message_list = [{
        'sender': msg.user.username,
        'text': msg.message_text,
        'time': msg.date.strftime('%H:%M')
    } for msg in messages]
    return jsonify(message_list)
