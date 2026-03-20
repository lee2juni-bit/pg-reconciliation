const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const url = "https://rhcmonmadmdcijlvdgcx.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoY21vbm1hZG1kY2lqbHZkZ2N4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU4OTU0OCwiZXhwIjoyMDg1MTY1NTQ4fQ.IkhYlwlAA8KcnG_pCMb8QL1ZXtZe1xdfy48Sp70XbM4";
const supabase = createClient(url, key);

const bucketName = "hangul-game";
const filePath = "/Users/lee2juni/Desktop/Antigravity/game/index_bundled.html";
const destination = "index.html";

async function deploy() {
    const fileBuffer = fs.readFileSync(filePath);
    console.log(`Uploading bundled index.html to Supabase Storage...`);

    const { error: uploadError } = await supabase.storage.from(bucketName).upload(destination, fileBuffer, {
        contentType: 'text/html; charset=utf-8',
        upsert: true
    });

    if (uploadError) {
        console.error("Error uploading:", uploadError);
    } else {
        const { data } = supabase.storage.from(bucketName).getPublicUrl(destination);
        console.log("\nDEPLOYMENT_SUCCESSFUL");
        console.log(`PUBLIC_URL: ${data.publicUrl}`);
    }
}

deploy();
