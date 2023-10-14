# from flask import current_app as app, jsonify
from flask import current_app, jsonify
from flask_login import current_user
from ..s3 import upload_file_to_s3, allowed_file, remove_file_from_s3


# *******************************Handle Image Upload*******************************
def upload_image(image_data, image_url, model_class, reference_id, db):
    try:
        reference_field_name = "menu_item_id" if model_class.__name__ == "MenuItemImg" else "review_id"

        # Check if the current user has the permission to upload
        if not current_user.is_authenticated:
            raise PermissionError("You need to be logged in to upload images.", 401)

        # You can add more permission checks here if necessary

        if image_data and allowed_file(image_data.filename):
            result = upload_file_to_s3(image_data)

            if result.get("status") == "success":
                uploaded_image_url = result.get("url")
                new_image = model_class(**{reference_field_name: reference_id}, image_path=uploaded_image_url)
                db.session.add(new_image)
                db.session.commit()
                return {"status": "success", "image_url": uploaded_image_url, "code": 201}
            else:
                raise ValueError(f"Error from S3: {result.get('message')}", 500)

        elif image_url:
            new_image = model_class(**{reference_field_name: reference_id}, image_path=image_url)
            db.session.add(new_image)
            db.session.commit()
            return {"status": "success", "image_url": image_url, "code": 201}

        else:
            raise ValueError("Image or image URL is required.", 400)

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


# *******************************Handle Image Deletion*******************************
def delete_image(image_id, ImageModel, db, display_name, has_permission_func, get_owner_func):
    try:
        # Check image existence
        image_record = ImageModel.query.get(image_id)
        if not image_record:
            raise ValueError(f"{display_name} with ID {image_id} not found.", 404)

        # Check ownership using the passed-in function
        owner = get_owner_func(image_record)
        if not has_permission_func(owner):
            raise PermissionError(f"You don't have permission to delete {display_name} with ID {image_id}.", 403)

        # Attempt to remove the image from S3
        if image_record.image_path:
            try:
                remove_file_from_s3(image_record.image_path)
            except Exception as e:
                current_app.logger.error(f"Failed to remove image from S3: {str(e)}")
                raise ValueError(f"Error while deleting {display_name} image from S3.", 500)

        # Delete the image record
        db.session.delete(image_record)
        db.session.commit()

        return {"status": "success", "message": f"{display_name} image deleted successfully", "code": 200}

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



# # *******************************Handle Image Deletion*******************************
# def delete_image(image_id, ImageModel, AssociatedModel, association_attr, db, display_name):
#     try:
#         # Check image existence
#         image_record = ImageModel.query.get(image_id)
#         if not image_record:
#             raise ValueError(f"{display_name} with ID {image_id} not found.", 404)

#         # Validate associated model
#         associated_record = getattr(image_record, association_attr)
#         if not associated_record:
#             raise ValueError(f"No associated {AssociatedModel.__name__} for {display_name} with ID {image_id}.", 404)

#         # Check ownership
#         if getattr(associated_record, 'user_id', None) != current_user.id:
#             raise PermissionError(f"You don't have permission to delete {display_name} with ID {image_id}.", 403)

#         # Attempt to remove the image from S3
#         if image_record.image_path:
#             try:
#                 remove_file_from_s3(image_record.image_path)
#             except Exception as e:
#                 current_app.logger.error(f"Failed to remove image from S3: {str(e)}")
#                 raise ValueError(f"Error while deleting {display_name} image from S3.", 500)

#         # Delete the image record
#         db.session.delete(image_record)
#         db.session.commit()

#         return {"status": "success", "message": f"{display_name} image deleted successfully", "code": 200}

#     except ValueError as e:
#         current_app.logger.error(f"ValueError: {str(e)}")
#         message, code = e.args if len(e.args) == 2 else (str(e), 400)
#         return {"status": "error", "message": message, "code": code}
#     except PermissionError as e:
#         current_app.logger.error(f"PermissionError: {str(e)}")
#         message, code = e.args if len(e.args) == 2 else (str(e), 400)
#         return {"status": "error", "message": message, "code": code}
#     except Exception as e:
#         db.session.rollback()
#         current_app.logger.error(f"Unexpected error in delete_image: {str(e)}")
#         return {"status": "error", "message": "An unexpected error occurred.", "code": 500}


# # *******************************Handle Image Upload*******************************
# def upload_image(image_data, image_url, model_class, reference_id, db):

#     reference_field_name = "menu_item_id" if model_class.__name__ == "MenuItemImg" else "review_id"

#     if image_data and allowed_file(image_data.filename):
#         result = upload_file_to_s3(image_data)

#         if result.get("status") == "success":
#             uploaded_image_url = result.get("url")

#             new_image = model_class(**{reference_field_name: reference_id}, image_path=uploaded_image_url)

#             db.session.add(new_image)
#             db.session.commit()
#             return jsonify({"image_url": uploaded_image_url}), 201
#         else:
#             print(f"Error from S3: {result.get('message')}")
#             return jsonify({"error": "Failed to upload image to S3."}), 500

#     elif image_url:
#         new_image = model_class(**{reference_field_name: reference_id}, image_path=image_url)

#         db.session.add(new_image)
#         db.session.commit()
#         return jsonify({"image_url": image_url}), 201
#     else:
#         return jsonify({"error": "Image or image URL is required."}), 400
