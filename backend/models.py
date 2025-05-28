from flask_sqlalchemy import SQLAlchemy
from datetime import date

from sqlalchemy import func

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    username = db.Column(db.String(150), unique=True, nullable=False)
    profile_picture = db.Column(db.String(1000), default="default_profile_photo.jpg")
    bio = db.Column(db.String(1500))
    date_joined = db.Column(db.DateTime(timezone=True), default=func.now())
    karma = db.Column(db.Integer, default=0)
    is_moderator = db.Column(db.Boolean, default=False)
    is_blocked = db.Column(db.Boolean, default=False)
    is_reported = db.Column(db.Boolean, default=False)


    posts = db.relationship('Post', backref='user', lazy=True)
    comments = db.relationship('Comment', backref='user', lazy=True)
    reactions = db.relationship('Reaction', backref='user', lazy=True)
    reposts = db.relationship('Repost', backref='user', lazy=True)
    messages = db.relationship('Message', backref='user', lazy=True)
    report_posts = db.relationship('ReportPost', backref='reporter', lazy=True)
    report_comments = db.relationship('ReportComment', backref='reporter', lazy=True)
    report_users = db.relationship('ReportUser', foreign_keys='ReportUser.reporter_id', backref='reporter_user', lazy=True)
    reported_users = db.relationship('ReportUser', foreign_keys='ReportUser.reported_user_id', backref='reported_user', lazy=True)

    @property
    def status(self):
        if self.karma < 0:
            return 'demon'
        elif self.karma < 1000:
            return 'noob'
        else:
            return 'pro'


class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False)

    posts = db.relationship('Post', backref='category', lazy=True)

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    title = db.Column(db.String(100))
    post_text = db.Column(db.String(1500))
    picture = db.Column(db.String)
    date = db.Column(db.DateTime(timezone=True), default=func.now())
    karma = db.Column(db.Integer, default=0)
    is_temporary = db.Column(db.Boolean, default=False)

    comments = db.relationship('Comment', backref='post', lazy=True)
    reactions = db.relationship('Reaction', backref='post', lazy=True)
    reposts = db.relationship('Repost', backref='post', lazy=True)
    report_posts = db.relationship('ReportPost', backref='post', lazy=True)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('comment.id'))
    comment_text = db.Column(db.String(1500))
    date = db.Column(db.DateTime(timezone=True), default=func.now())
    karma = db.Column(db.Integer, default=0)

    replies = db.relationship('Comment', backref=db.backref('parent', remote_side=[id]), lazy=True)
    report_comments = db.relationship('ReportComment', backref='comment', lazy=True)

class Reaction(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    emoji = db.Column(db.String, nullable=False)

class Repost(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    date = db.Column(db.DateTime(timezone=True), default=func.now())

class Chat(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    is_group = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime(timezone=True), default=func.now())

    chat_users = db.relationship('ChatUser', backref='chat', lazy=True)
    messages = db.relationship('Message', backref='chat', lazy=True)

class ChatUser(db.Model):
    chat_id = db.Column(db.Integer, db.ForeignKey('chat.id'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    is_blocked = db.Column(db.Boolean, default=False)

    user = db.relationship('User', backref='chat_users')

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    chat_id = db.Column(db.Integer, db.ForeignKey('chat.id'), nullable=False)
    message_text = db.Column(db.String(1500))
    picture = db.Column(db.String(1000))
    date = db.Column(db.DateTime(timezone=True), default=func.now())
    parent_id = db.Column(db.Integer, db.ForeignKey('message.id'))
    is_read = db.Column(db.Boolean, default=False)

    replies = db.relationship('Message', backref=db.backref('parent', remote_side=[id]), lazy=True)

class ReportPost(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    reporter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    reason = db.Column(db.String(1500))
    date = db.Column(db.DateTime(timezone=True), default=func.now())

class ReportComment(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    reporter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    comment_id = db.Column(db.Integer, db.ForeignKey('comment.id'), nullable=False)
    reason = db.Column(db.String(1500))
    date = db.Column(db.DateTime(timezone=True), default=func.now())

class ReportUser(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    reporter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    reported_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    reason = db.Column(db.String(1500))
    date = db.Column(db.DateTime(timezone=True), default=func.now())
