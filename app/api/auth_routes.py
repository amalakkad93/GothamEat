from flask import Blueprint, jsonify, session, request, current_app, abort, redirect
from flask_login import current_user, login_user, logout_user, login_required
from flask_wtf.csrf import generate_csrf
from app.models import User, db
from app.forms import LoginForm
from app.forms import SignUpForm
import requests
import os
import pathlib


from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from pip._vendor import cachecontrol
import google.auth.transport.requests
from tempfile import NamedTemporaryFile
import json
import logging

# *********************************************************************************************
# CLIENT_SECRET = os.getenv('GOOGLE_OAUTH_CLIENT_SECRET')
# CLIENT_ID = os.getenv('GOOGLE_OAUTH_CLIENT_ID')
# BASE_URL = os.getenv('BASE_URL')

# client_secrets = {
#   "web": {
#     "client_id": CLIENT_ID,
#     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
#     "token_uri": "https://oauth2.googleapis.com/token",
#     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
#     "client_secret": CLIENT_SECRET,
#     "redirect_uris": [
#       "https://gotham-eat.onrender.com/api/auth/google",
#     ]
#   }
# }

# # Here we are generating a temporary file as the google oauth package requires a file for configuration!
# secrets = NamedTemporaryFile()
# # Note that the property '.name' is the file PATH to our temporary file!
# # The command below will write our dictionary to the temp file AS json!
# with open(secrets.name, "w") as output:
#     json.dump(client_secrets, output)

# os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1" # to allow Http traffic for local dev

# flow = Flow.from_client_secrets_file(
#     client_secrets_file=secrets.name,
#     scopes=["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email", "openid"],
#     redirect_uri="https://gotham-eat.onrender.com/api/auth/google"
# )

# secrets.close() # This method call deletes our temporary file from the /tmp folder! We no longer need it as our flow object has been configured!

# *********************************************************************************************
# Set up logging to capture error messages and other logs.
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

auth_routes = Blueprint("auth", __name__)


def validation_errors_to_error_messages(validation_errors):
    """
    Simple function that turns the WTForms validation errors into a simple list
    """
    errorMessages = []
    for field in validation_errors:
        for error in validation_errors[field]:
            errorMessages.append(f"{field} : {error}")
    return errorMessages

def create_google_oauth_flow():
    # Access the client ID and secret from the current app's configuration
    client_id = current_app.config['CLIENT_ID']
    client_secret = current_app.config['CLIENT_SECRET']
    redirect_uri = "https://gotham-eat.onrender.com/api/auth/google"

    # Client secrets configuration
    client_secrets = {
        "web": {
            "client_id": client_id,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": client_secret,
            "redirect_uris": [redirect_uri],
        }
    }

    # Temporary file for google oauth configuration
    with NamedTemporaryFile('w+', delete=False) as temp:
        json.dump(client_secrets, temp)
        temp_file_name = temp.name

    # Create a Flow instance
    return Flow.from_client_secrets_file(
        client_secrets_file=temp_file_name,
        scopes=["https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
                "openid"],
        redirect_uri=redirect_uri
    )

@auth_routes.route("/oauth_login")
def oauth_login():
    flow = create_google_oauth_flow()
    authorization_url, state = flow.authorization_url()
    session["state"] = state
    return redirect(authorization_url)

@auth_routes.route("/google")
def callback():
    flow = create_google_oauth_flow()
    flow.fetch_token(authorization_response=request.url)

    if not session["state"] == request.args["state"]:
        abort(500)  # State does not match!

    credentials = flow.credentials
    request_session = requests.session()
    cached_session = cachecontrol.CacheControl(request_session)
    token_request = google.auth.transport.requests.Request(session=cached_session)

    id_info = id_token.verify_oauth2_token(
        id_token=credentials._id_token,
        request=token_request,
        audience=current_app.config['CLIENT_ID']  # Use the client_id from the config
    )

    # User session creation logic...
    session["google_id"] = id_info.get("sub")
    session["name"] = id_info.get("name")
    temp_email = id_info.get('email')
    split_name = session['name'].split(' ')

    user_exists = User.query.filter(User.email == temp_email).first()
    if not user_exists:
        user_exists = User(
            first_name=split_name[0],
            last_name=split_name[1],
            username=session['name'],
            email=temp_email,
            password='OAUTH',
        )
        db.session.add(user_exists)
        db.session.commit()

    login_user(user_exists)
    return redirect(current_app.config['BASE_URL']) # Redirect to the BASE_URL from the config




# *********************************************************************************************
# @auth_routes.route("/oauth_login")
# def oauth_login():
#     authorization_url, state = flow.authorization_url()
#     print("AUTH URL: ", authorization_url) # I recommend that you print this value out to see what it's generating.
#     # Ex: https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=NICE TRY&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fcallback&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+openid&state=A0eZyFD4WH6AfqSj7XcdypQ0cMhwr9&access_type=offline
#     # It SHOULD look a lot like the URL in the SECOND or THIRD line of our flow chart!
#     # Note that in the auth url above the value 'access_type' is set to 'offline'. If you do not send this, the user will NOT see the Google Login screen!!
#     # Additionally, note that this URL does NOT contain the 'code_challenge_method' value NOR the 'code_challenge' that can be seen in our flow chart.
#     # This package may have been created BEFORE the official Oauth2 consortium began recommending PKCE even for back channel flows...
#     # While implementation details are completely obscured by the method .authorization_url() let's note 2 things here.
#     # 1) We ARE generating a random value for the 'state' variable. We save it to the session on the line below to compare later.
#     # 2) The authorization URL
#     session["state"] = state
#     return redirect(authorization_url) # This line technically will enact the SECOND and THIRD lines of our flow chart.

# @auth_routes.route("/google")
# def callback():
#     flow.fetch_token(authorization_response=request.url) # This method is sending the request depicted on line 6 of our flow chart! The response is depicted on line 7 of our flow chart.
#     # I find it odd that the author of this code is verifying the 'state' AFTER requesting a token, but to each their own!!

#     # This is our CSRF protection for the Oauth Flow!
#     if not session["state"] == request.args["state"]:
#         abort(500)  # State does not match!

#     credentials = flow.credentials
#     request_session = requests.session()
#     cached_session = cachecontrol.CacheControl(request_session)
#     token_request = google.auth.transport.requests.Request(session=cached_session)

#     # The method call below will go through the tedious work of verifying the JWT signature sent back with the object from OpenID Connect
#     # Although I cannot verify, hopefully it is also testing the values for "sub", "aud", "iat", and "exp" sent back in the CLAIMS section of the JWT
#     # Additionally note, that the oauth initializing URL generated in the previous endpoint DID NOT send a random nonce value. (As depicted in our flow chart)
#     # If it had, the server would return the nonce in the JWT claims to be used for further verification tests!
#     id_info = id_token.verify_oauth2_token(
#         id_token=credentials._id_token,
#         request=token_request,
#         audience=CLIENT_ID
#     )

#     # Now we generate a new session for the newly authenticated user!!
#     # Note that depending on the way your app behaves, you may be creating a new user at this point...
#     session["google_id"] = id_info.get("sub")
#     session["name"] = id_info.get("name")
#     temp_email = id_info.get('email')
#     split_name = session['name'].split(' ')

#     user_exists = User.query.filter(User.email == temp_email).first()

#     if not user_exists:
#         user_exists = User(
#             first_name=split_name[0],
#             last_name=split_name[1],
#             username=session['name'],
#             email=temp_email,
#             password='OAUTH',
#         )

#         db.session.add(user_exists)
#         db.session.commit()

#     login_user(user_exists)

#     # Note that adding this BASE_URL variable to our .env file, makes the transition to production MUCH simpler, as we can just store this variable on Render and change it to our deployed URL.
#     return redirect(f"{BASE_URL}/") # This will send the final redirect to our user's browser. As depicted in Line 8 of the flow chart!
# *********************************************************************************************


# @auth_routes.route('/csrf/restore', methods=['GET'])
# def restore_csrf():
#     """
#     Returns the CSRF token for frontend usage.
#     """
#     return jsonify({"csrf_token": generate_csrf()})


@auth_routes.route("/")
def authenticate():
    """
    Authenticates a user.
    """
    if current_user.is_authenticated:
        return current_user.to_dict()
    return {"errors": ["Unauthorized"]}


@auth_routes.route("/login", methods=["POST"])
def login():
    """
    Logs a user in
    """
    form = LoginForm()

    # Check if the form data is valid
    if not form.validate():
        return {"errors": validation_errors_to_error_messages(form.errors)}, 400

    # Retrieve user by email
    user = User.query.filter(User.email == form.data["email"]).first()

    # Check if the user exists
    if user is None:
        return {"errors": ["No account found with the provided email."]}, 401

    # Check if the password is correct
    if not user.check_password(form.data["password"]):
        return {"errors": ["Invalid password."]}, 401

    # Log the user in
    login_user(user)

    # Return the user data
    return user.to_dict()


@auth_routes.route("/logout")
def logout():
    """
    Logs a user out
    """
    logout_user()
    return {"message": "User logged out"}


@auth_routes.route("/signup", methods=["POST"])
def sign_up():
    """
    Creates a new user and logs them in
    """
    try:
        data = request.get_json()
        form = SignUpForm(data=data)

        if form.validate_on_submit():
            user = User(
                first_name=form.data["first_name"],
                last_name=form.data["last_name"],
                username=form.data["username"],
                email=form.data["email"],
                password=form.data["password"],
            )
            db.session.add(user)
            db.session.commit()
            login_user(user)

            if current_user.is_authenticated:
                logger.info("User successfully logged in.")
                return jsonify(user.to_dict())
            else:
                logger.error("User login failed.")
                return {"errors": ["Login failed after sign up."]}, 401
        else:
            return (
                jsonify({"errors": validation_errors_to_error_messages(form.errors)}),
                401,
            )
    except Exception as e:
        logger.error(f"Error during sign up: {e}")
        return jsonify({"errors": ["An error occurred. Please try again."]}), 500


@auth_routes.route("/unauthorized")
def unauthorized():
    """
    Returns unauthorized JSON when flask-login authentication fails
    """
    return {"errors": ["Unauthorized"]}, 401
