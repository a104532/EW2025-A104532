# Instruções para o Projeto ENGWEB2025-Afericao

## Estrutura de Pastas e Arquivos

1. Criar pasta com nome `no enunciado`
2. Criar ficheiro `PR.md`
3. Criar subpastas:
   - `ex1`
   - `ex2`

## Processamento do Dataset

### Transformações necessárias:
- Converter strings para listas
- Converter strings para números
- Renomear `id` para `_id` ou adicionar `_id` caso não exista

### Exemplo de código para tratamento do dataset:
Analisa este código que faz um tratamento de dados para livros, quero fazer o mesmo ao nivel de cuidado de tratamento mas para este dataset novo.
```
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

```
Iniciar o container do Docker: `docker start mongoEW`

Copiar o dataset para o docker: `docker cp dataset_clean.json mongoEW:/tmp`

Executar o mongo: `docker exec -it mongoEW sh`

Para ver a pasta do dataset: `cd tmp` e depois `ls`

Importar para DB: `mongoimport -d livrosT -c livrosT /tmp/dataset_clean.json --jsonArray`
(usa-se --jsonArray porque o json começa com [])

Próximo comando: `mongosh` e depois `use (bd que quermos)`


## Criação da API de Dados

Usar comando: `npx express-generator --view=pug apiDados`

Instalar dependências: `npm i` `npm i mongoose`

No WWW :
```
var port = normalizePort(process.env.PORT || 'porta');


function onListening() {
  console.log('Listening on port http://localhost:' + port + '/dados');
}
```

No App.js:
```
var mongoose = require('mongoose');

var mongoDB = 'mongodb://localhost:27017/livros';
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 60000,
  socketTimeoutMS: 60000,
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});
```

Criar pasta `models`
Criar pasta `controllers`

No fim testar: `npm start` e ver através do POSTMAN

## Criação da Interface do Utilizador

Usar comando: `npx express-generator --view=pug UI`

Instalar independências: `npm i` `npm i axios --save`

No WWW :
```
var port = normalizePort(process.env.PORT || 'porta');


function onListening() {
  console.log('Listening on port http://localhost:' + port + '/dados');
}
```



