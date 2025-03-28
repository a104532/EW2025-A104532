# **EW2025 - TPC6**

## **Data:** 24/03/2025 

## **Autor:** Tomás Sousa Barbosa - a104532


## **Problema proposto**

 ### Resolução dos exercicios da ficha da Semana 7


## **Implementação**

Para a resolução desta ficha, foram feitas as seguintes implementações:
1. Converter o `contratos2024.csv` para um json `contratos2024.json` , onde o precoContratual contenha o número com `.`em vez de `,`. 
2. Foi criada uma api de dados na porta `16000` com as operações CRUD (GET, POST, PUT e DELETE) de acordo com o pedido.
3. Foi criada uma interface na porta `16001` ligada à api de dados de modo de modo a obter as páginas dos contratos, de um contrato e das entidades.

## **Execução**

- Ligar o servidor através do docker

- Executar a api de dados: `npm start`
  
- Executar a interface: `npm start`