from app.models import db, User, environment, SCHEMA
from sqlalchemy.sql import text

users=[
    User(first_name="John", last_name="Doe", username='Demo', password="password", email='demo@io.com', street_address="1007 Mountain Drive", city="Gotham", state="New Jersey", postal_code="10007", country="United States", phone='710-681-2835'),
    User(first_name="Alfred", last_name="Pennyworth", username='Butler', password="password", email='alfred@waynemanor.com', street_address="1007 Mountain Drive", city="Gotham", state="New Jersey", postal_code="10007", country="United States", phone='710-681-2835'),
    User(first_name="Harleen", last_name="Quinzel", username='HarleyQuinn', password="password", email='harley@arkham.com', street_address="100 Arkham Asylum", city="Gotham", state="New Jersey", postal_code="10101", country="United States", phone='710-681-2836'),
    User(first_name="Dick", last_name="Grayson", username='Nightwing', password="password", email='nightwing@gotham.com', street_address="200 Oracle Tower", city="Gotham", state="New Jersey", postal_code="10202", country="United States", phone='710-681-2837'),
    User(first_name="Joker", last_name="Unknown", username='TheJoker', password="password", email='joker@arkham.com', street_address="123 Laugh Lane", city="Gotham", state="New Jersey", postal_code="10102", country="United States", phone='710-681-2838'),
    User(first_name="Selina", last_name="Kyle", username='Catwoman', password="password", email='catwoman@gotham.com', street_address="456 Feline Alley", city="Gotham", state="New Jersey", postal_code="10303", country="United States", phone='710-681-2839'),
    User(first_name="Osward", last_name="Cobblepot", username='ThePenguin', password="password", email='penguin@gotham.com', street_address="789 Iceberg Avenue", city="Gotham", state="New Jersey", postal_code="10404", country="United States", phone='710-681-2840'),
    User(first_name="Edward", last_name="Nigma", username='TheRiddler', password="password", email='riddler@gotham.com', street_address="1010 Enigma Lane", city="Gotham", state="New Jersey", postal_code="10505", country="United States", phone='710-681-2841'),
    User(first_name="Harvey", last_name="Dent", username='TwoFace', password="password", email='twoface@gotham.com', street_address="1313 Coin Street", city="Gotham", state="New Jersey", postal_code="10606", country="United States", phone='710-681-2842'),
    User(first_name="Victor", last_name="Fries", username='MrFreeze', password="password", email='mr.freeze@gotham.com', street_address="1414 Ice Lane", city="Gotham", state="New Jersey", postal_code="10707", country="United States", phone='710-681-2843'),
    User(first_name="Jonathan", last_name="Crane", username='Scarecrow', password="password", email='scarecrow@gotham.com', street_address="1515 Fear Street", city="Gotham", state="New Jersey", postal_code="10808", country="United States", phone='710-681-2844'),
    User(first_name="Rachel", last_name="Dawes", username='RachelDawes', password="password", email='rachel@gotham.com', street_address="1616 Attorney Avenue", city="Gotham", state="New Jersey", postal_code="10909", country="United States", phone='710-681-2845'),
    User(first_name="Lucius", last_name="Fox", username='LuciusFox', password="password", email='lucius@waynecorp.com', street_address="1717 Innovation Street", city="Gotham", state="New Jersey", postal_code="11010", country="United States", phone='710-681-2846'),
    User(first_name="Barbara", last_name="Gordon", username='Oracle', password="password", email='barbara@gotham.com', street_address="1818 Clock Tower", city="Gotham", state="New Jersey", postal_code="11111", country="United States", phone='710-681-2847'),
    User(first_name="Tim", last_name="Drake", username='Robin', password="password", email='tim@gotham.com', street_address="1919 Drake Street", city="Gotham", state="New Jersey", postal_code="11212", country="United States", phone='710-681-2848'),
    User(first_name="Jason", last_name="Todd", username='RedHood', password="password", email='jason@gotham.com', street_address="2020 Hood Lane", city="Gotham", state="New Jersey", postal_code="11313", country="United States", phone='710-681-2849'),
    User(first_name="Damian", last_name="Wayne", username='DamianWayne', password="password", email='damian@waynemanor.com', street_address="2121 Sword Lane", city="Gotham", state="New Jersey", postal_code="11414", country="United States", phone='710-681-2850'),
    User(first_name="Cassandra", last_name="Cain", username='Batgirl', password="password", email='cassandra@gotham.com', street_address="2222 Bat Street", city="Gotham", state="New Jersey", postal_code="11515", country="United States", phone='710-681-2851'),
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
