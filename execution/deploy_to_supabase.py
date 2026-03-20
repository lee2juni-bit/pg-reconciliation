import os
import mimetypes
from supabase import create_client, Client

url = "https://rhcmonmadmdcijlvdgcx.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoY21vbm1hZG1kY2lqbHZkZ2N4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU4OTU0OCwiZXhwIjoyMDg1MTY1NTQ4fQ.IkhYlwlAA8KcnG_pCMb8QL1ZXtZe1xdfy48Sp70XbM4"
supabase: Client = create_client(url, key)

bucket_name = "hangul-game"

# 1. Create bucket if not exists
try:
    supabase.storage.create_bucket(bucket_name, options={"public": True})
    print(f"Bucket '{bucket_name}' created.")
except Exception as e:
    if "already exists" in str(e).lower():
        print(f"Bucket '{bucket_name}' already exists.")
    else:
        print(f"Error creating bucket: {e}")

# 2. Upload files
game_dir = "/Users/lee2juni/Desktop/Antigravity/game"
files_to_upload = ["index.html", "style.css", "script.js", "words.js"]

for filename in files_to_upload:
    file_path = os.path.join(game_dir, filename)
    mime_type, _ = mimetypes.guess_type(file_path)
    
    with open(file_path, 'rb') as f:
        try:
            # Overwrite if exists
            supabase.storage.from_(bucket_name).upload(
                path=filename,
                file=f,
                file_options={"cache-control": "3600", "upsert": "true", "content-type": mime_type}
            )
            print(f"Successfully uploaded: {filename} ({mime_type})")
        except Exception as e:
            print(f"Error uploading {filename}: {e}")

# 3. Get Public URL
public_url = supabase.storage.from_(bucket_name).get_public_url("index.html")
print(f"\nDEPLOYMENT_SUCCESSFUL")
print(f"PUBLIC_URL: {public_url}")
