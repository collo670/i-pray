import requests
from bs4 import BeautifulSoup
from datetime import date
import json
import re

def fetch_usccb_readings():
    """
    Fetch Catholic daily readings from USCCB website with improved scraping
    """
    url = "https://bible.usccb.org/bible/readings"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        readings = {}
        
        # Find the main content area with readings
        content_area = soup.find('div', class_='content-body')
        if not content_area:
            print("Could not find main content area on USCCB")
            return {}
        
        # Find all reading sections
        reading_sections = content_area.find_all('div', class_='bibleReadingsWrapper')
        
        for section in reading_sections:
            # Get the heading to identify the reading type
            heading = section.find('h3', class_='name')
            if not heading:
                continue
                
            heading_text = heading.get_text(strip=True)
            
            # Get the content of the reading
            content_div = section.find('div', class_='content-body')
            if not content_div:
                continue
                
            # Extract the text
            paragraphs = content_div.find_all('p')
            reading_text = ' '.join([p.get_text(strip=True) for p in paragraphs])
            
            # Map to our reading types
            if 'Reading 1' in heading_text:
                readings['FirstReading'] = reading_text
            elif 'Responsorial Psalm' in heading_text:
                readings['Psalm'] = reading_text
            elif 'Gospel' in heading_text:
                readings['Gospel'] = reading_text
        
        return readings
    
    except Exception as e:
        print(f"Error fetching from USCCB: {e}")
        return {}

def fetch_ewtn_readings():
    """
    Fetch Catholic daily readings from EWTN website
    """
    url = "https://www.ewtn.com/catholicism/daily-readings"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        readings = {}
        
        # Find all heading elements for readings
        headings = soup.find_all(['h3'])
        
        for heading in headings:
            heading_text = heading.get_text(strip=True)
            
            # Process First Reading
            if 'First Reading' in heading_text:
                # Get all paragraphs until the next heading
                paragraphs = []
                for sibling in heading.find_next_siblings():
                    if sibling.name in ['h3']:
                        break
                    if sibling.name == 'p':
                        paragraphs.append(sibling.get_text(strip=True))
                
                if paragraphs:
                    readings['FirstReading'] = ' '.join(paragraphs)
            
            # Process Responsorial Psalm
            elif 'Responsorial Psalm' in heading_text:
                # Get all paragraphs until the next heading
                paragraphs = []
                for sibling in heading.find_next_siblings():
                    if sibling.name in ['h3']:
                        break
                    if sibling.name == 'p':
                        paragraphs.append(sibling.get_text(strip=True))
                
                if paragraphs:
                    readings['Psalm'] = ' '.join(paragraphs)
            
            # Process Gospel
            elif 'Gospel' in heading_text:
                # Get all paragraphs until the next heading
                paragraphs = []
                for sibling in heading.find_next_siblings():
                    if sibling.name in ['h3']:
                        break
                    if sibling.name == 'p':
                        paragraphs.append(sibling.get_text(strip=True))
                
                if paragraphs:
                    readings['Gospel'] = ' '.join(paragraphs)
        
        return readings
    
    except Exception as e:
        print(f"Error fetching from EWTN: {e}")
        return {}

def fetch_catholic_daily_readings():
    """
    Try to fetch readings from multiple sources
    """
    # First try USCCB
    readings = fetch_usccb_readings()
    if len(readings) >= 3:
        return readings
    
    # If USCCB failed, try EWTN
    print("Could not fetch complete readings from USCCB, trying EWTN...")
    readings = fetch_ewtn_readings()
    if len(readings) >= 3:
        return readings
    
    # If both failed, return empty dict
    print("Could not fetch complete readings from any online source")
    return {}

def create_sample_readings():
    """
    Create sample readings if we can't fetch from online sources
    """
    return {
        "FirstReading": "A reading from the Letter of Saint Paul to the Romans. Brothers and sisters: I am speaking in human terms because of the weakness of your nature. For just as you once yielded your members to impurity and to greater and greater iniquity, so now yield your members to righteousness for sanctification. When you were slaves of sin, you were free in regard to righteousness. But then what return did you get from the things of which you are now ashamed? The end of those things is death. But now that you have been set free from sin and have become slaves of God, the return you get is sanctification and its end, eternal life. For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus our Lord.",
        
        "Psalm": "R. Blessed are they who hope in the Lord. Blessed is the man who walks not in the counsel of the wicked, nor stands in the way of sinners, nor sits in the seat of scoffers; but his delight is in the law of the LORD, and on his law he meditates day and night. R. Blessed are they who hope in the Lord. He is like a tree planted by streams of water, that yields its fruit in its season, and its leaf does not wither. In all that he does, he prospers. R. Blessed are they who hope in the Lord. The wicked are not so, but are like chaff which the wind drives away. For the LORD knows the way of the righteous, but the way of the wicked will perish. R. Blessed are they who hope in the Lord.",
        
        "Gospel": "A reading from the holy Gospel according to Luke. Jesus said to his disciples: \"I came to cast fire upon the earth; and would that it were already kindled! I have a baptism to be baptized with; and how I am constrained until it is accomplished! Do you think that I have come to give peace on earth? No, I tell you, but rather division; for henceforth in one house there will be five divided, three against two and two against three; they will be divided, father against son and son against father, mother against daughter and daughter against her mother, mother-in-law against her daughter-in-law and daughter-in-law against her mother-in-law.\""
    }

if __name__ == "__main__":
    try:
        # Try to fetch readings from online source
        rd = fetch_catholic_daily_readings()
        
        # If we couldn't get all three readings, use sample data
        if len(rd) < 3:
            print("Could not fetch complete readings from online sources. Using sample data.")
            rd = create_sample_readings()
        
        # Save the readings
        with open('readings.json', 'w', encoding='utf-8') as f:
            json.dump(rd, f, ensure_ascii=False, indent=4)
        print("Readings saved to readings.json")
        print(json.dumps(rd, ensure_ascii=False, indent=4))
    except Exception as e:
        print("Error:", e)
        # In case of any error, still provide sample readings
        print("Using sample readings due to error.")
        rd = create_sample_readings()
        with open('readings.json', 'w', encoding='utf-8') as f:
            json.dump(rd, f, ensure_ascii=False, indent=4)
        print("Sample readings saved to readings.json")
