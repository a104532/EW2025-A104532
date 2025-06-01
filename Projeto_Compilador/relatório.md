# Projeto Final - Engenharia Web 2025

## 1. Resumo

Este projeto consiste numa aplicação web desenvolvida no âmbito da unidade curricular de Engenharia Web. O objetivo é permitir a organização, preservação e disseminação do "eu digital" dos utilizadores, através da submissão de recursos pessoais (textos, imagens, vídeos, etc.) organizados cronologicamente e semanticamente.

## 2. Domínio da Aplicação

A aplicação simula um **Diário Digital**, que representa o repositório de memórias e acontecimentos relevantes para cada utilizador.

### Tipos de recursos registáveis:

- Fotografias
- Textos (crónicas, reflexões)
- Eventos (académicos, desportivos, culturais)
- Ficheiros multimédia
- Comentários

## 3. Atores

- **Produtor**: Submete conteúdos para o diário.
- **Administrador**: Gere os utilizadores, conteúdos e sistema.
- **Consumidor**: Pode visualizar conteúdos públicos.

## 4. Megaprocessos

### 4.1 Ingestão

- Envio de um SIP (Submission Information Package) no formato `.zip`, contendo:
  - `manifesto-SIP.json`
  - Ficheiros de conteúdo
- Validação do SIP:
  - Verifica se o manifesto existe
  - Verifica se os ficheiros referenciados existem
- Armazenamento:
  - O **manifesto é enviado para a base de dados MongoDB**
  - Os **ficheiros são guardados no diretório `/uploads/items`**
- Após ingestão, o SIP transforma-se num AIP (Archival Information Package)

### 4.2 Administração

A interface de administração é responsável pela gestão completa do sistema e dos seus conteúdos. Está acessível apenas a utilizadores autenticados com permissões de administrador. Envolve a gestão de utilizadores, recursos (AIPs), notícias e estatísticas.

#### Funcionalidades principais:

- **Gestão de Utilizadores**
  - Registar novos utilizadores (nome, email, perfil, etc.)
  - Editar informação de utilizadores existentes
  - Remover utilizadores
  - Listar todos os utilizadores registados

- **Gestão de Recursos (AIPs)**
  - Visualizar lista de AIPs armazenados
  - Editar metainformação de um recurso
  - Remover AIPs individualmente ou em lote
  - Exportar um AIP como DIP (ZIP com manifesto e ficheiros)
  - Alterar visibilidade de um item (público ↔ privado)
  - Associar classificações (tags da taxonomia definida)
  - Adicionar comentários aos itens para contextualização

- **Gestão de Notícias**
  - Criar novas notícias a serem exibidas na página inicial do frontoffice
  - Editar o conteúdo das notícias existentes
  - Tornar uma notícia visível ou invisível

- **Estatísticas e Monitorização**
  - Processamento de logs (armazenados em ficheiro e acessíveis via interface)
  - Indicadores exibidos:
    - Número total de visitas
    - Downloads por item
    - Itens mais visualizados
    - Datas de maior tráfego
    - IPs de origem (opcional)
  - Logs devem estar disponíveis para:
    - Consulta direta no backoffice
    - Exportação para ficheiro estruturado (JSON ou CSV)

#### Regras de Acesso:

- Apenas utilizadores autenticados como administradores têm acesso a esta área
- Cada ação está protegida por middleware de autenticação e autorização

#### Considerações Técnicas:

- A interface deverá consumir a API principal (REST) para realizar todas as operações
- Operações críticas (eliminação de dados, alteração de visibilidade) devem ser confirmadas via modal/caixa de diálogo
- Todas as ações administrativas devem gerar logs com timestamp, ID do admin e operação executada

### 4.3 Disseminação

- Geração de DIPs (Dissemination Information Packages)
- O processo é **exatamente o inverso do SIP**:
  - Dados são lidos da base de dados (manifesto)
  - Ficheiros são obtidos de `/uploads/items`
  - Um novo ZIP é gerado com estrutura semelhante ao SIP
- Disponibilização pública via exportação em formato ZIP


## 5. Estrutura do Projeto

### `/apiDados`

- **auth/** – Módulo de autenticação (local, Google)
- **bin/** – Inicialização do servidor
- **controllers/** – Lógica de cada entidade
- **models/** – Modelos de dados Mongoose
- **routes/** – Definição de rotas da API
- **uploads/** – Ficheiros armazenados
- **teste-sip/** – Exemplos de pacotes SIP
- `app.js` – App Express principal
- `.env` – Variáveis de ambiente
- `package.json` – Dependências do backend

### `/UI`

- **bin/** – Arranque do frontend
- **routes/** – Páginas da interface
- **views/** – Templates do frontend
- **public/** – Recursos estáticos (JS, CSS, imagens)
- `app.js` – Aplicação Express para UI
- `package.json` – Dependências do frontend

### `/DBs`

- `items.json` – Itens registados
- `files.json` – Metadados dos ficheiros
- `comments.json` – Comentários
- `logs.json` – Registo de logs
- `users.json` – Utilizadores

## 6. Estrutura do SIP (Submission Information Package)

```json
{
  "nome": "Meu Primeiro SIP",
  "tipoItem": "Educação",
  "descricao": "Exemplo de upload SIP",
  "publico": false,
  "dataCriacao": "2023-01-01",
  "ficheiros": [
    {"caminho": "documento.pdf"}
  ]
}
```

## 7. Modelo de Dados (MongoDB)

A aplicação utiliza modelos mongoose para estruturar os dados no MongoDB, conforme descrito a seguir:

### Coleções:

- **Users**: Utilizadores da plataforma
- **Items**: Recursos registados
- **Files**: Metadados e caminhos para ficheiros
- **Comments**: Comentários de utilizadores
- **Logs**: Operações registadas para controlo

### Users (Utilizadores)

- **_id** (String): Identificador único, utilizado como username.
- **email** (String): Email único do utilizador, validado por regex.
- **auth**: Método de autenticação (`local`, `google`).
- **socialProfiles**: URLs para perfis sociais (Strava, Twitter, Instagram).
- **role**: Perfil do utilizador, com três tipos: `admin`, `produtor`, `consumidor`.
- Utiliza `passport-local-mongoose` para gerir autenticação local e integração OAuth.
- Middleware que gera username a partir do email antes de salvar.

### Items (Recursos)

- **_id** (String): ID único gerado com `uuidv4()`.
- **nome** (String): Nome do recurso.
- **dataCriacao** (Date): Data da criação do recurso (obrigatório).
- **dataSubmissao** (Date): Data de submissão, padrão para data atual.
- **tipoItem** (String): Categoria do recurso, com valores predefinidos (`Desporto`, `Cultura`, `Saúde`, `Educação`, `Tecnologia`, `Ciência`).
- **descricaoItem** (String): Descrição do recurso.
- **ficheiros** (Array): Lista de IDs referenciando documentos do modelo `Files`.
- **produtor** (String): Referência ao utilizador que submeteu o recurso.
- **publico** (Boolean): Define se o recurso é público ou privado.
- **comentarios** (Array): Lista de IDs referenciando documentos do modelo `Comments`.

### Files (Ficheiros)

- **_id** (String): Identificador único do ficheiro.
- **tipoFich** (String): Tipo do ficheiro (`video`, `imagem`, `documento`).
- **caminho** (String): Caminho no servidor onde o ficheiro está armazenado.
- **tamanho** (Number): Tamanho do ficheiro em bytes.
- **item** (String): Referência ao recurso (Item) associado.

### Comments (Comentários)

- **_id** (ObjectId): Identificador único.
- **texto** (String): Texto do comentário (obrigatório).
- **autor** (String): Referência ao utilizador que fez o comentário.
- **dataCriacao** (Date): Data de criação do comentário.
- **item** (String): Referência ao recurso comentado.
- Timestamps automáticos (`createdAt` e `updatedAt`).

### Logs (Registos)

- **message** (String): Mensagem do log (obrigatório).
- **level** (String): Tipo do log (`info`, `news`, `download`, `view`).
- **timestamp** (Date): Data e hora do evento.
- **publico** (Boolean): Indica se o log é público.

## 8. Interface Pública

- Linha cronológica dos conteúdos
- Filtros por data, tipo e classificadores
- Área de detalhes para cada item
- Comentários
- Download em formato ZIP
- Pesquisa textual

## 9. Interface de Administração

- Painel de gestão para:
  - Criar/remover utilizadores
  - Eliminar ou editar itens
  - Consultar logs e estatísticas
  - Gerir classificadores
  - Criar notícias públicas

## 10. Classificadores

Permitem a organização temática dos recursos:

- Video
- Imagem
- Documento

- Desporto
- Cultura
- Saúde
- Educação
- Tecnologia
- Ciência

Podem ser combinados entre si para facilitar a pesquisa e o agrupamento.

## 11. Logs e Estatísticas

- Ações registadas em `logs.json`
- Consultáveis via backoffice
- Permitem análise do uso da aplicação

## 12. Segurança

- Autenticação com Passport.js
- Estratégias:
  - Username/password
  - Google OAuth
- Tokens de sessão
- Proteção de rotas por middleware

## 13. Exportação / Importação

- **SIP (Importação)**:
  - ZIP submetido pelo produtor
  - Manifesto inserido na **base de dados**
  - Ficheiros copiados para **`/uploads/items`**
- **DIP (Exportação)**:
  - Dados são lidos da base de dados
  - Ficheiros extraídos de `/uploads/items`
  - ZIP gerado com estrutura idêntica ao SIP


## 14. Tecnologias Utilizadas

- **Node.js** + Express
- **MongoDB** + Mongoose
- **Passport.js**
- **Pug** (views)
- **Bootstrap / CSS3**
- **JavaScript**
- **Docker / Docker Compose**

## 15. Considerações Finais

Este projeto cumpre os objetivos propostos, fornecendo uma solução modular, segura e escalável para registo e gestão do "eu digital". A arquitetura permite fácil extensão e integração com outros serviços e garante a preservação e disseminação estruturada de conteúdos multimédia e textuais.
