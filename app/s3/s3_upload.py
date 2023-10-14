import boto3
import botocore
import os
from .s3_helpers import get_unique_filename

s3 = boto3.client(
   "s3",
   aws_access_key_id=os.environ.get("S3_KEY"),
   aws_secret_access_key=os.environ.get("S3_SECRET")
)

def upload_file(file, bucket_name):
    s3 = boto3.client('s3')
    file.filename = get_unique_filename(file.filename)
    try:
        s3.upload_fileobj(
            file,
            bucket_name,
            file.filename,
            ExtraArgs={
                "ACL": "public-read",
                "ContentType": file.content_type
            }
        )
        return {
            "status": "success",
            "url": f"https://{bucket_name}.s3.amazonaws.com/{file.filename}"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

