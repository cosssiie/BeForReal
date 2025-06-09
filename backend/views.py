import uuid
from datetime import timezone, datetime
from flask_socketio import SocketIO, emit
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, current_app
from flask_login import login_required, current_user
from flask_socketio import join_room, leave_room, emit
from werkzeug.security import check_password_hash
from .models import User, Post, Chat, ChatUser, Message, Category, Comment, Reaction, Repost, Vote
from . import db
from sqlalchemy import desc, and_, or_ # can descending order the oder_by database. or_ is for multiple search termers
from .sockets import socketio
import os
from werkzeug.utils import secure_filename

views = Blueprint('views', __name__)
months = {1:"January",2:"February",3:"March",4:"April",5:"May",6:"June",7:"July",8:"August",9:"September",10:"October",11:"November",12:"December"}


#Posts:
@views.route('/api/posts', methods=['GET'])
@login_required
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
            'commentsCount': comments_count,
            'picture': post.picture,
            'userId': post.user_id,
        })
    return jsonify(posts=result)


@views.route('/api/posts/<int:post_id>', methods=['GET'])
@login_required
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
        'commentsCount': comments_count,
        'picture': post.picture,
        'userId': post.user_id,
    }

    return jsonify(post=result)

@views.route('/api/posts/by_category', methods=['GET'])
@login_required
def get_posts_by_category():
    category_id = request.args.get('category_id', type=int)

    if not category_id:
        return jsonify({'error': 'Missing category_id'}), 400

    query = db.session.query(Post, User, Category). \
        join(User, Post.user_id == User.id). \
        join(Category, Post.category_id == Category.id). \
        filter(Post.category_id == category_id). \
        order_by(Post.date.desc())

    posts = query.all()

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
            'commentsCount': comments_count,
            'picture': post.picture,
            'userId': post.user_id,
        })

    return jsonify(posts=result)

@views.route('/api/posts/by_user', methods=['GET'])
@login_required
def get_posts_by_user():
    user_id = request.args.get('user_id', type=int)

    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400

    posts = db.session.query(Post, User, Category). \
        join(User, Post.user_id == User.id). \
        join(Category, Post.category_id == Category.id). \
        filter(User.id == user_id). \
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
            'commentsCount': comments_count,
            'picture': post.picture,
            'userId': post.user_id,
        })

    return jsonify(posts=result)



@views.route('/api/comments/<int:post_id>', methods=['GET'])
@login_required
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

@views.route('/api/comments/<int:post_id>', methods=['POST'])
@login_required
def add_comment(post_id):
    data = request.get_json()
    text = data.get('text', '').strip()
    parent_id = data.get('parent_id')

    if not text:
        return jsonify({'error': 'Comment text is required'}), 400

    comment = Comment(
        comment_text=text,
        user_id=current_user.id,
        post_id=post_id,
        karma=0,
        parent_id=parent_id
    )
    db.session.add(comment)
    db.session.commit()

    return jsonify({
        'id': comment.id,
        'text': comment.comment_text,
        'author': current_user.username,
        'date': comment.date.isoformat(),
        'karma': comment.karma,
        'parent_id': comment.parent_id
    }), 201



@views.route('/api/posts', methods=['POST'])
@login_required
def create_post():
    content = request.form.get('content')
    category_id = request.form.get('category')
    user_id = current_user.id

    if not user_id or not content:
        return jsonify({'error': 'Missing userId or content'}), 400

    category = None
    if category_id:
        category = Category.query.get(category_id)
        if not category:
            return jsonify({'error': 'Category not found'}), 404

    image_files = request.files.getlist('images[]')
    image_file = image_files[0] if image_files else None

    filename = None
    if image_file:
        from werkzeug.utils import secure_filename
        import os

        filename = f"{uuid.uuid4().hex}_{secure_filename(image_file.filename)}"
        upload_folder = os.path.join(current_app.root_path, 'static', 'uploads')
        image_path = os.path.join(upload_folder, filename)

        # Створюємо папку, якщо її немає
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        image_file.save(image_path)

    new_post = Post(
        user_id=user_id,
        category_id=category.id if category else None,
        title=None,
        post_text=content,
        picture=filename,
        karma=0,
        is_temporary=False
    )

    db.session.add(new_post)
    db.session.commit()

    return jsonify({
        'message': 'Post created',
        'post': {
            'id': new_post.id,
            'username': current_user.username,
            'date': new_post.date.isoformat(),
            'content': new_post.post_text,
            'category': category.name if category else None,
            'karma': new_post.karma,
            'commentsCount': 0,
            'picture': filename,
            'userId': new_post.user_id,
        }
    }), 201


@views.route('/api/posts/<int:post_id>/vote', methods=['POST'])
@login_required
def vote(post_id):
    data = request.get_json()
    delta = data.get('delta')
    user_id = current_user.id

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
    vote = Vote.query.filter_by(user_id=user_id, post_id=post_id).first()

    if vote is None:
        # Користувач ще не голосував
        vote = Vote(user_id=user_id, post_id=post_id, value=delta)
        post.karma += delta
        db.session.add(vote)
    else:
        if vote.value == delta:
            # Голос такий самий – нічого не робити або можна скасувати (опційно)
            return jsonify({"message": "Already voted with the same value", "newKarma": post.karma}), 200
        else:
            # Зміна голосу: -1 → +1 або +1 → -1 → змінюємо на 2 очки
            post.karma += 1 * delta
            vote.value = delta  # оновлюємо голос

    db.session.commit()
    return jsonify({"newKarma": post.karma})


@views.route('/api/posts/<int:post_id>/react', methods=['POST'])
@login_required
def react_post(post_id):
    data = request.get_json()
    user_id = current_user.id
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
@login_required
def get_reactions(post_id):
    reactions = Reaction.query.filter_by(post_id=post_id).all()

    # Підрахунок кількості кожного emoji
    counts = {}
    for r in reactions:
        counts[r.emoji] = counts.get(r.emoji, 0) + 1

    return jsonify({'reactions': counts})

#Chats:
@views.route('/api/chats/<int:user_id>', methods=['GET'])
@login_required
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
            name = chat.group_name if chat.group_name else ", ".join([user.username for user in other_users])
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
@login_required
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
@login_required
def send_message():
    data = request.get_json()
    user_id = current_user.id
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
@login_required
def get_categories():
    categories = Category.query.all()
    return jsonify({
        "categories": [
            {"id": cat.id, "name": cat.name} for cat in categories
        ]
    })


@views.route('/api/posts/<int:post_id>/repost', methods=['POST'])
@login_required
def repost_post(post_id):
    data = request.get_json()
    user_id = data.get('userId')
    # Перевірка чи пост існує
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    # Перевірка чи вже є репост від цього користувача для цього поста
    existing_repost = Repost.query.filter_by(user_id=user_id, post_id=post_id).first()
    if existing_repost:
        return jsonify({'error': 'Already reposted'}), 400

    # Створення репоста
    new_repost = Repost(user_id=user_id, post_id=post_id)
    db.session.add(new_repost)
    db.session.commit()

    return jsonify({'message': 'Repost created successfully'}), 201


@views.route('/api/posts/<int:post_id>/reposts', methods=['GET'])
@login_required
def get_reposts(post_id):
    count = Repost.query.filter_by(post_id=post_id).count()
    user_reposted = Repost.query.filter_by(post_id=post_id, user_id=current_user.id).first() is not None
    return jsonify({
        'repostCount': count,
        'hasReposted': user_reposted
    })


@views.route('/api/reposts/by_user', methods=['GET'])
@login_required
def get_reposts_by_user():
    user_id = request.args.get('user_id', type=int)

    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400

    reposts = db.session.query(Repost). \
        join(Post, Repost.post_id == Post.id). \
        join(User, Post.user_id == User.id). \
        join(Category, Post.category_id == Category.id). \
        filter(Repost.user_id == user_id). \
        order_by(Repost.date.desc()).all()

    result = []
    for repost in reposts:
        post = repost.post
        user = post.user
        category = post.category
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

    return jsonify(reposts=result)

@views.route('/api/current_user')
@login_required
def get_current_user():
    return jsonify({
        'id': current_user.id,
        'username': current_user.username,
        'email': current_user.email,
        'is_moderator': current_user.is_moderator,
        'profile_picture': current_user.profile_picture,
        'karma': current_user.karma,
        'bio': current_user.bio,
        'date_joined': current_user.date_joined.isoformat()
    })


@views.route('/api/users/search', methods=['GET'])
@login_required
def search_users():
    q = request.args.get('q', '', type=str).strip()
    if not q:
        return jsonify({'error': 'Missing query'}), 400

    users = User.query.filter(User.username.ilike(f'{q}%')).all()
    return jsonify([{
        'id': user.id,
        'username': user.username,
        'profile_picture': user.profile_picture,
        'bio': user.bio,
    } for user in users])

@views.route('/api/users/<int:id>', methods=['GET'])
@login_required
def get_user_by_id(id):
    user = User.query.get_or_404(id)
    return jsonify({
        'id': user.id,
        'username': user.username,
        'profile_picture': user.profile_picture,
        'bio': user.bio,
        'karma': user.karma
    })

@views.route('/api/chats/start', methods=['POST'])
@login_required
def start_private_chat():
    data = request.get_json()
    other_user_id = data.get('user_id')

    if not other_user_id:
        return jsonify({'error': 'Missing user_id'}), 400

    if other_user_id == current_user.id:
        return jsonify({'error': 'Cannot start chat with yourself'}), 400

    # Перевірити, чи вже існує приватний чат між цими двома користувачами
    existing_chat = Chat.query\
        .join(ChatUser, Chat.id == ChatUser.chat_id)\
        .filter(
            Chat.is_group == False,
            ChatUser.user_id.in_([current_user.id, other_user_id])
        )\
        .group_by(Chat.id)\
        .having(db.func.count(ChatUser.user_id) == 2)\
        .first()

    if existing_chat:
        return jsonify({'chat_id': existing_chat.id, 'messages': 0})

    # Створити новий чат
    new_chat = Chat(is_group=False)
    db.session.add(new_chat)
    db.session.flush()  # Щоб отримати id до коміту

    db.session.add_all([
        ChatUser(chat_id=new_chat.id, user_id=current_user.id),
        ChatUser(chat_id=new_chat.id, user_id=other_user_id)
    ])

    db.session.commit()

    return jsonify({'chat_id': new_chat.id, 'messages': 0})


