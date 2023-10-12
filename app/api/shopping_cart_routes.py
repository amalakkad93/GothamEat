from flask import Blueprint, jsonify, request,redirect, url_for, abort
import app
from flask_login import current_user, login_user, logout_user, login_required
from app.models import User, Review, Review, db, MenuItem,MenuItemImg
from sqlalchemy import func, distinct, or_, desc

import json

shopping_cart_routes = Blueprint('shopping_cart', __name__)
