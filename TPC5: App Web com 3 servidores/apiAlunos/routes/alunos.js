var express = require('express');
var router = express.Router();
var Aluno = require('../controllers/alunos');

// Get- listar alunos
router.get('/', function(req, res, next) {
  const currentDate = new Date().toISOString().substring(0, 16);
  Aluno.list()
    .then(data => res.render('studentListPage', { slist: data,d: currentDate, title: 'Lista de Alunos' }))
    .catch(erro => res.status(500).render('error', { error: erro }));
});

// Get - registar aluno
router.get('/registo', function(req, res, next) {
  var date = new Date().toISOString().substring(0, 16)
  res.status(200).render('studentFormPage', {'date': date})
});

// Get - detalhes de um aluno
router.get('/:id', function(req, res, next) {
  Aluno.findById(req.params.id)
    .then(data => res.render('studentListPage', { slist: [data], title: 'Detalhes do Aluno' }))
    .catch(erro => res.status(500).render('error', { error: erro }));
});

//get - editar aluno
router.get('/edit/:id', function(req, res, next) {
  Aluno.findById(req.params.id)
    .then(data => {
      const currentDate = new Date().toISOString().substring(0, 16);
      res.render('studentFormEditPage', { a: data, d: currentDate, title: 'Editar Aluno' });
    })
    .catch(erro => res.status(500).render('error', { error: erro }));
});

router.post('/', function(req, res, next) {
  const aluno = {
    _id: req.body.id,
    nome: req.body.nome,
    gitlink: req.body.gitlink,
    tpc1: req.body.tpc1 ? true : false,
    tpc2: req.body.tpc2 ? true : false,
    tpc3: req.body.tpc3 ? true : false,
    tpc4: req.body.tpc4 ? true : false,
    tpc5: req.body.tpc5 ? true : false,
    tpc6: req.body.tpc6 ? true : false,
    tpc7: req.body.tpc7 ? true : false,
    tpc8: req.body.tpc8 ? true : false
  };
  
  Aluno.insert(aluno)
    .then(() => res.redirect('/alunos'))
    .catch(erro => res.status(500).render('error', { error: erro }));
});

router.post('/edit/:id', function(req, res, next) {
  const aluno = {
    nome: req.body.nome,
    gitlink: req.body.gitlink,
    tpc1: req.body.tpc1 ? true : false,
    tpc2: req.body.tpc2 ? true : false,
    tpc3: req.body.tpc3 ? true : false,
    tpc4: req.body.tpc4 ? true : false,
    tpc5: req.body.tpc5 ? true : false,
    tpc6: req.body.tpc6 ? true : false,
    tpc7: req.body.tpc7 ? true : false,
    tpc8: req.body.tpc8 ? true : false
  };
  
  Aluno.update(req.params.id, aluno)
    .then(() => res.redirect('/alunos'))
    .catch(erro => res.status(500).render('error', { error: erro }));
});

// Rota para excluir um aluno
router.get('/delete/:id', function(req, res, next) {
  Aluno.delete(req.params.id)
    .then(() => res.redirect('/alunos'))
    .catch(erro => res.status(500).render('error', { error: erro }));
});

module.exports = router;