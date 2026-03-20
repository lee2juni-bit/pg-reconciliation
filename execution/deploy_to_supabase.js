const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const url = "https://rhcmonmadmdcijlvdgcx.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoY21vbm1hZG1kY2lqbHZkZ2N4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU4OTU0OCwiZXhwIjoyMDg1MTY1NTQ4fQ.IkhYlwlAA8KcnG_pCMb8QL1ZXtZe1xdfy48Sp70XbM4";
const supabase = createClient(url, key);

const bucketName = "hangul-game";
const gameDir = "/Users/lee2juni/Desktop/Antigravity/game";
const filesToUpload = ["index.html", "style.css", "script.js", "words.js"];

async function deploy() {
    // 1. Create bucket if not exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
        console.error("Error listing buckets:", listError);
        return;
    }

    const bucketExists = buckets.some(b => b.name === bucketName);
    if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket(bucketName, { public: true });
        if (createError) {
            console.error("Error creating bucket:", createError);
            return;
        }
        console.log(`Bucket '${bucketName}' created.`);
    } else {
        console.log(`Bucket '${bucketName}' already exists.`);
    }

    // 2. Upload files
    for (const filename of filesToUpload) {
        const filePath = path.join(gameDir, filename);
        const fileBuffer = fs.readFileSync(filePath);

        // Guess content type
        let contentType = 'text/plain';
        if (filename.endsWith('.html')) contentType = 'text/html';
        else if (filename.endsWith('.css')) contentType = 'text/css';
        else if (filename.endsWith('.js')) contentType = 'application/javascript';

        const { error: uploadError } = await supabase.storage.from(bucketName).upload(filename, fileBuffer, {
            contentType: contentType,
            upsert: true
        });

        if (uploadError) {
            console.error(`Error uploading ${filename}:`, uploadError);
        } else {
            console.log(`Successfully uploaded: ${filename} (${contentType})`);
        }
    }

    // 3. Get Public URL
    const { data } = supabase.storage.from(bucketName).getPublicUrl("index.html");
    console.log("\nDEPLOYMENT_SUCCESSFUL");
    console.log(`PUBLIC_URL: ${data.publicUrl}`);
}

deploy();
