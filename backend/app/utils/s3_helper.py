import boto3
import os
import uuid
from PIL import Image
import io
from botocore.exceptions import ClientError

class S3Helper:
    def __init__(self):
        self.s3 = boto3.client(
            's3',
            region_name=os.environ.get('AWS_REGION', 'ap-south-1')
        )
        self.bucket_name = os.environ.get('S3_BUCKET_NAME')
        self.cloudfront_url = os.environ.get('VITE_CLOUDFRONT_URL')

    def upload_image(self, file, folder="products", max_size=(800, 800)):
        """
        Resizes, converts to WebP, and uploads an image to S3.
        """
        try:
            # 1. Open and Process Image
            img = Image.open(file)
            
            # Convert to RGB if necessary (e.g., for PNGs with alpha or CMYK JPEGs)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            # Resize while preserving aspect ratio
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save to BytesIO buffer as WebP
            buffer = io.BytesIO()
            img.save(buffer, format="WEBP", quality=85)
            buffer.seek(0)
            
            # 2. Generate Unique Key
            file_key = f"{folder}/{uuid.uuid4()}.webp"
            
            # 3. Upload to S3
            self.s3.put_object(
                Bucket=self.bucket_name,
                Key=file_key,
                Body=buffer,
                ContentType='image/webp'
            )
            
            # 4. Construct URLs
            # Using CloudFront URL as the primary source
            image_url = f"{self.cloudfront_url}/{file_key}"
            
            return {
                "image_url": image_url,
                "image_key": file_key
            }
            
        except Exception as e:
            print(f"S3 Upload Error: {str(e)}")
            return None

    def delete_image(self, file_key):
        """
        Deletes an object from S3.
        """
        try:
            self.s3.delete_object(Bucket=self.bucket_name, Key=file_key)
            return True
        except ClientError:
            return False

s3_helper = S3Helper()
