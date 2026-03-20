from PIL import Image
import os

def process_image(input_path, output_name):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
                
        img.putdata(newData)
        
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
            
        img.thumbnail((100, 100), Image.Resampling.LANCZOS)
        
        output_dir = "game/assets/chars"
        os.makedirs(output_dir, exist_ok=True)
        img.save(f"{output_dir}/{output_name}.png", "PNG")
        print(f"Processed: {output_name}")
    except Exception as e:
        print(f"Error processing {output_name}: {e}")

images = {
    "cinnamoroll": "/Users/lee2juni/.gemini/antigravity/brain/3a57ed81-6f2f-4b24-8512-e8863983d54c/cinnamoroll_vector_1772769253698.png"
}

for name, path in images.items():
    process_image(path, name)
