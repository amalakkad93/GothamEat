from flask import Blueprint, jsonify, request, current_app
from ..s3 import get_unique_filename,  BUCKET_NAME

s3_routes = Blueprint('s3_routes', __name__)

@s3_routes.route('/generate_presigned_url', methods=['GET'])
def generate_presigned_url():
    s3_client = current_app.config['S3_CLIENT']
    s3_location = current_app.config['S3_LOCATION']

    filename = get_unique_filename(request.args.get('filename'))
    content_type = request.args.get('contentType')  # Capture the MIME type
    
    if not filename or not content_type:
        return jsonify({'error': 'Filename or contentType missing'}), 400

    presigned_url = s3_client.generate_presigned_url('put_object',
                                                     Params={'Bucket': BUCKET_NAME, 'Key': filename, 'ContentType': content_type},
                                                     ExpiresIn=3600)

    return jsonify({'presigned_url': presigned_url, 'file_url': f"{s3_location}{filename}"})



# from flask import Blueprint, jsonify, request
# # from app import s3_client, s3_location
# from ..s3 import get_unique_filename,  BUCKET_NAME

# # Retrieve the S3 client and location from the app's configuration


# s3_routes= Blueprint('s3__routes', __name__)

# @s3_routes.route('/generate_presigned_url', methods=['GET'])
# def generate_presigned_url():
#     from app import s3_client, s3_location
#     filename = get_unique_filename(request.args.get('filename'))

#     presigned_url = s3_client.generate_presigned_url('put_object',
#                                               Params={'Bucket': BUCKET_NAME, 'Key': filename},
#                                               ExpiresIn=3600)  # URL expires in 1 hour

#     return jsonify({'presigned_url': presigned_url, 'file_url': f"{s3_location}{filename}"})
