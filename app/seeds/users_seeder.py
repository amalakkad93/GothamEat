from app.models import db, User, environment, SCHEMA
from sqlalchemy.sql import text

users=[
    User(first_name="John", last_name="Doe", username='Demo', password="password", email='demo@io.com'),
    User(first_name="Alfred", last_name="Pennyworth", username='Butler', password="password", email='alfred@waynemanor.com'),
    User(first_name="Harleen", last_name="Quinzel", username='HarleyQuinn', password="password", email='harley@arkham.com'),
    User(first_name="Dick", last_name="Grayson", username='Nightwing', password="password", email='nightwing@gotham.com'),
    User(first_name="Joker", last_name="Unknown", username='TheJoker', password="password", email='joker@arkham.com'),
    User(first_name="Selina", last_name="Kyle", username='Catwoman', password="password", email='catwoman@gotham.com'),
    User(first_name="Osward", last_name="Cobblepot", username='ThePenguin', password="password", email='penguin@gotham.com'),
    User(first_name="Edward", last_name="Nigma", username='TheRiddler', password="password", email='riddler@gotham.com'),
    User(first_name="Harvey", last_name="Dent", username='TwoFace', password="password", email='twoface@gotham.com'),
    User(first_name="Victor", last_name="Fries", username='MrFreeze', password="password", email='mr.freeze@gotham.com'),
    User(first_name="Anas", last_name="Alakkad", username='amala', password="password", email='amalakkad@gmail.com'),
    User(first_name="Jonathan", last_name="Crane", username='Scarecrow', password="password", email='scarecrow@gotham.com'),
    User(first_name="Rachel", last_name="Dawes", username='RachelDawes', password="password", email='rachel@gotham.com'),
    User(first_name="Lucius", last_name="Fox", username='LuciusFox', password="password", email='lucius@waynecorp.com'),
    User(first_name="Barbara", last_name="Gordon", username='Oracle', password="password", email='barbara@gotham.com'),
    User(first_name="Tim", last_name="Drake", username='Robin', password="password", email='tim@gotham.com'),
    User(first_name="Jason", last_name="Todd", username='RedHood', password="password", email='jason@gotham.com'),
    User(first_name="Damian", last_name="Wayne", username='DamianWayne', password="password", email='damian@waynemanor.com'),
    User(first_name="Cassandra", last_name="Cain", username='Batgirl', password="password", email='cassandra@gotham.com'),
]
def seed_users():
    db.session.add_all(users)
    db.session.commit()
# Adds a demo user, you can add other users here if you want
# def seed_users():
#     demo = User(
#         username='Demo', email='demo@aa.io', password='password')
#     marnie = User(
#         username='marnie', email='marnie@aa.io', password='password')
#     bobbie = User(
#         username='bobbie', email='bobbie@aa.io', password='password')

#     db.session.add(demo)
#     db.session.add(marnie)
#     db.session.add(bobbie)
#     db.session.commit()


# Uses a raw SQL query to TRUNCATE or DELETE the users table. SQLAlchemy doesn't
# have a built in function to do this. With postgres in production TRUNCATE
# removes all the data from the table, and RESET IDENTITY resets the auto
# incrementing primary key, CASCADE deletes any dependent entities.  With
# sqlite3 in development you need to instead use DELETE to remove all data and
# it will reset the primary keys for you as well.
def undo_users():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM users"))

    db.session.commit()
