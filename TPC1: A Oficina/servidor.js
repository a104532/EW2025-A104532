const http = require('http')
const axios = require('axios')

http.createServer((req, res) => {
    console.log("Method:" + req.method)
    console.log("URL:" + req.url)

    switch (req.method) {
        case "GET":
            if(req.url === "/"){
                res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
                res.write("<h1>Bem-vindo ao Sistema de Reparações</h1>")
                res.write("<ul>")
                res.write("<li><a href='/reparacoes'>Reparações</a></li>")
                res.write("<li><a href='/intervencoes'>Intervenções</a></li>")
                res.write("<li><a href='/viaturas'>Viaturas</a></li>")
                res.write("</ul>")
                res.end()
            } else if(req.url === "/reparacoes"){
                axios.get('http://localhost:3000/reparacoes?_sort=nif')
                    .then(response => {
                        var reparacoes = response.data;
                        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
                        res.write("<h1>Reparações</h1>")
                        res.write("<ul>")
                        reparacoes.forEach(reparacao => {
                            res.write(`<li><a href='/reparacoes/${reparacao.nif}'>${reparacao.nome}</a></li>`)
                        });
                        res.write("<ul>")
                        res.write("<a href='/'>Voltar</a>")
                        res.end()
                    })
                    .catch(error => {
                        res.writeHead(500, {'Content-Type': 'text/html;charset=utf-8'})
                        console.log(err)
                        res.end()
                    })
            } else if(req.url.match(/\/reparacoes\/.+/)){
                var nif = req.url.split("/")[2]
                axios.get(`http://localhost:3000/reparacoes?nif=${nif}`)
                    .then(result => {
                        var reparacao = result.data[0] // porque o resultado é uma lista
                        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8'})
                        res.write(`<h1>Detalhes da Reparação: ${reparacao.nome}</h1>`)
                        res.write(`<p><strong>NIF:</strong> ${reparacao.nif}</p>`);
                        res.write(`<p><strong>Data:</strong> ${reparacao.data}</p>`);
                        // Link para a viatura
                        res.write(`<h2>Veículo</h2>`);
                        res.write(`<p><strong>Marca:</strong> ${reparacao.viatura.marca}</p>`);
                        res.write(`<p><strong>Modelo:</strong> ${reparacao.viatura.modelo}</p>`);
                        res.write(`<p><strong>Matrícula:</strong> <a href='/viaturas/${reparacao.viatura.matricula}'>${reparacao.viatura.matricula}</a></p>`);

                        // Lista de Intervenções
                        res.write(`<h2>Intervenções (${reparacao.nr_intervencoes})</h2>`);
                        res.write(`<ul>`);
                        reparacao.intervencoes.forEach(intervencao => {
                            res.write(`<li>
                                <a href='/intervencoes/${intervencao.codigo}'>${intervencao.nome}</a>: ${intervencao.descricao}
                            </li>`);
                        });
                        res.write(`</ul>`);
                        res.write("<a href='/reparacoes'>Voltar</a>")
                        res.end()
                    })
                    .catch(err => {
                        res.writeHead(500, { 'Content-Type': 'text/html;charset=utf-8' })
                        console.log(err)
                        res.end()
                    })
            }else if (req.url === "/intervencoes") {
                axios.get('http://localhost:3000/intervencoes?_sort=codigo')
                    .then(result => {
                        var intervencoes = result.data;
                        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                        res.write("<h1>Intervenções</h1>")
                        res.write("<ul>")
                        intervencoes.forEach(intervencao => {
                            res.write(`<li><a href='/intervencoes/${intervencao.codigo}'>${intervencao.codigo}</a></li>`)
                        })
                        res.write("</ul>");
                        res.write("<a href='/'>Voltar</a>")
                        res.end()
                    })
                    .catch(err => {
                        res.writeHead(500, { 'Content-Type': 'text/html;charset=utf-8' })
                        console.log(err)
                        res.end()
                    })
            } else if(req.url.match(/\/intervencoes\/.+/)){
                var codigo = req.url.split("/")[2]
                axios.get(`http://localhost:3000/intervencoes?codigo=${codigo}`)
                    .then(result => {
                        var intervencao = result.data[0]
                        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8'})
                        res.write(`<h1>Detalhes da Intervenção: ${intervencao.nome}</h1>`)
                        res.write(`<p><strong>Código:</strong> ${intervencao.codigo}</p>`);
                        res.write(`<p><strong>Nome:</strong> ${intervencao.nome}</p>`);
                        res.write(`<p><strong>Descrição:</strong> ${intervencao.descricao}</p>`);
                        //res.write(`<pre>${JSON.stringify(intervencao, null, 2)}</pre>`)
                        res.write("<a href='/intervencoes'>Voltar</a>")
                        res.end()
                    })
                    .catch(err => {
                        res.writeHead(500, { 'Content-Type': 'text/html;charset=utf-8' })
                        console.log(err)
                        res.end()
                    })
                 } else if (req.url === "/viaturas") {
                axios.get('http://localhost:3000/viaturas?_sort=matricula')
                    .then(result => {
                        var viaturas = result.data
                        var contagemMarcas = {}
                        viaturas.forEach(viatura => {
                            if (contagemMarcas[viatura.marca]) {
                                contagemMarcas[viatura.marca]++
                            } else {
                                contagemMarcas[viatura.marca] = 1
                            }
                        })
                        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                        res.write("<h1>Viaturas</h1>")
                        res.write("<h2>Contagem por Marca</h2>")
                        res.write("<ul>")
                        for (const [marca, count] of Object.entries(contagemMarcas)) {
                            res.write(`<li>${marca}: ${count}</li>`)
                        }
                        res.write("</ul>")
                        res.write("<h2>Lista de Viaturas</h2>")
                        res.write("<ul>")
                        viaturas.forEach(viatura => {
                            res.write(`<li><a href='/viaturas/${viatura.matricula}'>${viatura.matricula}</a></li>`)
                        })
                        res.write("</ul>")
                        res.write("<a href='/'>Voltar</a>")
                        res.end()
                    })
                    .catch(err => {
                        res.writeHead(500, { 'Content-Type': 'text/html;charset=utf-8' })
                        console.log(err)
                        res.end()
                    })
                } else if(req.url.match(/\/viaturas\/.+/)){
                    var matricula = req.url.split("/")[2]
                    axios.get(`http://localhost:3000/viaturas?matricula=${matricula}`)
                        .then(result => {
                            var viatura = result.data[0]
                            res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8'})
                            res.write(`<h1>Detalhes da Viatura ${viatura.matricula}</h1>`)
                            res.write(`<p><strong>Marca:</strong> ${viatura.marca}</p>`);
                            res.write(`<p><strong>Modelo:</strong> ${viatura.modelo}</p>`);
                            res.write(`<p><strong>Matrícula:</strong> ${viatura.matricula}</p>`);
                            //res.write(`<pre>${JSON.stringify(viatura, null, 2)}</pre>`)
                            res.write("<a href='/viaturas'>Voltar</a>")
                            res.end()
                        })
                        .catch(err => {
                            res.writeHead(500, { 'Content-Type': 'text/html;charset=utf-8' })
                            console.log(err)
                            res.end()
                        })
                }else {
                    res.writeHead(404, { 'Content-Type': 'text/html;charset=utf-8' })
                    res.write("<h1>Página não encontrada</h1>")
                    res.end()
                }
            break;
        default:
            res.writeHead(405, { 'Content-Type': 'text/html;charset=utf-8' })
            res.end()
            break;
    }

    
}).listen(3001)

console.log("Servidor à escuta na porta 3001")