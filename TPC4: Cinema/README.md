# **EW2025 - TPC4**

## **Data:** 11/03/2025 

## **Autor:** Tomás Sousa Barbosa - a104532


## **Problema proposto**

 ### O Problema tinha o objetivo de desenvolver uma rest API a um ficheiro json de um cinema onde :

 O programa é capaz de 

 - Mostrar a lista de filmes 
 - Mostrar a pagina de um ator com os filmes onde participou
 - Editar um filme
 - Eliminar um filme



## **Implementação**

Para a implementação destre programa, comecei por formatar o novo json através do `jsonRepair.py` que atribuia um id para cada filme e para cada ator, associa a lista dos filmes na qual o mesmo participou, colocando num json chamado `cinema_new.json`. De seguida de acordo com a aula teórica e a aula prática, criou-se as páginas .pug para o pedido, e nos routes criou-se um `filmes.js` de modo a fazer as operações get, post, put e delete de modo a obter o resultado pretendido. 

## **Execução**

- Obter o novo ficheiro JSON: `python3 jsonRepair.py`

- Gerar a API de dados: `json-server -w cinema_new.json`

- Executar o servidor: `npm start`