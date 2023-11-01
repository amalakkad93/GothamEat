import traceback
import logging
import json
from flask import jsonify, request, current_app, session
from sqlite3 import OperationalError
from logging.handlers import RotatingFileHandler
from flask_login import current_user

# Custom JSON logger
class JsonLogger(logging.Logger):
    def makeRecord(self, name, level, fn, lno, msg, args, exc_info,
                   func=None, extra=None, sinfo=None):  # Added sinfo argument
        if extra and 'data' in extra:
            extra_data = extra['data']
        else:
            extra_data = {}
        if isinstance(msg, dict):
            extra_data.update(msg)
        else:
            extra_data['message'] = msg
        log_data = json.dumps(extra_data)
        return super().makeRecord(name, level, fn, lno, log_data, args, exc_info, func=func, extra=extra, sinfo=sinfo)


logging.setLoggerClass(JsonLogger)

# Configure logging
log_formatter = logging.Formatter('%(asctime)s - %(message)s')

# General log configuration
general_log_handler = RotatingFileHandler('general.log', maxBytes=50000, backupCount=2)
general_log_handler.setLevel(logging.INFO)
general_log_handler.setFormatter(log_formatter)

# Error log configuration
error_log_handler = RotatingFileHandler('errors.log', maxBytes=50000, backupCount=2)
error_log_handler.setLevel(logging.ERROR)
error_log_handler.setFormatter(log_formatter)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
logger.addHandler(general_log_handler)
logger.addHandler(error_log_handler)

def log_error(e):
    """Logs detailed information about the error."""
    user_info = f"User: {current_user.id}" if current_user.is_authenticated else "User: Anonymous"

    error_data = {
        "user": user_info,
        "url": request.url,
        "http_method": request.method,
        "client_ip": request.remote_addr,
        "user_agent": request.headers.get("User-Agent"),
        "session": dict(session),
        "exception_type": str(type(e)),
        "exception_message": str(e),
        "headers": dict(request.headers),
        "request_data": request.data.decode('utf-8'),
        "traceback": traceback.format_exc()
    }

    logger.error(error_data)

def handle_error(e, message, status_code, error_code=None):
    """Logs the error and returns a response."""
    log_error(e)
    response_data = {
        "error": message,
        "error_code": error_code
    }

    # Include traceback for development purposes
    if current_app.config.get("FLASK_ENV") == "development":
        response_data["traceback"] = traceback.format_exc()

    return jsonify(response_data), status_code

def register_error_handlers(app):
    """Register error handlers to the app."""

    @app.errorhandler(ValueError)
    def handle_value_error(e):
        return handle_error(e, "Invalid data format provided.", 400, "VALUE_ERROR")

    @app.errorhandler(OperationalError)
    def handle_operational_error(e):
        return handle_error(e, "Database operation failed. Please try again later.", 500, "DB_ERROR")

    @app.errorhandler(Exception)
    def handle_generic_exception(e):
        return handle_error(e, "An unexpected error occurred.", 500, "GENERIC_ERROR")

    @app.errorhandler(KeyError)
    def handle_key_error(e):
        return handle_error(e, "Key not found.", 400, "KEY_ERROR")

    @app.errorhandler(IndexError)
    def handle_index_error(e):
        return handle_error(e, "Index out of range.", 400, "INDEX_ERROR")

    @app.errorhandler(TimeoutError)
    def handle_timeout_error(e):
        return handle_error(e, "The operation timed out.", 408, "TIMEOUT_ERROR")

    @app.errorhandler(404)
    def handle_not_found(e):
        return handle_error(e, "Resource not found.", 404, "NOT_FOUND")

    @app.errorhandler(405)
    def handle_method_not_allowed(e):
        return handle_error(e, "Method not allowed.", 405, "METHOD_NOT_ALLOWED")
