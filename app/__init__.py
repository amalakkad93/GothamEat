import os
from flask import Flask, render_template, request, session, redirect, jsonify, current_app
from werkzeug.exceptions import NotFound
from flask_cors import CORS
from flask_migrate import Migrate, current
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_login import LoginManager
from flask_caching import Cache
from dotenv import load_dotenv
from .models import db, User
from .api import user_routes, auth_routes, restaurant_routes, favorite_routes, review_routes, review_img_routes, menu_item_routes, menu_item_img_routes, shopping_cart_routes, order_routes, payment_routes, maps_routes, ubereats_routes, s3_routes, delivery_routes
from .seeds import seed_commands
from .config import Config, cache

import logging
from logging.handlers import RotatingFileHandler

# load_dotenv()

app = Flask(__name__, static_folder='../react-app/build', static_url_path='/')

# Configure logger for Flask app
handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=1)
handler.setLevel(logging.INFO)
app.logger.addHandler(handler)
app.logger.setLevel(logging.INFO)

# Setup login manager
login = LoginManager(app)
login.login_view = 'auth.unauthorized'

@login.user_loader
def load_user(id):
    return User.query.get(int(id))

# Tell flask about our seed commands
app.cli.add_command(seed_commands)

app.config.from_object(Config)

flask_env = app.config.get('FLASK_ENV', 'default')
app.logger.info(f"Application started in {flask_env} environment")
app.logger.info(f"Database URL: {app.config['SQLALCHEMY_DATABASE_URI']}")

s3_client = app.config['S3_CLIENT']
s3_location = app.config['S3_LOCATION']
client_id = app.config['CLIENT_ID']
client_secret = app.config['CLIENT_SECRET']
base_url = app.config['BASE_URL']
cache.init_app(app)


app.register_blueprint(user_routes, url_prefix='/api/users')
app.register_blueprint(auth_routes, url_prefix='/api/auth')
app.register_blueprint(restaurant_routes, url_prefix="/api/restaurants")
app.register_blueprint(favorite_routes, url_prefix="/api/favorites")
app.register_blueprint(menu_item_routes, url_prefix='/api/menu-items')
app.register_blueprint(menu_item_img_routes, url_prefix='/api/menu-item-images')
app.register_blueprint(shopping_cart_routes, url_prefix='/api/shopping-carts')
app.register_blueprint(order_routes, url_prefix='/api/orders')
app.register_blueprint(review_routes, url_prefix="/api/reviews")
app.register_blueprint(review_img_routes, url_prefix="/api/review-images")
app.register_blueprint(payment_routes, url_prefix="/api/payments")
app.register_blueprint(delivery_routes, url_prefix='/api/delivery')
app.register_blueprint(maps_routes, url_prefix='/api/maps')
app.register_blueprint(s3_routes, url_prefix='/s3')

db.init_app(app)
Migrate(app, db)
csrf = CSRFProtect(app)
# Application Security
CORS(app)

# Since we are deploying with Docker and Flask,
# we won't be using a buildpack when we deploy to Heroku.
# Therefore, we need to make sure that in production any
# request made over http is redirected to https.
@app.before_request
def https_redirect():
    if os.environ.get('FLASK_ENV') == 'production':
        if request.headers.get('X-Forwarded-Proto') == 'http':
            url = request.url.replace('http://', 'https://', 1)
            code = 301
            current_app.logger.info(f"Redirecting to HTTPS: {url}")
            return redirect(url, code=code)

@app.after_request
def inject_csrf_token(response):
    response.set_cookie(
        'csrf_token',
        generate_csrf(),
        secure=True if os.environ.get('FLASK_ENV') == 'production' else False,
        samesite='Strict' if os.environ.get(
            'FLASK_ENV') == 'production' else None,
        httponly=True)
    return response

@app.route("/api/docs")
def api_help():
    """
    Returns all API routes and their doc strings
    """
    acceptable_methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    route_list = { rule.rule: [[ method for method in rule.methods if method in acceptable_methods ],
                    app.view_functions[rule.endpoint].__doc__ ]
                    for rule in app.url_map.iter_rules() if rule.endpoint != 'static' }
    return route_list

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def react_root(path):
    """
    This route will direct to the public directory in our
    react builds in the production environment for favicon
    or index.html requests
    """
    if path == 'favicon.ico':
        return app.send_from_directory('public', 'favicon.ico')
    return app.send_static_file('index.html')

@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')

# Remove CSRF-related imports and configurations

# No CSRF token generation or injection in responses

# import os
# from flask import Flask, render_template, request, session, redirect, jsonify
# from werkzeug.exceptions import NotFound
# from flask_cors import CORS
# from flask_migrate import Migrate, current
# from flask_wtf.csrf import CSRFProtect, generate_csrf
# from flask_login import LoginManager
# from flask_caching import Cache
# from .models import db, User
# from .api import user_routes, auth_routes, restaurant_routes, favorite_routes, review_routes, review_img_routes, menu_item_routes, menu_item_img_routes, shopping_cart_routes, order_routes, payment_routes, maps_routes, ubereats_routes, s3_routes, delivery_routes
# from .seeds import seed_commands
# from .config import Config, cache

# import logging
# from logging.handlers import RotatingFileHandler


# # app = Flask(__name__, static_folder='../react-app/public', static_url_path='/')
# app = Flask(__name__, static_folder='../react-app/build', static_url_path='/')

# # Configure logger for Flask app
# handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=1)
# handler.setLevel(logging.INFO)
# app.logger.addHandler(handler)
# app.logger.setLevel(logging.INFO)

# csrf = CSRFProtect()
# csrf.init_app(app)


# # Setup login manager
# login = LoginManager(app)
# login.login_view = 'auth.unauthorized'

# @login.user_loader
# def load_user(id):
#     return User.query.get(int(id))

# # Tell flask about our seed commands
# app.cli.add_command(seed_commands)

# app.config.from_object(Config)
# # print(app.config['SECRET_KEY'])
# s3_client = app.config['S3_CLIENT']
# s3_location = app.config['S3_LOCATION']
# # maps_api_key = app.config['MAPS_API_KEY']
# google_client_id = app.config['GOOGLE_CLIENT_ID']
# google_client_secret = app.config['GOOGLE_CLIENT_SECRET']
# cache.init_app(app)


# app.register_blueprint(user_routes, url_prefix='/api/users')
# app.register_blueprint(auth_routes, url_prefix='/api/auth')
# app.register_blueprint(restaurant_routes, url_prefix="/api/restaurants")
# app.register_blueprint(favorite_routes, url_prefix="/api/favorites")
# app.register_blueprint(menu_item_routes, url_prefix='/api/menu-items')
# app.register_blueprint(menu_item_img_routes, url_prefix='/api/menu-item-images')
# app.register_blueprint(shopping_cart_routes, url_prefix='/api/shopping-carts')
# app.register_blueprint(order_routes, url_prefix='/api/orders')
# app.register_blueprint(review_routes, url_prefix="/api/reviews")
# app.register_blueprint(review_img_routes, url_prefix="/api/review-images")
# app.register_blueprint(payment_routes, url_prefix="/api/payments")
# app.register_blueprint(delivery_routes, url_prefix='/api/delivery')
# app.register_blueprint(maps_routes, url_prefix='/api/maps')
# app.register_blueprint(s3_routes, url_prefix='/s3')
# # app.register_blueprint(ubereats_routes, url_prefix='/api/ubereat') # Delete this line when use in production


# db.init_app(app)
# Migrate(app, db)

# # Application Security
# CORS(app)


# # Since we are deploying with Docker and Flask,
# # we won't be using a buildpack when we deploy to Heroku.
# # Therefore, we need to make sure that in production any
# # request made over http is redirected to https.
# # Well.........
# @app.before_request
# def https_redirect():
#     if os.environ.get('FLASK_ENV') == 'production':
#         if request.headers.get('X-Forwarded-Proto') == 'http':
#             url = request.url.replace('http://', 'https://', 1)
#             code = 301
#             return redirect(url, code=code)


# # @app.after_request
# # def inject_csrf_token(response):
# #     response.set_cookie(
# #         'csrf_token',
# #         generate_csrf(),
# #         secure=True if os.environ.get('FLASK_ENV') == 'production' else False,
# #         samesite='Strict' if os.environ.get(
# #             'FLASK_ENV') == 'production' else None,
# #         httponly=True)
# #     return response
# @app.after_request
# def inject_csrf_token(response):
#     response.set_cookie(
#         'XSRF-TOKEN',
#         generate_csrf(),
#         secure=True if os.environ.get('FLASK_ENV') == 'production' else False,
#         samesite='Strict' if os.environ.get(
#             'FLASK_ENV') == 'production' else None,
#         httponly=False)  # Note: This should not be set to True for the XSRF-TOKEN
#     return response



# @app.route("/api/docs")
# def api_help():
#     """
#     Returns all API routes and their doc strings
#     """
#     acceptable_methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
#     route_list = { rule.rule: [[ method for method in rule.methods if method in acceptable_methods ],
#                     app.view_functions[rule.endpoint].__doc__ ]
#                     for rule in app.url_map.iter_rules() if rule.endpoint != 'static' }
#     return route_list


# @app.route('/', defaults={'path': ''})
# @app.route('/<path:path>')
# def react_root(path):
#     """
#     This route will direct to the public directory in our
#     react builds in the production environment for favicon
#     or index.html requests
#     """
#     if path == 'favicon.ico':
#         return app.send_from_directory('public', 'favicon.ico')
#     return app.send_static_file('index.html')


# @app.errorhandler(404)
# def not_found(e):
#     try:
#         return app.send_static_file('index.html')
#     except NotFound:
#         return "Page not found", 404


# # @app.route('/api/version')
# # def data_version():
# #     """
# #     Endpoint to provide the current data version for the frontend to check.
# #     """
# #     return {"version": Config.DATA_VERSION}
# @app.route('/api/version')
# def get_version():
#     # This will provide the current migration version (revision ID) from the Alembic version table
#     with app.app_context():
#         current_revision = current()
#     return jsonify(version=current_revision)
