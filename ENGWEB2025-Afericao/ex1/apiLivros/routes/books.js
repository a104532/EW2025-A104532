var express = require('express');
var router = express.Router();
var Book = require('../controllers/book');

/* GET Books. */
router.get('/', function(req, res, next) {
  if(req.query.charater) {
    Book.getBooksByCharater(req.query.charater)
      .then(dados => res.jsonp(dados)) //default status 200
      .catch(erro => res.status(500).jsonp(erro));
  }
  else if(req.query.genre){
    Book.getBooksByGenre(req.query.genre)
      .then(dados => res.jsonp(dados)) //default status 200
      .catch(erro => res.status(500).jsonp(erro));
  }
  else{
    Book.getBooks()
      .then(dados => res.jsonp(dados)) //default status 200
      .catch(erro => res.status(500).jsonp(erro));
  }
});

//GET _ por ordem alfabetica
router.get('/characters', function(req, res, next) {
  Book.getCharacters()
    .then(dados => res.jsonp(dados)) 
    .catch(erro => res.status(500).jsonp(erro));
});

//GET _ por ordem alfabetica
router.get('/genres', function(req, res, next) {
  Book.getGenres()
    .then(dados => res.jsonp(dados)) 
    .catch(erro => res.status(500).jsonp(erro));
});

//GET _ by id
router.get('/:id', function(req, res, next) {
  Book.getBookById(req.params.id)
    .then(dados => res.jsonp(dados)) 
    .catch(erro => res.status(500).jsonp(erro));
});


//POST inserir novo
router.post('/', function(req, res, next) {
  Book.insert(req.body)
    .then(dados => res.status(201).jsonp(dados)) 
    .catch(erro => res.status(500).jsonp(erro));
});

//PUT atualizar info
router.put('/:id', function(req, res, next) {
  Book.update(req.body, req.params.id)
    .then(dados => res.jsonp(dados)) 
    .catch(erro => res.status(500).jsonp(erro));
});

//DELETE
router.delete('/:id', function(req, res, next) {
  Book.delete(req.params.id)
    .then(dados => res.jsonp(dados)) 
    .catch(erro => res.status(500).jsonp(erro));
});


module.exports = router;