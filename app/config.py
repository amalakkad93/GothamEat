import os
import logging
import boto3
from flask_caching import Cache
from flask import current_app

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s:%(levelname)s:%(message)s')

class Config:
    WTF_CSRF_ENABLED = False
    SECRET_KEY = os.environ.get('SECRET_KEY')


    S3_BUCKET = os.environ.get('S3_BUCKET')
    S3_KEY = os.environ.get('S3_KEY')
    S3_SECRET = os.environ.get('S3_SECRET')
    S3_LOCATION = f"https://{S3_BUCKET}.s3.amazonaws.com/"
    S3_CLIENT = boto3.client("s3", aws_access_key_id=S3_KEY, aws_secret_access_key=S3_SECRET)

    MAPS_API_KEY = os.environ.get('MAPS_API_KEY')


    CLIENT_SECRET = os.environ.get('GOOGLE_OAUTH_CLIENT_SECRET')
    CLIENT_ID = os.environ.get('GOOGLE_OAUTH_CLIENT_ID')
    BASE_URL = os.environ.get('BASE_URL')
    # GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    # GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    # UBER_CLIENT_ID = os.environ.get('UBER_CLIENT_ID')
    # UBER_CLIENT_SECRET = os.environ.get('UBER_CLIENT_SECRET')
    # UBER_REDIRECT_URI = os.environ.get('UBER_REDIRECT_URI')

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
    
    # DATA_VERSION = 12
# Initialize the cache
cache = Cache(config={'CACHE_TYPE': 'simple'})
