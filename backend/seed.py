import random
from faker import Faker
from werkzeug.security import generate_password_hash  # <== додано
import datetime
from backend import app, db
from backend.models import User, Category, Post, Comment, Reaction, Repost, Chat, ChatUser, Message, Vote, ReportUser, \
    ReportComment, ReportPost

fake = Faker()


def seed_users():
    users = []

    user = User(
        email=f"a.dmytrokhina@ukma.edu.ua",
        password=generate_password_hash(f"Dmitrohina17"),
        username=f"english_breakfast",
        bio=f"Hi!",
        karma=0,
        is_moderator=True
    )
    users.append(user)
    db.session.add(user)
    user1 = User(
        email=f"s.sydorenko@ukma.edu.ua",
        password=generate_password_hash(f"1234567"),
        username=f"bozhepomozhi",
        bio=f"God will help us",
        karma=0,
        is_moderator=True
    )
    users.append(user1)
    db.session.add(user1)

    user2 = User(
        email=f"d.shyn@ukma.edu.ua",
        password=generate_password_hash(f"1234567"),
        username=f"dariiashyn",
        bio=f"Hi!",
        karma=0,
        is_moderator=False
    )
    users.append(user2)
    db.session.add(user2)

    user3 = User(
        email=f"alice@ukma.edu.ua",
        password=generate_password_hash(f"1234567"),
        username=f"alice",
        bio=f"Hi!",
        karma=0,
        is_moderator=False
    )
    users.append(user3)
    db.session.add(user3)

    user4 = User(
        email=f"bob@ukma.edu.ua",
        password=generate_password_hash(f"1234567"),
        username=f"bob",
        bio=f"Hi!",
        karma=0,
        is_moderator=False
    )
    users.append(user4)
    db.session.add(user4)

    db.session.commit()
    return users


def seed_categories():
    names = ['Події', 'Жарти', 'Навчання', 'Гурто', 'Новини', 'Різне']
    categories = []
    for name in names:
        cat = Category(name=name)
        categories.append(cat)
        db.session.add(cat)
    db.session.commit()
    return categories


def seed_posts(users, categories):
    posts = []
    titles = ['Hello World', 'My First Post', 'Interesting Thoughts']
    texts = ['This is a post about tech.', 'Art is beautiful.', 'Science rocks!']

    for i in range(len(titles)):
        post = Post(
            user=users[i % len(users)],
            category=categories[i % len(categories)],
            title=titles[i],
            post_text=texts[i],
            date=datetime.date(2024, 1, 1),  # <-- Виправлено тут
            picture='https://example.com/pic.jpg',
            karma=0,
            is_temporary=False
        )
        db.session.add(post)
        posts.append(post)
    db.session.commit()
    return posts



def seed_comments(users, posts):
    comments = []
    for i in range(3):
        comment = Comment(
            user=users[i % len(users)],
            post=posts[i % len(posts)],
            comment_text=f"Nice post {i}!",
            karma=0
        )
        db.session.add(comment)
        comments.append(comment)
    db.session.commit()
    return comments


def seed_votes(users, posts):
    for i in range(3):
        vote = Vote(
            user_id=users[i].id,
            post_id=posts[i].id,
            value=1
        )
        posts[i].karma += 1
        db.session.add(vote)
    db.session.commit()


def seed_reactions(users, posts):
    emojis = ['👍', '❤️', '😂', '😢', '🔥']
    for i in range(2):
        reaction = Reaction(
            user=users[i],
            post=posts[i],
            emoji=emojis[i]
        )
        db.session.add(reaction)
    db.session.commit()


def seed_reposts(users, posts):
    for i in range(2):
        repost = Repost(
            user=users[i],
            post=posts[i]
        )
        db.session.add(repost)
    db.session.commit()


def seed_chats_and_messages(users):
    chat = Chat(is_group=True)
    db.session.add(chat)
    db.session.commit()

    for user in users:
        db.session.add(ChatUser(chat_id=chat.id, user_id=user.id))

    for i in range(3):
        msg = Message(
            user=users[i % len(users)],
            chat_id=chat.id,
            message_text=f"Message {i}",
            picture=None
        )
        db.session.add(msg)
    db.session.commit()



def seed_reports(num=10):
    reasons = [
        "Спам",
        "Образливий контент",
        "Нецензурна лексика",
        "Реклама",
        "Порушення авторських прав",
        "Фейковий акаунт",
        "Порушення правил спільноти",
        "Неправдива інформація"
    ]

    report_posts = []
    report_comments = []
    report_users = []

    # Припустимо, що в базі є користувачі, пости та коментарі з id від 1 до 20
    user_ids = [u.id for u in db.session.query(User.id).all()]  # реальні id
    post_ids = list(range(1, 21))
    comment_ids = list(range(1, 21))

    for _ in range(num):
        reporter_id = random.choice(user_ids)
        reporter = db.session.get(User, reporter_id)
        if reporter is None:
            continue
        reporter_username = reporter.username

        post_id = random.choice(post_ids)
        comment_id = random.choice(comment_ids)
        reported_user_id = random.choice(user_ids)

        report_post = ReportPost(
            reporter_id=reporter_id,
            reporter_username=reporter_username,
            post_id=post_id,
            reason=random.choice(reasons),
            date=fake.date_object(),
        )
        report_posts.append(report_post)
        db.session.add(report_post)

        report_comment = ReportComment(
            reporter_id=reporter.id,
            comment_id=comment_id,
            reason=random.choice(reasons),
            date=fake.date_object(),
        )
        report_comments.append(report_comment)
        db.session.add(report_comment)

        rep_user_id = reported_user_id
        while rep_user_id == reporter_id:
            rep_user_id = random.choice(user_ids)
        report_user = ReportUser(
            reporter_id=reporter.id,
            reporter_username=reporter_username,
            reported_user_id=rep_user_id,
            reason=random.choice(reasons),
            date=fake.date_object(),
        )
        report_users.append(report_user)
        db.session.add(report_user)

    db.session.commit()
    return report_posts, report_comments, report_users


if __name__ == '__main__':
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()

        users = seed_users()
        categories = seed_categories()
        posts = seed_posts(users, categories)
        seed_votes(users, posts)
        seed_comments(users, posts)
        seed_reactions(users, posts)
        seed_reposts(users, posts)
        seed_chats_and_messages(users)
        seed_reports(10)

        print("Seeding completed!")
