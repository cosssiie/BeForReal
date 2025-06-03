from datetime import timezone, datetime

from flask_socketio import SocketIO, emit

from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from flask_socketio import join_room, leave_room, emit
from werkzeug.security import check_password_hash

from .models import User, Post, Chat, ChatUser, Message, Category, Comment, Reaction
from . import db
from sqlalchemy import desc, and_, or_ # can descending order the oder_by database. or_ is for multiple search termers
from .sockets import socketio

views = Blueprint('views', __name__)
months = {1:"January",2:"February",3:"March",4:"April",5:"May",6:"June",7:"July",8:"August",9:"September",10:"October",11:"November",12:"December"}

@views.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and user.password == password:
        return jsonify({'success': True, 'user_id': user.id}), 200
    else:
        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401
#Posts:
@views.route('/api/posts', methods=['GET'])
def get_posts():
    posts = db.session.query(Post, User, Category). \
        join(User, Post.user_id == User.id). \
        join(Category, Post.category_id == Category.id). \
        order_by(Post.date.desc()).all()

    result = []
    for post, user, category in posts:
        comments_count = len(post.comments)
        result.append({
            'id': post.id,
            'title': post.title,
            'content': post.post_text,
            'date': post.date.isoformat(),
            'username': user.username,
            'category': category.name,
            'karma': post.karma,
            'commentsCount': comments_count
        })
    return jsonify(posts=result)


@views.route('/api/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post_data = db.session.query(Post, User, Category). \
        join(User, Post.user_id == User.id). \
        join(Category, Post.category_id == Category.id). \
        filter(Post.id == post_id).first()

    if not post_data:
        return jsonify({'error': 'Post not found'}), 404

    post, user, category = post_data
    comments_count = len(post.comments)

    result = {
        'id': post.id,
        'title': post.title,
        'content': post.post_text,
        'date': post.date.isoformat(),
        'username': user.username,
        'category': category.name,
        'karma': post.karma,
        'commentsCount': comments_count
    }

    return jsonify(post=result)

@views.route('/api/comments/<int:post_id>', methods=['GET'])
def get_comments(post_id):
    comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.date.asc()).all()
    return jsonify([
        {
            'id': c.id,
            'text': c.comment_text,   
            'author': c.user.username,
            'date': c.date.isoformat(),
            'karma': c.karma,          
            'parent_id': c.parent_id 
        }
        for c in comments
    ])

@views.route('/api/posts', methods=['POST'])
def create_post():
    data = request.get_json()

    user_id = data.get('userId')
    content = data.get('content')
    category_id = data.get('category')

    if not user_id or not content:
        return jsonify({'error': 'Missing userId or content'}), 400

    category = None

    if category_id:
        category = Category.query.get(category_id)
        if not category:
            return jsonify({'error': 'Category not found'}), 404

    new_post = Post(
        user_id=user_id,
        category_id=category.id if category else None,
        title=None,
        post_text=content,
        picture=None,
        date=datetime.utcnow(),
        karma=0,
        is_temporary=False
    )

    db.session.add(new_post)
    db.session.commit()

    return jsonify({
        'message': 'Post created',
        'post': {
            'id': new_post.id,
            'username': 'You',
            'date': new_post.date.isoformat(),
            'content': new_post.post_text,
            'category': category.name if category else None,
            'karma': new_post.karma,
            'commentsCount': 0
        }
    }), 201


@views.route('/api/posts/<int:post_id>/vote', methods=['POST'])
def vote(post_id):
    data = request.get_json()
    print("Received data:", data)
    delta = data.get('delta')
    user_id = data.get('userId')

    if user_id is None:
        return jsonify({'error': 'User ID is required'}), 400
    if delta is None:
        return jsonify({'error': 'Vote delta is required'}), 400

    try:
        delta = int(delta)
        if delta not in [-1, 1]:
            return jsonify({'error': 'Delta must be -1 or 1'}), 400
    except ValueError:
        return jsonify({'error': 'Delta must be an integer'}), 400

    post = Post.query.get_or_404(post_id)

    if delta == -1:
        post.karma -= 1;
    else:
        post.karma += 1;

    db.session.commit()
    return jsonify({"newKarma": post.karma})

@views.route('/api/posts/<int:post_id>/react', methods=['POST'])
def react_post(post_id):
    data = request.get_json()
    user_id = data.get('userId')
    emoji = data.get('emoji')

    if not user_id or not emoji:
        return jsonify({'error': 'Missing userId or emoji'}), 400

    # Перевірка поста
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    # Знайти реакцію користувача на цей пост
    reaction = Reaction.query.filter_by(post_id=post_id, user_id=user_id).first()

    if reaction:
        # Оновити emoji
        reaction.emoji = emoji
    else:
        # Створити нову реакцію
        reaction = Reaction(user_id=user_id, post_id=post_id, emoji=emoji)
        db.session.add(reaction)

    db.session.commit()

    return jsonify({'message': 'Reaction saved'}), 200

@views.route('/api/posts/<int:post_id>/reactions', methods=['GET'])
def get_reactions(post_id):
    reactions = Reaction.query.filter_by(post_id=post_id).all()

    # Підрахунок кількості кожного emoji
    counts = {}
    for r in reactions:
        counts[r.emoji] = counts.get(r.emoji, 0) + 1

    return jsonify({'reactions': counts})

#Chats:
@views.route('/api/chats/<int:user_id>', methods=['GET'])
def get_chats(user_id):
    chats = Chat.query.join(ChatUser).filter(ChatUser.user_id == user_id).all()
    chat_list = []
    chat_num = 0

    for chat in chats:
        # Отримуємо учасників чату, крім поточного користувача
        other_users = [cu.user for cu in chat.chat_users if cu.user_id != user_id]
        other_user = other_users[0] if other_users else None

        # Останнє повідомлення
        last_message = Message.query.filter_by(chat_id=chat.id).order_by(Message.date.desc()).first()

        if chat.is_group:
            name = ", ".join([user.username for user in other_users])  # або chat.group_name якщо є
            chat_num += 1
        else:
            name = other_user.username if other_user else f"Chat {chat_num}"
            chat_num += 1

        chat_list.append({
            'id': chat.id,
            'name': name,
            'lastMessage': last_message.message_text if last_message else '',
        })
        print(f'other_user: {other_user}, username: {getattr(other_user, "username", None)}')

    return jsonify(chat_list)


@views.route('/api/messages/<int:chat_id>', methods=['GET'])
def get_messages(chat_id):
    messages = Message.query.filter_by(chat_id=chat_id).order_by(Message.date).all()
    message_list = [{
        'userId': msg.user_id,
        'sender': msg.user.username,
        'text': msg.message_text,
        'time': msg.date.isoformat()
    } for msg in messages]
    return jsonify(message_list)


@views.route('/api/messages', methods=['POST'])
def send_message():
    data = request.get_json()
    user_id = data.get('userId')
    chat_id = data.get('chatId')
    text = data.get('text')

    if not all([user_id, chat_id, text]):
        return jsonify({'error': 'Missing data'}), 400

    message = Message(user_id=user_id, chat_id=chat_id, message_text=text)
    db.session.add(message)
    db.session.commit()

    # Emit to chat room
    socketio.emit('new_message', {
        'userId': user_id,
        'chatId': chat_id,
        'sender': message.user.username,
        'text': text,
        'time': message.date.isoformat()
    }, room=f'chat_{chat_id}')

    return jsonify({'success': True, 'messageId': message.id})


@views.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify({
        "categories": [
            {"id": cat.id, "name": cat.name} for cat in categories
        ]
    })




