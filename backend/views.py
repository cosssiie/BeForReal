import uuid
from datetime import timezone, datetime
from flask_socketio import SocketIO, emit
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, current_app
from flask_login import login_required, current_user
from flask_socketio import join_room, leave_room, emit
from werkzeug.security import check_password_hash
from .models import User, Post, Chat, ChatUser, Message, Category, Comment, Reaction, Repost, Vote, ReportPost, \
    ReportUser
from . import db
from sqlalchemy import desc, and_, or_ # can descending order the oder_by database. or_ is for multiple search termers
from .sockets import socketio
import os
from werkzeug.utils import secure_filename

views = Blueprint('views', __name__)
months = {1:"January",2:"February",3:"March",4:"April",5:"May",6:"June",7:"July",8:"August",9:"September",10:"October",11:"November",12:"December"}


#Posts:
from flask_login import current_user

@views.route('/api/posts', methods=['GET'])
@login_required
def get_posts():
    user_id = current_user.id

    posts = db.session.query(Post, User, Category). \
        join(User, Post.user_id == User.id). \
        join(Category, Post.category_id == Category.id). \
        order_by(Post.date.desc()).all()

    result = []
    for post, user, category in posts:
        comments_count = len(post.comments)

        # Знайдемо голос користувача для цього поста
        vote = Vote.query.filter_by(user_id=user_id, post_id=post.id).first()
        user_vote = vote.value if vote else 0

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
            'user_vote': user_vote,  # <-- додаємо інфу про голос
        })
    return jsonify(posts=result)


@views.route('/api/posts/<int:post_id>', methods=['GET'])
@login_required
def get_post(post_id):
    user_id = current_user.id

    post_data = db.session.query(Post, User, Category). \
        join(User, Post.user_id == User.id). \
        join(Category, Post.category_id == Category.id). \
        filter(Post.id == post_id).first()

    if not post_data:
        return jsonify({'error': 'Post not found'}), 404

    post, user, category = post_data
    comments_count = len(post.comments)

    # Шукаємо голос користувача за цей пост
    vote = Vote.query.filter_by(user_id=user_id, post_id=post_id).first()
    user_vote = vote.value if vote else 0

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
        'isModerator': user.is_moderator,
        'user_vote': user_vote,  # додано інформацію про голос користувача
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
            'userId': c.user.id,
            'isModerator': c.user.is_moderator,
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

@views.route('/api/comments/<int:comment_id>', methods=['DELETE'])
@login_required
def delete_comment(comment_id):
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404

    if current_user.id != comment.user_id and not current_user.is_moderator:
        return jsonify({'error': 'Permission denied'}), 403

    db.session.delete(comment)
    db.session.commit()
    return jsonify({'message': 'Comment deleted'})

@views.route('/api/posts/<int:post_id>/report', methods=['POST'])
@login_required
def report_post(post_id):
    data = request.get_json()
    reason = data.get('reason')
    reporter_id = current_user.id
    reporter_username = current_user.username

    if not reason:
        return jsonify({'error': 'Потрібна причина скарги'}), 400

    report = ReportPost(
        reporter_id=reporter_id,
        reporter_username=reporter_username,
        post_id=post_id,
        reason=reason,
        date=datetime.utcnow()
    )
    db.session.add(report)
    db.session.commit()
    return jsonify({'success': True})


@views.route("/api/users/<int:user_id>/report", methods=["POST"])
@login_required
def report_user(user_id):
    data = request.get_json()
    reason = data.get("reason")
    reporter_id = current_user.id
    reporter_username = current_user.username
    if not reason:
        return jsonify({"error": "Причина обов’язкова"}), 400

    if user_id == current_user.id:
        return jsonify({"error": "Не можна скаржитися на себе"}), 400

    existing_report = ReportUser.query.filter_by(
        reporter_id=current_user.id,
        reported_user_id=user_id
    ).first()
    if existing_report:
        return jsonify({"error": "Ви вже скаржились на цього користувача"}), 400

    report = ReportUser(
        reporter_id=reporter_id,
        reporter_username=reporter_username,
        reported_user_id=user_id,
        reason=reason,
        date=datetime.utcnow()
    )
    db.session.add(report)
    db.session.commit()

    return jsonify({"message": "Скаргу надіслано"}), 200


@views.route('/api/reports', methods=['GET'])
@login_required
def get_reports():
    if not current_user.is_moderator:
        return jsonify({'error': 'Access denied'}), 403

    reports = ReportPost.query.all()
    result = []
    for report in reports:
        result.append({
            'post_id': report.post_id,
            'reason': report.reason,
            'reporter_id': report.reporter_id,
            'reporter_username': report.reporter_username,
            'date': report.date.isoformat(),
        })
    return jsonify(result)


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


@views.route('/api/posts/<int:post_id>', methods=['DELETE'])
@login_required
def delete_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    if current_user.id != post.user_id and not current_user.is_moderator:
        return jsonify({'error': 'Permission denied'}), 403

    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Post deleted'})



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
        # Користувач ще не голосував — створюємо новий голос
        vote = Vote(user_id=user_id, post_id=post_id, value=delta)
        post.karma += delta
        db.session.add(vote)
    else:
        if vote.value == delta:
            # Повторне голосування тим самим значенням — скасовуємо голос
            post.karma -= delta
            db.session.delete(vote)
        else:
            # Зміна голосу з -1 на +1 або навпаки — змінюємо карму на 2
            post.karma += 2 * delta
            vote.value = delta

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
        'id': msg.id,
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
        'id': message.id,
        'userId': user_id,
        'chatId': chat_id,
        'sender': message.user.username,
        'text': text,
        'time': message.date.isoformat()
    }, room=f'chat_{chat_id}')

    return jsonify({
        'id': message.id,
        'userId': user_id,
        'chatId': chat_id,
        'sender': message.user.username,
        'text': text,
        'time': message.date.isoformat()
    }), 201


@views.route('/api/categories', methods=['GET'])
@login_required
def get_categories():
    categories = Category.query.all()
    return jsonify({
        "categories": [
            {"id": cat.id, "name": cat.name} for cat in categories
        ]
    })

@views.route('/api/messages/<int:message_id>', methods=['DELETE'])
@login_required
def delete_message(message_id):
    message = Message.query.get_or_404(message_id)

    # Перевірка прав (опційно — лише власник або адмін може видаляти)
    if message.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    # Видаляємо replies, або прив'язуємо їх до None, або обробляємо інакше
    replies = Message.query.filter_by(parent_id=message.id).all()
    for reply in replies:
        db.session.delete(reply)  # або reply.parent_id = None

    db.session.delete(message)
    db.session.commit()

    return jsonify({'message': 'Message deleted successfully'}), 200


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

@views.route("/api/posts/<int:post_id>/repost", methods=["DELETE"])
@login_required
def delete_repost(post_id):
    user_id = current_user.id
    repost = Repost.query.filter_by(post_id=post_id, user_id=user_id).first()
    if not repost:
        return jsonify({"error": "Not reposted"}), 400

    db.session.delete(repost)
    db.session.commit()

    repost_count = Repost.query.filter_by(post_id=post_id).count()
    return jsonify({"repostCount": repost_count, "hasReposted": False})



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

@views.route('/api/chats/<int:chat_id>/leave', methods=['POST'])
@login_required
def leave_chat(chat_id):
    chat_user = ChatUser.query.filter_by(chat_id=chat_id, user_id=current_user.id).first()
    if not chat_user:
        return jsonify({'error': 'Not in chat'}), 404

    db.session.delete(chat_user)
    db.session.commit()
    return jsonify({'success': True})


@views.route('/api/chats/<int:chat_id>', methods=['DELETE'])
@login_required
def delete_leave_chat(chat_id):
    chat = Chat.query.get_or_404(chat_id)

    chat_user = ChatUser.query.filter_by(chat_id=chat_id, user_id=current_user.id).first()
    if not chat_user:
        return jsonify({'error': 'Not a participant'}), 403

    db.session.delete(chat_user)
    db.session.commit()

    # Перевіряємо, чи ще залишилися учасники в цьому чаті
    remaining_users = ChatUser.query.filter_by(chat_id=chat_id).count()

    # Якщо учасників немає — видаляємо чат і всі повідомлення
    if remaining_users == 0:
        # Видалимо всі повідомлення цього чату
        Message.query.filter_by(chat_id=chat_id).delete()
        db.session.delete(chat)
        db.session.commit()
        return jsonify({'success': True, 'chatDeleted': True, 'reason': 'empty'})

    return jsonify({'success': True, 'chatDeleted': False})


@views.route('/api/chats/create_group', methods=['POST'])
@login_required
def create_group_chat():
    data = request.get_json()
    user_ids = data.get('user_ids')  # список ID учасників
    group_name = data.get('name')  # назва групи, якщо потрібно

    if not user_ids or not isinstance(user_ids, list):
        return jsonify({'error': 'Missing or invalid user_ids'}), 400

    # Додати current_user, якщо ще не в списку
    if current_user.id not in user_ids:
        user_ids.append(current_user.id)

    # Перевірка кількості учасників (мінімум 3, щоб це була група)
    if len(set(user_ids)) < 2:
        return jsonify({'error': 'Group chat must have at least 3 unique users'}), 400

    # Створити груповий чат
    new_chat = Chat(is_group=True, group_name=group_name or "Group Chat")
    db.session.add(new_chat)
    db.session.flush()

    # Додати усіх учасників
    db.session.add_all([
        ChatUser(chat_id=new_chat.id, user_id=user_id)
        for user_id in set(user_ids)
    ])

    db.session.commit()

    return jsonify({'chat_id': new_chat.id, 'messages': 0})


@views.route('/api/users')
@login_required
def get_users():
    users = User.query.with_entities(User.id, User.username).all()
    return jsonify([{'id': u.id, 'username': u.username} for u in users])
