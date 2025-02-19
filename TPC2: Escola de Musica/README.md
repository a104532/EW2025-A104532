# **EW2025 - TPC2**

## **Data:** 19/02/2025 

## **Autor:** Tomás Sousa Barbosa - a104532


## **Problema proposto**

 ### Construir um serviço em nodejs, que consuma a API de dados servida pelo json-server da escola de música e sirva um website com as seguintes caraterísticas:

1. Página principal: Listar alunos, Listar Cursos, Listar Instrumentos;
2. Página de alunos: Tabela com a informação dos alunos (clicando numa linha deve saltar-se para a página de aluno);
3. Página de cursos: Tabela com a informação dos cursos (clicando numa linha deve saltar-se para a página do curso onde deverá aparecer a lista de alunos a frequentá-lo);
4. Página de instrumentos: Tabela com a informação dos instrumentos (clicando numa linha deve saltar-se para a página do instrumento onde deverá aparecer a lista de alunos que o tocam).



## **Implementação**

ara a implementação deste projeto, foi criado um servidor em Node.js (escola-server.js), responsável por servir as páginas do website, e um ficheiro (pages.js), que contém as funções responsáveis por gerar e enviar o HTML para as páginas do site.

O programa disponibiliza páginas para alunos, cursos e instrumentos, cada uma com um funcionamento específico:

- Página de Aluno: O servidor extrai o ID do aluno a partir da URL e faz um pedido à API para obter os seus dados. A página apresenta apenas as informações individuais desse aluno.

- Página de Curso: Primeiro, o servidor obtém os dados do curso através do seu ID. Em seguida, realiza um novo pedido à API para obter a lista de alunos inscritos nesse curso. A obtenção dos dados do curso é essencial, pois são passados para a função `genCursoDetalhePage(lalunos, curso, d)`, que gera a página HTML, permitindo visualizar tanto as informações do curso como a lista de alunos inscritos.

- Página de Instrumento: O funcionamento é semelhante ao dos cursos. Primeiro, obtêm-se os dados do instrumento e, posteriormente, a lista de alunos que o tocam. Neste caso, a pesquisa é feita com base na designação do instrumento, e não no seu ID, uma vez que, na base de dados dos alunos, os instrumentos são identificados pelo nome.

## **Ficheiros Utilizados**

- [`escola-server.js`](https://github.com/a104532/EW2025-A104532/blob/main/TPC1%3A%20A%20Oficina/gerador.py) → Implementação do servidor

- [`pages.js`](https://github.com/a104532/EW2025-A104532/blob/main/TPC1%3A%20A%20Oficina/servidor.js) → Páginas HTML do programa

- [`db.json`](https://github.com/a104532/EW2025-A104532/blob/main/TPC1%3A%20A%20Oficina/new_dataset.json) → Dataset Utilizado