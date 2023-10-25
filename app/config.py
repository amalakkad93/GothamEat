import os
from flask_caching import Cache

class Config:
    # WTF_CSRF_ENABLED = True
    SECRET_KEY = os.environ.get('SECRET_KEY')

    MAPS_API_KEY = os.environ.get('MAPS_API_KEY')

    UBER_CLIENT_ID = os.environ.get('UBER_CLIENT_ID')
    UBER_CLIENT_SECRET = os.environ.get('UBER_CLIENT_SECRET')
    UBER_REDIRECT_URI = os.environ.get('UBER_REDIRECT_URI')

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # SQLAlchemy 1.4 no longer supports url strings that start with 'postgres'
    # (only 'postgresql') but heroku's postgres add-on automatically sets the
    # url in the hidden config vars to start with postgres.
    # so the connection uri must be updated here (for production)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL').replace('postgres://', 'postgresql://')
    SQLALCHEMY_ECHO = True

    # Cache Configuration
    CACHE_TYPE = 'simple'

# Initialize the cache
cache = Cache(config={'CACHE_TYPE': 'simple'})
