var express = require('express');
var router = express.Router();
var Contrato = require('../controllers/contratos');
const { param } = require('../app');

/* GET all contracts. */
router.get('/', function(req, res, next) {
  if(req.query.entidade) {
    Contrato.getContratoByEntidade(req.query.entidade)
    .then(data => res.status(200).jsonp(data))
    .catch(erro => res.status(500).jsonp('Erro na listagem de contratos por entidade: ' + erro))

  }
  else if (req.query.tipo) {
  Contrato.getContratoByTipo(req.query.tipo)
    .then(data => res.status(200).jsonp(data))
    .catch(erro => res.status(500).jsonp('Erro na listagem de contratos: ' + erro))
  }
  else {
    Contrato.getContratos()
    .then(data => res.status(200).jsonp(data))
    .catch(erro => res.status(500).jsonp('Erro na listagem de contratos: ' + erro))
  }
});


/* GET all entities */
router.get('/entidades', function(req, res, next) {
  Contrato.getEntidades()
    .then(data => res.status(200).jsonp(data))
    .catch(erro => res.status(500).jsonp('Erro na listagem de entidades: ' + erro))
})

/* GET all entities */
router.get('/tipos', function(req, res, next) {
  Contrato.getTipos()
    .then(data => res.status(200).jsonp(data))
    .catch(erro => res.status(500).jsonp('Erro na listagem de entidades: ' + erro))
})

/* GET contracts by ID */
router.get('/:id', function(req, res, next) {
  Contrato.getContratoById(req.params.id)
    .then(data => res.status(200).jsonp(data))
    .catch(erro => res.status(500).jsonp('Erro na listagem de contratos: ' + erro))
});

/* POST new contract */
router.post('/', function(req, res, next) {
  Contrato.insert(req.body)
    .then(data => res.status(200).jsonp(data))
    .catch(erro => res.status(500).jsonp('Erro na listagem de contratos: ' + erro))
});

/* PUT  contract */
router.put('/', function(req, res, next) {
  Contrato.update(req.body, req.params.id)
    .then(data => res.status(200).jsonp(data))
    .catch(erro => res.status(500).jsonp('Erro na listagem de contratos: ' + erro))
});

/* Delete contract */
router.put('/', function(req, res, next) {
  Contrato.delete(req.params.id)
    .then(data => res.status(200).jsonp(data))
    .catch(erro => res.status(500).jsonp('Erro na listagem de contratos: ' + erro))
});



module.exports = router;
