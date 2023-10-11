from sqlalchemy.sql import text
from random import choice, sample
from ..models import db, Favorite, environment,User, Restaurant, SCHEMA

def create_favorites(user, restaurant_ids):
    """
    This function generates a list of favorites for a given user.
    For this example, each user will have random favorites from the list of restaurant_ids.
    """
    # Here, I'm just taking 3 unique random restaurants for each user as their favorites.
    selected_restaurants = sample(restaurant_ids, 3)
    return [Favorite(user_id=user.id, restaurant_id=restaurant_id) for restaurant_id in selected_restaurants]
    return [Favorite(user_id=user.id, restaurant_id=restaurant_id) for restaurant_id in selected_restaurants]

def seed_favorites():
    # 1. Fetch all users and all restaurants.
    users = User.query.all()
    restaurants = Restaurant.query.all()
    restaurant_ids = [restaurant.id for restaurant in restaurants]

    # 2. Initialize empty list to collect all favorites.
    all_favorites = []

    # 3. For each user, create favorite restaurants.
    for user in users:
        user_favorites = create_favorites(user, restaurant_ids)
        all_favorites.extend(user_favorites)

    # 4. Add all the favorites we collected into the database session.
    db.session.add_all(all_favorites)
    # 5. Commit the session to ensure all favorites are saved.
    db.session.commit()

def undo_favorites():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.favorites RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM favorites"))
    db.session.commit()
