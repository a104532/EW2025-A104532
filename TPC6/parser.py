import csv
import json
import re

def csv_to_json(csv_file_path, json_file_path):
    data = []

    with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file, delimiter=';')

        for row in csv_reader:
            for key, value in row.items():
                if re.match(r'^-?\d+,\d+$', value):
                    row[key] = value.replace(',', '.')
            
            if 'idcontrato' in row:
                row['_id'] = row.pop('idcontrato')
            data.append(row)

    with open(json_file_path, mode='w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)

csv_file_path = 'contratos2024.csv'
json_file_path = 'contratos2024.json'
csv_to_json(csv_file_path, json_file_path)