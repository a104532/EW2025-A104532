# **EW2025 - TPC3**

## **Data:** 25/02/2025 

## **Autor:** Tomás Sousa Barbosa - a104532


## **Problema proposto**

 ### Continuação da aula prática 4:

1. Página principal: Lista dos alunos com o seu nome, link do github e duas opções, uma para editar e outra para eliminar
2. Página do aluno: Informação do aluno com o seu id, nome e link do github
3. O botão para editar permite ao utilizador editar a informação sobre um aluno, como os TPCs resolvidos.
4. O botão para eliminar remove o aluno do json.



## **Implementação**

Para a implementação destre programa foi reaproveitado o que se fez na aula 4. Primeiro foi necessário converter o `alunos.csv` para json com os parametros id, nome e git através de um site conversor.
De seguida foi necessário mudar nas `templates.js` de forma a conseguir voltar atrás nas páginas de confirmação de um dado alterado, inserido ou removido como também os botões para realizar as operações de editar e remover um aluno.

## **Ficheiros Utilizados**

- [`alunos_server_skeleton.js`](https://github.com/a104532/EW2025-A104532/blob/main/TPC2%3A%20Escola%20de%20Musica/escola-server.js) → Implementação do servidor

- [`templates.js`](https://github.com/a104532/EW2025-A104532/blob/main/TPC2%3A%20Escola%20de%20Musica/pages.js) → Templates das páginas utilizadas

- [`alunos.json`](https://github.com/a104532/EW2025-A104532/blob/main/TPC2%3A%20Escola%20de%20Musica/db.json) → Dataset Utilizado