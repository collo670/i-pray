from datetime import date
import json
import re
import os
from bs4 import BeautifulSoup

def get_daily_readings():
    """
    Retrieve daily readings from the assets folder based on current date
    """
    today = date.today()
    month = today.strftime('%B').lower()  # e.g., 'october'
    day = today.day  # e.g., 23
    month_abbr = today.strftime('%b').lower()  # e.g., 'oct'

    filename = f"{day} {month_abbr}.html"
    filepath = f"../assets/{month}/{filename}"

    if not os.path.exists(filepath):
        print(f"Readings file not found: {filepath}")
        return {}

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        soup = BeautifulSoup(content, 'html.parser')

        # Find the script tag containing the readings object
        script = soup.find('script', string=re.compile(r'const readings = \{'))
        if not script:
            print("Could not find readings in the HTML file")
            return {}

        script_text = script.string

        # Extract the readings object from JavaScript
        start = script_text.find('const readings = {')
        if start == -1:
            print("Readings object not found in script")
            return {}

        end = script_text.find('};', start)
        if end == -1:
            end = len(script_text)
        else:
            end += 1

        readings_js = script_text[start:end]

        # Extract just the object part (remove "const readings = " and ";")
        object_start = readings_js.find('{')
        object_end = readings_js.rfind('}') + 1
        if object_start == -1 or object_end == -1:
            print("Could not extract object from readings declaration")
            return {}

        object_js = readings_js[object_start:object_end]

        # Convert JavaScript object to JSON
        # Replace property names with quoted strings
        readings_json = re.sub(r'(\w+):', r'"\1":', object_js)

        # Parse as JSON, try ast.literal_eval if json fails, then eval as last resort
        try:
            readings = json.loads(readings_json)
        except json.JSONDecodeError:
            try:
                import ast
                readings = ast.literal_eval(readings_json)
            except (ValueError, SyntaxError):
                # Last resort: use eval (dangerous but necessary for malformed JS objects)
                readings = eval(object_js)

        return readings

    except Exception as e:
        print(f"Error reading readings from {filepath}: {e}")
        return {}

if __name__ == "__main__":
    try:
        rd = get_daily_readings()

        if not rd:
            print("No readings available for today")
            exit(1)

        # Save the readings
        with open('readings.json', 'w', encoding='utf-8') as f:
            json.dump(rd, f, ensure_ascii=False, indent=4)
        print("Readings saved to readings.json")
        print(json.dumps(rd, ensure_ascii=False, indent=4))
    except Exception as e:
        print(f"Error: {e}")
