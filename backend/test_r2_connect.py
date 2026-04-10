"""
Cloudflare R2 connection test script
- Reads R2 settings from .env and verifies boto3 connection
- Directly accesses sgmatch-storage bucket (skips ListBuckets - often restricted)
- Upload test object -> generate presigned URL -> delete
This file is NOT pushed to GitHub.
"""
import os
import sys

from dotenv import load_dotenv

load_dotenv()

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

ENDPOINT = os.getenv("R2_ENDPOINT_URL", "")
ACCESS_KEY = os.getenv("R2_ACCESS_KEY_ID", "")
SECRET_KEY = os.getenv("R2_SECRET_ACCESS_KEY", "")
BUCKET = os.getenv("R2_BUCKET_NAME", "sgmatch-storage")

print("=" * 60)
print("  Cloudflare R2 Connection Test")
print("=" * 60)

# Check required env vars
missing = []
if not ENDPOINT:
    missing.append("R2_ENDPOINT_URL")
if not ACCESS_KEY:
    missing.append("R2_ACCESS_KEY_ID")
if not SECRET_KEY:
    missing.append("R2_SECRET_ACCESS_KEY")

if missing:
    print(f"[FAIL] Missing env vars: {', '.join(missing)}")
    sys.exit(1)

print(f"  Endpoint : {ENDPOINT}")
print(f"  AccessKey: {ACCESS_KEY[:8]}{'*' * (len(ACCESS_KEY) - 8)}")
print(f"  Bucket   : {BUCKET}")
print()

# Create boto3 client
try:
    s3 = boto3.client(
        "s3",
        endpoint_url=ENDPOINT,
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
        config=Config(signature_version="s3v4"),
    )
    print("[OK] boto3 client created successfully")
except Exception as e:
    print(f"[FAIL] boto3 client creation failed: {e}")
    sys.exit(1)

# NOTE: ListBuckets is often restricted for R2 API tokens.
# We skip it and directly access the target bucket instead.
print(f"[INFO] Skipping ListBuckets (often restricted on R2 API tokens)")
print(f"[INFO] Directly accessing target bucket: {BUCKET}")

# Upload test object (confirms bucket access + write permission)
TEST_KEY = "test/__connection_test__.txt"
TEST_BODY = b"SG Match R2 connection test - OK"
try:
    s3.put_object(Bucket=BUCKET, Key=TEST_KEY, Body=TEST_BODY, ContentType="text/plain")
    print(f"[OK] Test object uploaded: {TEST_KEY}")
except ClientError as e:
    code = e.response["Error"]["Code"]
    print(f"[FAIL] Test object upload failed [{code}]: {e}")
    sys.exit(1)

# List objects in bucket (confirms bucket exists + read permission)
try:
    response = s3.list_objects_v2(Bucket=BUCKET, Prefix="test/", MaxKeys=5)
    keys = [obj["Key"] for obj in response.get("Contents", [])]
    print(f"[OK] Objects listed in '{BUCKET}/test/': {keys}")
except ClientError as e:
    code = e.response["Error"]["Code"]
    print(f"[FAIL] Failed to list objects [{code}]: {e}")
    sys.exit(1)

# Generate presigned upload URL
try:
    upload_url = s3.generate_presigned_url(
        "put_object",
        Params={"Bucket": BUCKET, "Key": "test/__presign_upload_test__.txt", "ContentType": "text/plain"},
        ExpiresIn=300,
    )
    print("[OK] Presigned upload URL generated")
    print(f"     {upload_url[:90]}...")
except ClientError as e:
    print(f"[FAIL] Presigned upload URL generation failed: {e}")
    sys.exit(1)

# Generate presigned download URL
try:
    download_url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": BUCKET, "Key": TEST_KEY},
        ExpiresIn=300,
    )
    print("[OK] Presigned download URL generated")
    print(f"     {download_url[:90]}...")
except ClientError as e:
    print(f"[FAIL] Presigned download URL generation failed: {e}")
    sys.exit(1)

# Delete test object
try:
    s3.delete_object(Bucket=BUCKET, Key=TEST_KEY)
    print(f"[OK] Test object deleted: {TEST_KEY}")
except ClientError as e:
    print(f"[WARN] Test object deletion failed (ignorable): {e}")

print()
print("=" * 60)
print("  [SUCCESS] Cloudflare R2 connection test complete")
print("=" * 60)
