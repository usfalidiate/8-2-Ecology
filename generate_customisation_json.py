import os
import json

# Base directory for assets
base_dir = "assets"

# List of categories (subfolders) to scan
categories = ["skin", "pants", "tops", "eyes", "mouth", "face", "hair", "shoes", "masks"]

# Dictionary to hold all options
customisation_options = {}

for category in categories:
    category_path = os.path.join(base_dir, category)
    if os.path.exists(category_path):
        # List all PNG files in the category folder
        files = [
            {
                "file": file,
                "label": file.replace('.png', '').replace('_', ' ').title(),
                "tier": 1,
                "cost": 50
            }
            for file in os.listdir(category_path) if file.endswith('.png')
        ]
        customisation_options[category] = files

# Output file path
output_file = os.path.join(base_dir, "customisation-options.json")

# Write the JSON data to a file
with open(output_file, "w") as json_file:
    json.dump(customisation_options, json_file, indent=4)

print(f"Customisation options updated in `{output_file}`!")
