from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from datetime import date, timedelta
from datetime import datetime
import pytz
from sqlalchemy import func

db = SQLAlchemy()


def utc_now():
    return datetime.now(pytz.utc)


# тимчасове рішення
def utc_plus_3():
    return datetime.now(pytz.utc) + timedelta(hours=3)


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    username = db.Column(db.String(150), unique=True, nullable=False)
    profile_picture = db.Column(db.String(1000), default="default_profile_photo.jpg")
    bio = db.Column(db.String(1500))
    date_joined = db.Column(db.DateTime(timezone=True), default=utc_plus_3)
    karma = db.Column(db.Integer, default=0)
    is_moderator = db.Column(db.Boolean, default=False)
    is_blocked = db.Column(db.Boolean, default=False)
    is_reported = db.Column(db.Boolean, default=False)

    posts = db.relationship('Post', backref='user', lazy=True, cascade="all, delete-orphan")
    comments = db.relationship('Comment', backref='user', lazy=True, cascade="all, delete-orphan")
    reactions = db.relationship('Reaction', backref='user', lazy=True, cascade="all, delete-orphan")
    reposts = db.relationship('Repost', backref='user', lazy=True, cascade="all, delete-orphan")
    messages = db.relationship('Message', backref='user', lazy=True, cascade="all, delete-orphan")
    report_posts = db.relationship('ReportPost', back_populates='reporter', lazy=True, cascade="all, delete-orphan")
    report_comments = db.relationship('ReportComment', back_populates='reporter', lazy=True, cascade="all, delete-orphan")
    chat_users = db.relationship(
        'ChatUser',
        back_populates='user',
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    report_users = db.relationship(
        'ReportUser',
        foreign_keys='ReportUser.reporter_id',
        back_populates='reporter',
        lazy=True,
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    reported_users = db.relationship(
        'ReportUser',
        foreign_keys='ReportUser.reported_user_id',
        back_populates='reported_user',
        lazy=True,
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    @property
    def calculated_karma(self):
        post_karma = sum(post.karma for post in self.posts if post.karma)
        comment_karma = sum(
            sum(vote.value for vote in comment.votes)
            for comment in self.comments
        )
        return post_karma + comment_karma

    @property
    def status(self):
        if self.calculated_karma < -100:
            return 'demon'
        elif self.calculated_karma < 100:
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
    date = db.Column(db.DateTime(timezone=True), default=utc_plus_3)
    karma = db.Column(db.Integer, default=0)
    is_temporary = db.Column(db.Boolean, default=False)

    comments = db.relationship('Comment', backref='post', lazy=True, cascade="all, delete-orphan")
    reactions = db.relationship('Reaction', backref='post', lazy=True, cascade="all, delete-orphan")
    reposts = db.relationship('Repost', backref='post', lazy=True, cascade="all, delete-orphan")
    report_posts = db.relationship('ReportPost', backref='post', lazy=True, cascade="all, delete-orphan")


class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    value = db.Column(db.Integer, nullable=False)  # 1 або -1

    __table_args__ = (db.UniqueConstraint('user_id', 'post_id', name='unique_vote'),)


class CommentVote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    comment_id = db.Column(db.Integer, db.ForeignKey('comment.id'), nullable=False)
    value = db.Column(db.Integer, nullable=False)  # 1 або -1

    __table_args__ = (db.UniqueConstraint('user_id', 'comment_id', name='unique_comment_vote'),)



class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('comment.id'))
    comment_text = db.Column(db.String(1500))
    date = db.Column(db.DateTime(timezone=True), default=utc_plus_3)
    votes = db.relationship('CommentVote', backref='comment', lazy=True, cascade='all, delete-orphan')

    replies = db.relationship('Comment', backref=db.backref('parent', remote_side=[id]), lazy=True, cascade='all, delete-orphan')
    report_comments = db.relationship('ReportComment', back_populates='comment', cascade='all, delete-orphan', lazy=True)
    
    @property
    def parent_username(self):
        if self.parent:
            return self.parent.user.username
        return None

    @property
    def karma(self):
        return sum(vote.value for vote in self.votes)


class Reaction(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    emoji = db.Column(db.String, nullable=False)


class Repost(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    date = db.Column(db.DateTime(timezone=True), default=utc_plus_3)


class Chat(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    is_group = db.Column(db.Boolean, default=False)
    group_name = db.Column(db.String(100))
    created_at = db.Column(db.DateTime(timezone=True), default=utc_plus_3)

    chat_users = db.relationship('ChatUser', backref='chat', cascade='all, delete-orphan', lazy=True)
    messages = db.relationship('Message', backref='chat', cascade='all, delete-orphan', lazy=True)


class ChatUser(db.Model):
    chat_id = db.Column(db.Integer, db.ForeignKey('chat.id'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), primary_key=True)
    is_blocked = db.Column(db.Boolean, default=False)

    user = db.relationship('User', back_populates='chat_users')


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    chat_id = db.Column(db.Integer, db.ForeignKey('chat.id'), nullable=False)
    message_text = db.Column(db.String(1500))
    picture = db.Column(db.String(1000))
    date = db.Column(db.DateTime(timezone=True), default=utc_plus_3)
    parent_id = db.Column(db.Integer, db.ForeignKey('message.id'))
    is_read = db.Column(db.Boolean, default=False)

    replies = db.relationship('Message', backref=db.backref('parent', remote_side=[id]), lazy=True, cascade='all, delete-orphan')


class ReportPost(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    reporter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    reporter_username = db.Column(db.String(150), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    reason = db.Column(db.String(1500))
    date = db.Column(db.DateTime(timezone=True), default=utc_plus_3)

    reporter = db.relationship('User', back_populates='report_posts')


class ReportComment(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    reporter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    comment_id = db.Column(db.Integer, db.ForeignKey('comment.id', ondelete='CASCADE'), nullable=False)
    reason = db.Column(db.String(1500))
    date = db.Column(db.DateTime(timezone=True), default=utc_plus_3)
    reporter_username = db.Column(db.String(150))

    reporter = db.relationship('User', back_populates='report_comments')
    comment = db.relationship('Comment', back_populates='report_comments')


class ReportUser(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    reporter_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete="CASCADE"), nullable=False)
    reporter_username = db.Column(db.String(150), nullable=False)
    reported_user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete="CASCADE"), nullable=False)
    reason = db.Column(db.String(1500))
    date = db.Column(db.DateTime(timezone=True), default=utc_plus_3)

    reporter = db.relationship('User', foreign_keys=[reporter_id], back_populates='report_users')
    reported_user = db.relationship('User', foreign_keys=[reported_user_id], back_populates='reported_users')
