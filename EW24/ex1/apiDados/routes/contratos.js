const express = require('express');
const router = express.Router();
const contratoController = require('../controllers/contrato');

// GET /contratos
router.get('/', function(req, res, next) {
    if (req.query.entidade) {
        contratoController.getByEntidade(req.query.entidade)
            .then(data => res.jsonp(data))
            .catch(err => res.status(500).jsonp(err));
    } else if (req.query.tipo) {
        contratoController.getByTipo(req.query.tipo)
            .then(data => res.jsonp(data))
            .catch(err => res.status(500).jsonp(err));
    } else {
        contratoController.list()
            .then(data => res.jsonp(data))
            .catch(err => res.status(500).jsonp(err));
    }
});

// GET /contratos/entidades - DEVE VIR ANTES DE /:id
router.get('/entidades', function(req, res, next) {
  contratoController.listEntidades()
      .then(data => res.jsonp(data))
      .catch(err => res.status(500).jsonp(err));
});

// GET /contratos/tipos - DEVE VIR ANTES DE /:id
router.get('/tipos', function(req, res, next) {
  contratoController.listTipos()
      .then(data => res.jsonp(data))
      .catch(err => res.status(500).jsonp(err));
});

// GET /contratos/:id - AGORA ESTÁ DEPOIS DAS ROTAS ESPECÍFICAS
router.get('/:id', function(req, res, next) {
  contratoController.getById(req.params.id)
      .then(data => {
          if (data) {
              res.jsonp(data);
          } else {
              res.status(404).jsonp({error: "Contrato não encontrado"});
          }
      })
      .catch(err => res.status(500).jsonp(err));
});

// POST /contratos
router.post('/', function(req, res, next) {
    contratoController.add(req.body)
        .then(data => res.status(201).jsonp(data))
        .catch(err => res.status(500).jsonp(err));
});

// DELETE /contratos/:id
router.delete('/:id', function(req, res, next) {
    contratoController.delete(req.params.id)
        .then(data => {
            if (data.deletedCount > 0) {
                res.status(204).end();
            } else {
                res.status(404).jsonp({error: "Contrato não encontrado"});
            }
        })
        .catch(err => res.status(500).jsonp(err));
});

// PUT /contratos/:id
router.put('/:id', function(req, res, next) {
    contratoController.update(req.params.id, req.body)
        .then(data => {
            if (data.modifiedCount > 0) {  // Alterado de nModified para modifiedCount
                res.jsonp(data);
            } else {
                res.status(404).jsonp({error: "Contrato não encontrado ou sem alterações"});
            }
        })
        .catch(err => res.status(500).jsonp(err));
});

module.exports = router;