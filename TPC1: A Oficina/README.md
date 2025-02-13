# **EW2025 - TPC1**

## **Data:** 13/02/2025 

## **Autor:** Tomás Sousa Barbosa - a104532

---
## **Problema proposto**

 ### Construir um serviço em nodejs onde: 

1. Consuma a API de dados servida pelo json-server da oficina de reparações
2. Responda com as páginas web do site.


---
## **Implementação**

Inicialmente comecei por criar um script em python (gerador.py) que fosse capaz de dividir os dados do json separadamente em Reparações, Intervenções, e Viaturas, de modo a ter uma melhor manipulação dos dados, gerando um **new_dataset.son**

Agora com os dados separados, foi implementado um servidor.js que lê os dados da API e começa por gerar uma página geral com Reparações, Intervenções e Viaturas, com apontadores para outra página com a lista ordenada alfabéticamente ou por ordem crescente, das listas dos respetivos dados.

Ao selecionar uma reparação específica, contem os apontadores para as páginas da viatura especifica (através das matrículas) e para a página da intervenção especifica (através do nome da intervenção)

Para além disso também é possivél voltar na página atrás selecionando a opção "Voltar"


---
## **Ficheiros Utilizados**

- [`gerador.py`](https://github.com/a104532/PL2025-A104532/blob/main/TPC1/somador_onoff.py) → Script para organizar o dataset

- [`servidor.js`](https://github.com/a104532/PL2025-A104532/blob/main/TPC1/somador_onoff.py) → Implementação do servidor