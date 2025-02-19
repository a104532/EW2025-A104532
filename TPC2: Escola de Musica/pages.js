// mypages.js
// 2025-02-17 by jcr
// HTML templates generating functions

export function genMainPage(data){
    var pagHTML = `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8"/>
            <title>Escola de Música</title>
            <link rel="stylesheet" type="text/css" href="w3.css"/>
        </head>
        <body>
            <div class="w3-card-4">
                <header class="w3-container w3-pale-green">
                    <h1>Consultas</h1>
                </header>

                <div class="w3-container">
                    <ul class="w3-ul">
                        <li>
                            <a href="/alunos">Lista Alunos</a>
                        </li>
                        <li>
                            <a href="/cursos">Lista Cursos</a>
                        </li>
                        <li>
                            <a href="/instrumentos">Lista Instrumentos</a>
                        </li>
                    </ul>
                </div>
                
                <footer class="w3-container w3-pale-green">
                    <h5>Generated in EngWeb2025 ${data}</h5>
                </footer>
            </div>
        </body>
    </html>
    `
    return pagHTML
}

export function genAlunoPage(lalunos, marca, data){
    var pagHTML = `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8"/>
            <title>Escola Música</title>
            <link rel="stylesheet" type="text/css" href="w3.css"/>
        </head>
        <body>
            <div class="w3-card-4">
                <header class="w3-container w3-pale-blue">
                    <h1>Lista de Alunos</h1>
                </header>

                <div class="w3-container">
                    <table class="w3-table-all">
                        <tr>
                            <th>Id</th>
                            <th>Nome</th>
                            <th>Data Nascimento</th>
                            <th>Curso</th>
                            <th>Ano Curso</th>
                            <th>Instrumento</th>
                        </tr>`
    lalunos.forEach(aluno => {
        pagHTML += `
        <tr>
            
            <td>${aluno.id}</td>
            <td><a href="/alunos/${aluno.id}">${aluno.nome}</a></td>
            <td>${aluno.dataNasc}</td>
            <td>${aluno.curso}</td>
            <td>${aluno.anoCurso}</td>
            <td>${aluno.instrumento}</td>
        </tr>
        `
    });

    pagHTML += `  
                    </table>
                </div>

                <div class="w3-container w3-margin-top">
                    <a href="/" class="w3-button w3-light-grey w3-border">
                        Voltar à Página Principal
                    </a>
                </div>
                
                <footer class="w3-container w3-pale-blue">
                    <h5>Generated in EngWeb2025 ${data}</h5>
                </footer>
            </div>
        </body>
    </html>
    `
    return pagHTML
}

export function genCursoPage(lcursos, data){
    var pagHTML = `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8"/>
            <title>Escola Música</title>
            <link rel="stylesheet" type="text/css" href="w3.css"/>
        </head>
        <body>
            <div class="w3-card-4">
                <header class="w3-container w3-pale-yellow">
                    <h1>Lista de Cursos</h1>
                </header>

                <div class="w3-container">
                    <table class="w3-table-all">
                        <tr>
                            <th>Id</th>
                            <th>Designação</th>
                            <th>Duração</th>
                            <th>Instrumento</th>
                        </tr>`
    lcursos.forEach(curso => {
        pagHTML += `
        <tr>
            <td>${curso.id}</td>
            <td><a href="/cursos/${curso.id}">${curso.designacao}</a></td>
            <td>${curso.duracao}</td>
            <td>${curso.instrumento['#text']}</td>
        </tr>
        `
    });

    pagHTML += `  
                    </table>
                </div>

                <div class="w3-container w3-margin-top">
                    <a href="/" class="w3-button w3-light-grey w3-border">
                        Voltar à Página Principal
                    </a>
                </div>
                
                <footer class="w3-container w3-pale-yellow">
                    <h5>Generated in EngWeb2025 ${data}</h5>
                </footer>
            </div>
        </body>
    </html>
    `
    return pagHTML
}


export function genInstPage(linstrumentos, data){
    var pagHTML = `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8"/>
            <title>Escola de Música</title>
            <link rel="stylesheet" type="text/css" href="w3.css"/>
        </head>
        <body>
            <div class="w3-card-4">
                <header class="w3-container w3-pale-red">
                    <h1>Lista de Instrumentos</h1>
                </header>

                <div class="w3-container">
                    <table class="w3-table-all">
                        <tr>
                            <th>Id</th>
                            <th>Nome</th>
                        </tr>`
    linstrumentos.forEach(instrumento => {
        pagHTML += `
        <tr>
            <td>${instrumento.id}</td>
            <td><a href="/instrumentos/${instrumento.id}">${instrumento["#text"]}</a></td>
        </tr>
        `
        });

    pagHTML += `  
                    </table>
                </div>

                <div class="w3-container w3-margin-top">
                    <a href="/" class="w3-button w3-light-grey w3-border">
                        Voltar à Página Principal
                    </a>
                </div>
                
                <footer class="w3-container w3-pale-red">
                    <h5>Generated in EngWeb2025 ${data}</h5>
                </footer>
            </div>
        </body>
    </html>
    `
    return pagHTML
}


export function genAlunoDetalhePage(aluno, data) {
    var pagHTML = `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8"/>
            <title>Escola de Música - ${aluno.nome}</title>
            <link rel="stylesheet" type="text/css" href="w3.css"/>
        </head>
        <body>
            <div class="w3-card-4">
                <header class="w3-container w3-pale-blue">
                    <h1>Detalhes do Aluno - ${aluno.nome}</h1>
                </header>

                <div class="w3-container">
                    <p><b>ID:</b> ${aluno.id}</p>
                    <p><b>Nome:</b> ${aluno.nome}</p>
                    <p><b>Data de Nascimento:</b> ${aluno.dataNasc}</p>
                    <p><b>Curso:</b> ${aluno.curso}</p>
                    <p><b>Ano do Curso:</b> ${aluno.anoCurso}</p>
                    <p><b>Instrumento:</b> ${aluno.instrumento}</p>
                </div>

                <div class="w3-container w3-margin-top">
                    <a href="/alunos" class="w3-button w3-light-grey w3-border">
                        Voltar aos Alunos
                    </a>
                </div>

                <footer class="w3-container w3-pale-blue">
                    <h5>Generated in EngWeb2025 ${data}</h5>
                </footer>
            </div>
        </body>
    </html>
    `
    return pagHTML
}

export function genCursoDetalhePage(lalunos,curso, data) {
    var pagHTML = `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8"/>
            <title>Escola de Música</title>
            <link rel="stylesheet" type="text/css" href="w3.css"/>
        </head>
        <body>
            <div class="w3-card-4">
                <header class="w3-container w3-pale-yellow">
                    <h1>Lista de Alunos do Curso - ${curso.designacao}</h1>
                </header>

                 <div class="w3-container">
                    <p><b>ID:</b> ${curso.id}</p>
                    <p><b>Designação:</b> ${curso.designacao}</p>
                    <p><b>Duração:</b> ${curso.duracao}</p>
                 </div>

                <div class="w3-container">
                    <table class="w3-table-all">
                        <tr>
                            <th>Id</th>
                            <th>Aluno</th>
                            <th>Data Nascimento</th>
                            <th>Curso</th>
                            <th>Ano</th>
                            <th>Instrumento</th>
                        </tr>`
    lalunos.forEach(aluno => {
            pagHTML += `
            <tr>
                <td>${aluno.id}</td>
                <td>${aluno.nome}</td>
                <td>${aluno.dataNasc}</td>
                <td>${aluno.curso}</td>
                <td>${aluno.anoCurso}</td>
                <td>${aluno.instrumento}</td>
             </tr>`
     })

    pagHTML += `  
                    </table>
                </div>

                <div class="w3-container w3-margin-top">
                    <a href="/cursos" class="w3-button w3-light-grey w3-border">
                        Voltar aos Cursos
                    </a>
                </div>
                
                <footer class="w3-container w3-pale-yellow">
                    <h5>Generated in EngWeb2025 ${data}</h5>
                </footer>
            </div>
        </body>
    </html>
    `
    return pagHTML
}

export function genInstrDetalhePage(lalunos, inst,data) {
    var pagHTML = `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8"/>
            <title>Escola de Música</title>
            <link rel="stylesheet" type="text/css" href="w3.css"/>
        </head>
        <body>
            <div class="w3-card-4">
                <header class="w3-container w3-pale-red">
                    <h1>Lista de Alunos que tocam ${inst['#text']}</h1>
                </header>

                <div class="w3-container">
                    <p><b>ID:</b> ${inst.id}</p>
                    <p><b>Instrumento:</b> ${inst['#text']}</p>
                 </div>

                <div class="w3-container">
                    <table class="w3-table-all">
                        <tr>
                            <th>Id</th>
                            <th>Aluno</th>
                            <th>Data Nascimento</th>
                            <th>Curso</th>
                            <th>Ano</th>
                            <th>Instrumento</th>
                        </tr>`
    lalunos.forEach(aluno => {
            pagHTML += `
            <tr>
                <td>${aluno.id}</td>
                <td>${aluno.nome}</td>
                <td>${aluno.dataNasc}</td>
                <td>${aluno.curso}</td>
                <td>${aluno.anoCurso}</td>
                <td>${aluno.instrumento}</td>
             </tr>`
     })

    pagHTML += `  
                    </table>
                </div>

                <div class="w3-container w3-margin-top">
                    <a href="/instrumentos" class="w3-button w3-light-grey w3-border">
                        Voltar aos Instrumentos
                    </a>
                </div>
                
                <footer class="w3-container w3-pale-red">
                    <h5>Generated in EngWeb2025 ${data}</h5>
                </footer>
            </div>
        </body>
    </html>
    `
    return pagHTML
}
