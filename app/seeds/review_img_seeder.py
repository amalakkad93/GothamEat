from sqlalchemy import text
from random import choice
from ..models import db, Review, ReviewImg, environment, SCHEMA

review_images_list = [
    {"review_id": 1, "image_path": "https://s3-media0.fl.yelpcdn.com/bphoto/mXtrbUi5HWD3RzDaMVHm3A/180s.jpg"},
    {"review_id": 2, "image_path": "https://s3-media0.fl.yelpcdn.com/bphoto/Mcs5c9t6tJ0hllUtZjqZ9g/180s.jpg"},
    {"review_id": 3, "image_path": "https://s3-media0.fl.yelpcdn.com/bphoto/tDPOaAKqIV-Lkh2dJlFMZQ/180s.jpg"},
    {"review_id": 4, "image_path": "https://s3-media0.fl.yelpcdn.com/bphoto/q5Fo8imGboRa5dyGHVzItw/180s.jpg"},
    {"review_id": 5, "image_path": "https://s3-media0.fl.yelpcdn.com/bphoto/mXtrbUi5HWD3RzDaMVHm3A/180s.jpg"},
    {"review_id": 6, "image_path": "https://s3-media0.fl.yelpcdn.com/bphoto/Mcs5c9t6tJ0hllUtZjqZ9g/180s.jpg"},
    {"review_id": 7, "image_path": "https://s3-media0.fl.yelpcdn.com/bphoto/tDPOaAKqIV-Lkh2dJlFMZQ/180s.jpg"},
    {"review_id": 8, "image_path": "https://s3-media0.fl.yelpcdn.com/bphoto/q5Fo8imGboRa5dyGHVzItw/180s.jpg"}
]
def seed_review_images():
  for image in review_images_list:
    review_image = ReviewImg( review_id=image["review_id"], image_path=image["image_path"])
    db.session.add(review_image)

  db.session.commit()

def undo_review_images():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.review_imgs RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM review_imgs"))
    db.session.commit()
