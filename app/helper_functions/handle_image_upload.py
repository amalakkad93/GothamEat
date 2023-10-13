from flask import current_app as app, jsonify
from ..s3 import upload_file_to_s3, allowed_file


from flask import jsonify

def handle_image_upload(image_data, image_url, model_class, reference_id, db):

    reference_field_name = "menu_item_id" if model_class.__name__ == "MenuItemImg" else "review_id"

    if image_data and allowed_file(image_data.filename):
        result = upload_file_to_s3(image_data)

        if result.get("status") == "success":
            uploaded_image_url = result.get("url")

            # Use setattr to set the reference_id dynamically
            new_image = model_class(**{reference_field_name: reference_id}, image_path=uploaded_image_url)

            db.session.add(new_image)
            db.session.commit()
            return jsonify({"image_url": uploaded_image_url}), 201
        else:
            print(f"Error from S3: {result.get('message')}")
            return jsonify({"error": "Failed to upload image to S3."}), 500

    elif image_url:
        # Use setattr to set the reference_id dynamically
        new_image = model_class(**{reference_field_name: reference_id}, image_path=image_url)

        db.session.add(new_image)
        db.session.commit()
        return jsonify({"image_url": image_url}), 201
    else:
        return jsonify({"error": "Image or image URL is required."}), 400
