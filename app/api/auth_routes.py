from flask import Blueprint, jsonify, session, request
from flask_login import current_user, login_user, logout_user, login_required
from flask_wtf.csrf import generate_csrf
from app.models import User, db
from app.forms import LoginForm
from app.forms import SignUpForm
import logging


# Set up logging to capture error messages and other logs.
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

auth_routes = Blueprint('auth', __name__)

def validation_errors_to_error_messages(validation_errors):
    """
    Simple function that turns the WTForms validation errors into a simple list
    """
    errorMessages = []
    for field in validation_errors:
        for error in validation_errors[field]:
            errorMessages.append(f'{field} : {error}')
    return errorMessages

@auth_routes.route('/csrf/restore', methods=['GET'])
def restore_csrf():
    """
    Returns the CSRF token for frontend usage.
    """
    return jsonify({"csrf_token": generate_csrf()})

@auth_routes.route('/')
def authenticate():
    """
    Authenticates a user.
    """
    if current_user.is_authenticated:
        return current_user.to_dict()
    return {'errors': ['Unauthorized']}


@auth_routes.route('/login', methods=['POST'])
def login():
    """
    Logs a user in
    """
    form = LoginForm()
    # Get the csrf_token from the request cookie and put it into the
    # form manually to validate_on_submit can be used
    # form['csrf_token'].data = request.cookies['csrf_token']
        # Check if the XSRF-TOKEN is in the request cookies
    if 'XSRF-TOKEN' in request.cookies:
        form['csrf_token'].data = request.cookies['XSRF-TOKEN']
    else:
        # Handle the error, e.g., return a response indicating the CSRF token was missing.
        return {'errors': ['CSRF token missing.']}, 400

    if form.validate_on_submit():
        # Add the user to the session, we are logged in!
        user = User.query.filter(User.email == form.data['email']).first()
        login_user(user)
        # delete the line below and uncomment the line above when in a production environment.
        return { "user": user.to_dict(), "csrf_token": generate_csrf() }

    return {'errors': validation_errors_to_error_messages(form.errors)}, 401


@auth_routes.route('/logout')
def logout():
    """
    Logs a user out
    """
    logout_user()
    return {'message': 'User logged out'}


@auth_routes.route('/signup', methods=['POST'])
def sign_up():
    """
    Creates a new user and logs them in
    """
    print("************request.json: ",request.json)
    form = SignUpForm()

    # If the form is valid, try to create the user
    if form.validate_on_submit():
        user = User(
            first_name=form.data['first_name'],
            last_name=form.data['last_name'],
            username=form.data['username'],
            email=form.data['email'],
            password=form.data['password'],
        )
        try:
            db.session.add(user)
            db.session.commit()
            login_user(user)
            csrf_token = generate_csrf()
            return {"user": user.to_dict(), "csrf_token": csrf_token}
        except Exception as e:
            # Rollback the session in case of error
            db.session.rollback()
            print(f"Database Error: {e}")
            return {'errors': ['An error occurred while trying to create your account. Please try again later.']}, 500

    # If the form isn't valid, print and return the errors
    print("Form Errors:", form.errors)
    return {'errors': validation_errors_to_error_messages(form.errors)}, 401


@auth_routes.route('/unauthorized')
def unauthorized():
    """
    Returns unauthorized JSON when flask-login authentication fails
    """
    return {'errors': ['Unauthorized']}, 401
