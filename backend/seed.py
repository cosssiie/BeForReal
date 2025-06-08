import random
from faker import Faker
from werkzeug.security import generate_password_hash  # <== додано

from backend import app, db
from backend.models import User, Category, Post, Comment, Reaction, Repost, Chat, ChatUser, Message, Vote

fake = Faker()

def seed_users(n=10):
    users = []
    for _ in range(n):
        username = fake.unique.user_name()
        email = f"{username}@ukma.edu.ua"
        password = generate_password_hash(f"{username}1234")  # Формула + хешування

        user = User(
            email=email,
            password=password,
            username=username,
            bio=fake.text(max_nb_chars=100),
            karma=random.randint(0, 1000),
            is_moderator=random.choice([True, False])
        )
        users.append(user)
        db.session.add(user)
    db.session.commit()
    return users

def seed_categories():
    names = ['Tech', 'Science', 'Art', 'Gaming', 'Music', 'Sports']
    categories = []
    for name in names:
        cat = Category(name=name)
        categories.append(cat)
        db.session.add(cat)
    db.session.commit()
    return categories

def seed_posts(users, categories, n=20):
    posts = []
    for _ in range(n):
        post = Post(
            user=random.choice(users),
            category=random.choice(categories),
            title=fake.sentence(nb_words=6),
            date=fake.date_object(),
            post_text=fake.text(),
            picture=fake.image_url(),
            karma=random.randint(0, 500),
            is_temporary=False
        )
        posts.append(post)
        db.session.add(post)
    db.session.commit()
    return posts

def seed_comments(users, posts, n=50):
    comments = []
    for _ in range(n):
        comment = Comment(
            user=random.choice(users),
            post=random.choice(posts),
            comment_text=fake.sentence(nb_words=6),
            karma=random.randint(0, 100)
        )
        comments.append(comment)
        db.session.add(comment)
    db.session.commit()
    return comments

def seed_reactions(users, posts, n=50):
    emojis = ['👍', '❤️', '😂', '😢', '🔥']
    for _ in range(n):
        reaction = Reaction(
            user=random.choice(users),
            post=random.choice(posts),
            emoji=random.choice(emojis)
        )
        db.session.add(reaction)
    db.session.commit()

def seed_reposts(users, posts, n=20):
    for _ in range(n):
        repost = Repost(
            user=random.choice(users),
            post=random.choice(posts)
        )
        db.session.add(repost)
    db.session.commit()

def seed_chats_and_messages(users, n=5):
    chats = []
    for _ in range(n):
        is_group = random.choice([True, False])
        chat = Chat(is_group=is_group)

        if is_group:
            participants = random.sample(users, random.randint(3, 5))
        else:
            participants = random.sample(users, 2)

        db.session.add(chat)
        db.session.commit()  # get chat.id

        for user in participants:
            chat_user = ChatUser(chat_id=chat.id, user_id=user.id)
            db.session.add(chat_user)

        for _ in range(random.randint(3, 10)):
            msg = Message(
                user=random.choice(participants),
                chat_id=chat.id,
                message_text=fake.sentence(nb_words=6),
                picture=fake.image_url() if random.choice([True, False]) else None
            )
            db.session.add(msg)

        db.session.commit()
        chats.append(chat)
    return chats

def seed_votes(users, posts, n=50):
    used = set()
    count = 0

    while count < n:
        user = random.choice(users)
        post = random.choice(posts)
        key = (user.id, post.id)
        if key in used:
            continue  # вже голосував

        vote = Vote(
            user_id=user.id,
            post_id=post.id,
            value=random.choice([-1, 1])
        )
        post.karma += vote.value  # оновити карму поста відповідно до голосу
        db.session.add(vote)
        used.add(key)
        count += 1

    db.session.commit()


if __name__ == '__main__':
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()

        users = seed_users(10)
        categories = seed_categories()
        posts = seed_posts(users, categories, 20)
        seed_votes(users, posts, 50)
        seed_comments(users, posts, 50)
        seed_reactions(users, posts, 50)
        seed_reposts(users, posts, 20)
        seed_chats_and_messages(users, 5)

        print("Seeding completed!")
