# from flask import current_app as app, jsonify
from flask import current_app, jsonify
from flask_login import current_user
from ..s3 import upload_file_to_s3, allowed_file, remove_file_from_s3

# ---------------------------- Handle Image Upload ----------------------------
# This function is responsible for uploading an image to the associated model
# and storing its path to the database.
# It first checks if the image is valid and if the user has the permission to upload.
# After the checks, it tries to upload the image to S3 and if successful,
# stores the image path to the database.
def upload_image(image_data, image_url, model_class, reference_id, db):
    try:
        # Determine the field name based on the model class
        reference_field_name = "menu_item_id" if model_class.__name__ == "MenuItemImg" else "review_id"

        # Ensure the user is authenticated before uploading
        if not current_user.is_authenticated:
            raise PermissionError("You need to be logged in to upload images.", 401)

        # Check if the image data is valid and upload to S3
        if image_data and allowed_file(image_data.filename):
            result = upload_file_to_s3(image_data)

            # If upload was successful, save the image path in the database
            if result.get("status") == "success":
                uploaded_image_url = result.get("url")
                new_image = model_class(**{reference_field_name: reference_id}, image_path=uploaded_image_url)
                db.session.add(new_image)
                db.session.commit()
                return {"status": "success", "image_url": uploaded_image_url, "code": 201}

            else:
                raise ValueError(f"Error from S3: {result.get('message')}", 500)

        # Alternatively, if an image URL is provided, save it to the database
        elif image_url:
            new_image = model_class(**{reference_field_name: reference_id}, image_path=image_url)
            db.session.add(new_image)
            db.session.commit()
            return {"status": "success", "image_url": image_url, "code": 201}

        # If neither image data nor URL is provided, return an error
        else:
            raise ValueError("Image or image URL is required.", 400)

    # Handle various exceptions and log the errors
    except ValueError as e:
        current_app.logger.error(f"ValueError: {str(e)}")
        message, code = e.args if len(e.args) == 2 else (str(e), 400)
        return {"status": "error", "message": message, "code": code}
    except PermissionError as e:
        current_app.logger.error(f"PermissionError: {str(e)}")
        message, code = e.args if len(e.args) == 2 else (str(e), 400)
        return {"status": "error", "message": message, "code": code}
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Unexpected error in upload_image: {str(e)}")
        return {"status": "error", "message": "An unexpected error occurred.", "code": 500}


# ---------------------------- Handle Image Deletion ----------------------------
# This function facilitates the deletion of an image from the database.
# It first checks if the image exists and if the current user has the permission to delete it.
# After the checks, it deletes the image from S3 (if it exists there) and then deletes its record from the database.
def delete_image(image_id, ImageModel, db, display_name, has_permission_func, get_owner_func):
    try:
        # Verify the existence of the image
        image_record = ImageModel.query.get(image_id)
        if not image_record:
            raise ValueError(f"{display_name} with ID {image_id} not found.", 404)

        # Use the provided functions to check ownership
        owner = get_owner_func(image_record)
        if not has_permission_func(owner):
            raise PermissionError(f"You don't have permission to delete {display_name} with ID {image_id}.", 403)

        # If the image path exists in the record, remove it from S3
        if image_record.image_path:
            try:
                remove_file_from_s3(image_record.image_path)
            except Exception as e:
                current_app.logger.error(f"Failed to remove image from S3: {str(e)}")
                raise ValueError(f"Error while deleting {display_name} image from S3.", 500)

        # Delete the image's record from the database
        db.session.delete(image_record)
        db.session.commit()

        return {"status": "success", "message": f"{display_name} image deleted successfully", "code": 200}

    # Handle various exceptions and log the errors
    except ValueError as e:
        current_app.logger.error(f"ValueError: {str(e)}")
        message, code = e.args if len(e.args) == 2 else (str(e), 400)
        return {"status": "error", "message": message, "code": code}
    except PermissionError as e:
        current_app.logger.error(f"PermissionError: {str(e)}")
        message, code = e.args if len(e.args) == 2 else (str(e), 400)
        return {"status": "error", "message": message, "code": code}
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Unexpected error in delete_image: {str(e)}")
        return {"status": "error", "message": "An unexpected error occurred.", "code": 500}
