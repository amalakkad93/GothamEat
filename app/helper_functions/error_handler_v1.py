# import traceback
# import logging
# from flask import jsonify, request, current_app
# from sqlite3 import OperationalError
# from logging.handlers import RotatingFileHandler
# from flask_login import current_user

# # Configure logging
# log_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# # General log configuration
# general_log_handler = RotatingFileHandler('general.log', maxBytes=50000, backupCount=2)
# general_log_handler.setLevel(logging.INFO)
# general_log_handler.setFormatter(log_formatter)

# # Error log configuration
# error_log_handler = RotatingFileHandler('errors.log', maxBytes=50000, backupCount=2)
# error_log_handler.setLevel(logging.ERROR)
# error_log_handler.setFormatter(log_formatter)

# logger = logging.getLogger(__name__)
# logger.setLevel(logging.DEBUG)  # Capture all log levels
# logger.addHandler(general_log_handler)
# logger.addHandler(error_log_handler)

# def log_error(e):
#     """Logs detailed information about the error."""
#     user_info = f"User: {current_user.id}" if current_user.is_authenticated else "User: Anonymous"

#     logger.error({
#         "user": user_info,
#         "url": request.url,
#         "http_method": request.method,
#         "client_ip": request.remote_addr,
#         "exception_type": str(type(e)),
#         "exception_message": str(e),
#         "headers": dict(request.headers),
#         "request_data": request.data.decode('utf-8'),
#         "traceback": traceback.format_exc()
#     })

# def handle_error(e, message, status_code):
#     """Logs the error and returns a response."""
#     log_error(e)
#     response_data = {"error": message}

#     # Include traceback for development purposes
#     if current_app.config.get("FLASK_ENV") == "development":
#         response_data["traceback"] = traceback.format_exc()

#     return jsonify(response_data), status_code

# def register_error_handlers(app):
#     """Register error handlers to the app."""

#     @app.errorhandler(ValueError)
#     def handle_value_error(e):
#         return handle_error(e, "Invalid data format provided.", 400)

#     @app.errorhandler(OperationalError)
#     def handle_operational_error(e):
#         return handle_error(e, "Database operation failed. Please try again later.", 500)

#     @app.errorhandler(Exception)
#     def handle_generic_exception(e):
#         return handle_error(e, "An unexpected error occurred.", 500)

#     @app.errorhandler(KeyError)
#     def handle_key_error(e):
#         return handle_error(e, "Key not found.", 400)

#     @app.errorhandler(IndexError)
#     def handle_index_error(e):
#         return handle_error(e, "Index out of range.", 400)

#     @app.errorhandler(TimeoutError)
#     def handle_timeout_error(e):
#         return handle_error(e, "The operation timed out.", 408)

#     @app.errorhandler(404)
#     def handle_not_found(e):
#         return handle_error(e, "Resource not found.", 404)

#     @app.errorhandler(405)
#     def handle_method_not_allowed(e):
#         return handle_error(e, "Method not allowed.", 405)
