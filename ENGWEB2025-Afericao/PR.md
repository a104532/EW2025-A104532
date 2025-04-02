# Prova de aferição

## 1.1 Setup

Fez-se os tratamentos dos dados contidos no `dataset.json` usando o programa [fix_dataset.py](https://github.com/gabrielRibeir0/EW2025-A104171/blob/main/ENGWEB2025-Afericao/fix_dataset.py) resultando no `dataset_books.json`.

`py fix_dataset.py`

Foram tratados os seguintes aspetos:

- As listas que estavam em strings passaram a ser convertidas para listas (Genres, Characters, Awards, RatingsByStars, Setting, Autores);

- As strings foram convertidas para números para permitir uma leitura mais rápida e eficiente (pages, numRatings, likedPercent, bbeScore, bbeVotes, price, rating);

- Renomear campo `bookId` para `_id`, preparando o dataset para o mongoDB onde `_id` será o id.

Copiar o ficheiro do dataset para o container Docker:

> Inicializar o container `docker start mongoEW`

`docker cp dataset_books.json mongoEW:/tmp`

Executar o container:

`docker exec -it mongoEW sh`

Importar o dataset para o mongoDB:

`mongoimport -d livros -c livros /tmp/dataset_books.json --jsonArray`

Verificar que o dataset foi importado:

```sh
mongosh
show dbs
use livros
db.livros.countDocuments()
```

## 1.2 Queries

**1. Quantos livros têm a palavra Love no título;**

`db.find({title:{ $regex: /love/i }}).count()`

Res: 366

**2. Quais os títulos dos livros, em ordem alfabética, em que um dos autores tem apelido Austen?**

`db.livros.find({ author: { $regex: /Austen/i } }, { title: 1, _id: 0 }).sort({ title: 1 })`

Res:

```
[
  { title: 'Emma' },
  { title: 'Mansfield Park' },
  { title: 'Northanger Abbey' },
  { title: 'Persuasion' },
  { title: 'Pride and Prejudice' },
  { title: 'Pride and Prejudice and Zombies' },
  { title: 'Pride and Prejudice and Zombies: The Graphic Novel' },
  { title: 'Sense and Sensibility' },
  { title: 'The Complete Novels' }
]
```

**3. Qual a lista de autores (ordenada alfabeticamente e sem repetições)?**

`db.livros.distinct("author").sort()`

Res:

```
[
  '#1-3)',
  '#4-5)',
  '(Goodreads Author)',
  ')',
  '50 Cent',
  "A'Mera Frieman",
  'A. Elizabeth Delany',
  'A. Kirk (Goodreads Author)',
  'A. Lee Martinez (Goodreads Author)',
  'A. Meredith Walters (Goodreads Author)',
  'A. Merritt',
  'A. Poulin Jr. (Translator)',
  'A. Roger Merrill',
  'A. Rose (Goodreads Author)',
  'A. Vivanti Salmon (Translator)',
  'A.A. Attanasio (Goodreads Author)',
  'A.A. Milne',
  'A.C. Bextor (Goodreads Author)',
  'A.C. Crispin',
  'A.C. Gaughen (Goodreads Author)',
  'A.C. Weisbecker',
  'A.D. Bloom',
  'A.D. Zoltan',
  'A.F. Knott (Goodreads Author)',
  'A.G. Howard (Goodreads Author)',
  'A.G. Riddle (Goodreads Author)',
  'A.H. Holt',
  'A.H.T. Levi (Introduction)',
  'A.I. Alexen',
  'A.J. Betts (Goodreads Author)',
  'A.J. Bialo',
  'A.J. Cronin',
  'A.J. Finn',
  'A.J. Jacobs',
  'A.J. Krailsheimer (Translator)',
  'A.J. Mouse (Goodreads Author)',
  'A.J.P. Taylor',
  'A.L. Gibson',
  'A.L. Jackson (Goodreads Author)',
  'A.M. Hargrove (Goodreads Author)',
  'A.M. Homes',
  'A.M. Madden (Goodreads Author)',
  'A.M. Robinson (Goodreads Author)',
  'A.M. Willard',
  'A.N. Roquelaure',
  'A.N. Roquelaure (Pseudonym)',
  'A.N. Roquelaure (pseudonym)',
  'A.P. Stephens (Goodreads Author)',
  'A.P.J. Abdul Kalam',
  'A.R. Torre',
  'A.S. Byatt',
  'A.S. Byatt (Editor/Introduction)',
  'A.S. Byatt (Introduction)',
  'A.S. King (Goodreads Author)',
  'A.S.A. Harrison',
  'A.T. Hatto (Translator)',
  'A.V. Lebrón (translator)',
  'A.V. Miller (Translator)',
  'A.W. Tozer',
  'A.Z. Manfred',
  'Aadhavan',
  'Aarno Peromies (Translator)',
  'Aaron Asher (Translator)',
  "Aaron D'Este (Goodreads Author)",
  'Aaron Jennings (Goodreads Author)',
  'Aaron Johnston (Goodreads Author)',
  'Aaron Leichter (Adapter)',
  'Aaron M. Patterson (Goodreads Author)',
  'Aaron Parrett (Introduction)',
  'Aaron Pocock (Illustrator)',
  'Aaron Pogue (Goodreads Author)',
  'Aaron Shaun Brennan',
  'Aaron Sowd (Illustrator)',
  'Aaron-Michael Hall (Goodreads Author)',
  'AbCraden (Narrator)',
  'AbJohnson',
  'AbMcDonald (Goodreads Author)',
  'Abbas Maroufi',
  'Abbas Milani',
  'Abbi Glines (Goodreads Author)',
  'Abd al-Rahman al-Kawakibi',
  "Abdul Mun'im Muhammad",
  'Abdul Rahman Munif',
  'Abdul-Jabbar Khan',
  'Abdurrahman Wahid',
  'Abeni Morris (Goodreads Author)',
  'Abhishek Kapoor (Goodreads Author)',
  'Abi Ketner (Goodreads Author)',
  'Abigail Barnette',
  'Abigail Gibbs (Goodreads Author)',
  'Abigail Haas (Pseudonym)',
  'Abigail Israel (Translator)',
  'Abigail Reynolds (Goodreads Author)',
  'Abigail Roux (Goodreads Author)',
  'Abigail Stone',
  'Abigail Thomas',
  'Abolqasem Ferdowsi',
  'Abra Ebner (Goodreads Author)',
  'Abraham Joshua Heschel',
  'Abraham Lincoln',
  ... 13543 more items
]
```

**4. Qual a distribuição de livros por género (genre) (quantos livros tem cada género)?**

```
db.livros.aggregate([
  { $unwind: "$genres" },
  { $group: { _id: "$genres", count: { $sum: 1 } } },
  { $sort: { _id: 1 } }
])
```

Res:

```
[
  { _id: '12th Century', count: 5 },
  { _id: '13th Century', count: 5 },
  { _id: '14th Century', count: 12 },
  { _id: '15th Century', count: 12 },
  { _id: '16th Century', count: 38 },
  { _id: '17th Century', count: 41 },
  { _id: '18th Century', count: 73 },
  { _id: '19th Century', count: 412 },
  { _id: '1st Grade', count: 6 },
  { _id: '20th Century', count: 985 },
  { _id: '21st Century', count: 79 },
  { _id: '2nd Grade', count: 12 },
  { _id: '40k', count: 6 },
  { _id: 'Abuse', count: 382 },
  { _id: 'Academia', count: 8 },
  { _id: 'Academic', count: 36 },
  { _id: 'Action', count: 531 },
  { _id: 'Activism', count: 6 },
  { _id: 'Adoption', count: 22 },
  { _id: 'Adult', count: 3927 }
]
```

**5. Quais os títulos dos livros e respetivos isbn, em ordem alfabética de título, em que um dos personagens (characters) é Sirius Black?**

```
db.livros.find(
  { characters: "Sirius Black" },
  { title: 1, isbn: 1, _id: 0 }
).sort({ title: 1 })
```

Res:

```
[
  {
    title: 'Harry Potter and the Deathly Hallows',
    isbn: '9780545010221'
  },
  {
    title: 'Harry Potter and the Goblet of Fire',
    isbn: '9999999999999'
  },
  {
    title: 'Harry Potter and the Order of the Phoenix',
    isbn: '9780439358071'
  },
  {
    title: 'Harry Potter and the Prisoner of Azkaban',
    isbn: '9780439655484'
  }
]
```

## 1.3 e 2

Para correr o programa tem de ter o docker container a executar.
Para o exercício 1.3, basta depois ir para à pasta apiLivros e dar `npm start`.
De seguida aceder à página web `https://localhost:17000/books`


Para o exercicío 2  tem de ter a api a funcionar e ir à pasta interfaceLivros e dar `npm start`.
De seguida aceder à página web `https://localhost:17001`

