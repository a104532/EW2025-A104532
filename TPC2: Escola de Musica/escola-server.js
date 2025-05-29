import { createServer } from 'http'
import axios from 'axios';
import { genMainPage, genAlunoPage, genCursoPage, genInstPage, genAlunoDetalhePage, genCursoDetalhePage, genInstrDetalhePage} from './pages.js'
import { readFile } from 'fs'
import { decode } from 'punycode';

createServer(function (req, res) {
    var d = new Date().toISOString().substring(0, 16)
    console.log(req.method + " " + req.url + " " + d)

    if(req.url == '/'){
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
        res.write(genMainPage(d))
        res.end()  
    }
    else if(req.url == '/alunos'){
        axios.get('http://localhost:3000/alunos')
            .then(function(resp){
                var alunos = resp.data
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                res.write(genAlunoPage(alunos,null, d))
                res.end()
            })
            .catch(erro => {
                console.log("Erro: " + erro)
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                res.end('<p>Erro na obtenção de dados dos alunos: ' + erro + '</p>')
            })
    } 
    else if(req.url == '/cursos'){
        axios.get('http://localhost:3000/cursos')
            .then(function(resp){
                var curso = resp.data
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                res.write(genCursoPage(curso, d))
                res.end()
            })
            .catch(erro => {
                console.log("Erro: " + erro)
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                res.end('<p>Erro na obtenção de dados dos cursos: ' + erro + '</p>')
            })
    } 
    else if(req.url == '/instrumentos'){
        axios.get('http://localhost:3000/instrumentos')
            .then(function(resp){
                var inst = resp.data
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                res.write(genInstPage(inst, d))
                res.end()
            })
            .catch(erro => {
                console.log("Erro: " + erro)
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                res.end('<p>Erro na obtenção de dados dos instrumentos: ' + erro + '</p>')
            })
    } 
    else if(req.url.match(/\/alunos\/A[0-9]+$/)){
        var id = req.url.split("/")[2]
        axios.get(`http://localhost:3000/alunos/${id}`)
            .then(function(resp){
                var aluno = resp.data
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                res.write(genAlunoDetalhePage(aluno, d))
                res.end()
            })
            .catch(erro => {
                console.log("Erro: " + erro)
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                res.end('<p>Erro na obtenção de dados do aluno: ' + erro + '</p>')
            })
    } 
    else if(req.url.match(/\/cursos\/[A-Z]+\d+$/)){
        var id = req.url.split("/")[2]
        axios.get(`http://localhost:3000/cursos/${id}`)
            .then(function(resp){
            var curso = resp.data
            axios.get(`http://localhost:3000/alunos?curso=${id}`)
            .then(function(resp){
                var lalunos = resp.data
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                res.write(genCursoDetalhePage(lalunos,curso, d))
                res.end()
            })
            .catch(erro => {
                console.log("Erro: " + erro)
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                res.end('<p>Erro na obtenção de dados dos alunos: ' + erro + '</p>')
            })
        }).catch(erro => {
            console.log("Erro: " + erro)
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.end('<p>Erro na obtenção de dados do curso: ' + erro + '</p>')
        })
        
    } 
    else if(req.url.match(/\/instrumentos\/I\d+$/)){
        var inst = req.url.split("/")[2]   
        axios.get(`http://localhost:3000/instrumentos/${inst}`)
            .then(function(resp){
            var instrumento = resp.data
            axios.get(`http://localhost:3000/alunos?instrumento=${instrumento['#text']}`)
                .then(function(resp){
                    var lalunos = resp.data
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                    res.write(genInstrDetalhePage(lalunos,instrumento, d))
                    res.end()
                })
                .catch(erro => {
                    console.log("Erro: " + erro)
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                    res.end('<p>Erro na obtenção de dados dos alunos: ' + erro + '</p>')
                })
        }).catch(erro => {
            console.log("Erro: " + erro)
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.end('<p>Erro na obtenção de dados do  instrumento: ' + erro + '</p>')
        })
    } 
    else if(req.url.match(/w3\.css$/)){
        readFile("w3.css", function(erro, dados){
            if(erro){
                res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'})
                res.end('<p>Erro na leitura do ficheiro: ' + erro + '</p>')
            }
            else{
                res.writeHead(200, {'Content-Type': 'text/css'})
                res.end(dados)
            }
        })
    }
    else{
        res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'})
        res.end('<p>Operação não suportada: ' + req.url + '</p>')
    }
}).listen(7777)

console.log('Servidor à escuta na porta 7777...')

