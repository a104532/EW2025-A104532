import json
import re

def string_to_list(string, toInt=False):
    ret = []
    for item in string.split(","):
        item = item.strip().strip("'").strip('"')
        if toInt:
            item = int(item) if re.match(r'-?\d+$', item) else 0
        if item != '':
            ret.append(item)
    return ret

def convert_price(price_str):
    if not price_str or price_str == '':
        return 0.0
    
    if price_str.count('.') > 1:
        last_period_pos = price_str.rindex('.')
        cleaned_price = price_str[:last_period_pos].replace('.', '') + price_str[last_period_pos:]
        return float(cleaned_price)
    
    return float(price_str)
    
with open("dataset.json", "r", encoding="utf-8") as f:
    books = json.load(f)

string_of_list = re.compile(r'^\[(.*)\]$') #para treinar regex, podia ser com json.load()

for book in books:
    genres = book["genres"]
    pattern_match = string_of_list.match(genres)
    if pattern_match:
        book["genres"] = string_to_list(pattern_match.group(1))

    characters = book["characters"]
    pattern_match = string_of_list.match(characters)
    if pattern_match:
        book["characters"] = string_to_list(pattern_match.group(1))

    characters = book["awards"]
    pattern_match = string_of_list.match(characters)
    if pattern_match:
        book["awards"] = string_to_list(pattern_match.group(1))

    characters = book["ratingsByStars"]
    pattern_match = string_of_list.match(characters)
    if pattern_match:
        book["ratingsByStars"] = string_to_list(pattern_match.group(1), True)
    
    characters = book["setting"]
    pattern_match = string_of_list.match(characters)
    if pattern_match:
        book["setting"] = string_to_list(pattern_match.group(1))
    
    digit = re.compile(r'(\d+)')


    book["pages"] = int(digit.match(book["pages"]).group(1)) if book["pages"] != '' else 0
    book["numRatings"] = int(book["numRatings"])
    book["likedPercent"] = int(book["likedPercent"]) if book["likedPercent"] != '' else 0
    book["bbeScore"] = int(book["bbeScore"])
    book["bbeVotes"] = int(book["bbeVotes"])
    book["price"] = convert_price(book["price"])
    book["rating"] = float(book["rating"])

    if ',' in book["author"]:
        authors = [author.strip() for author in book["author"].split(',') if author.strip()]
        book["author"] = authors
    else:
        book["author"] = [book["author"].strip()]
    
    for author in book["author"]:
        if(author[0] == ' '):
            print(f"Author:{author}")

    book['_id'] = book.pop('bookId')

with open("dataset_books.json", "w", encoding="utf-8") as f:
    json.dump(books, f, ensure_ascii=False, indent=4)