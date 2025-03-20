# **EW2025 - TPC5**

## **Data:** 18/03/2025 

## **Autor:** Tomás Sousa Barbosa - a104532


## **Problema proposto**

 ### App Web com 3 servidores

1. MongoDB com a base de dados (aquela que for trabalhada nas aulas práticas);
2. API de dados feita em JS usando o mongoose;
3. Interface web gerada com o express e usando templates PUG (apenas operações CRUD).



## **Implementação**

Utilizei o MongoDB para armazenar os dados dos alunos conforme trabalhado nas aulas práticas.
No diretoria models, criei o alunoModel.js utilizando Mongoose para definir o esquema:
```
var mongoose = require("mongoose")

var alunosSchema = new mongoose.Schema({
    _id : String,
    nome : String,
    gitlink : String,
    tpc1 : Boolean,
    tpc2 : Boolean,
    tpc3 : Boolean,
    tpc4 : Boolean,
    tpc5 : Boolean,
    tpc6 : Boolean,
    tpc7 : Boolean,
    tpc8 : Boolean,
    teste : Number,
    pratica : Number
}, {versionKey: false})

module.exports = mongoose.model('alunos', alunosSchema)
```
Na diretoria controllers, implementei o alunoController.js para gerenciar as operações CRUD. De resto foi reutilizado o código tanto feito nas aulas práticas como em tpcs anteriores.

## **Execução**

- Ligar o servidor através do docker

- Executar o servidor: `npm start`