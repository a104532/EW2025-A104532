var express = require('express');
var router = express.Router();
var axios = require('axios');

/* GET para a página Principal */
router.get('/', function(req, res, next) {
  axios.get('http://localhost:16000/contratos?_sort=_id')
    .then(resp => {
      res.status(200).render('contratosPage', {
        'lcontratos': resp.data,
        tit: "Lista de Contratos"
      });
    })
    .catch(erro => {
      res.status(500).render('error', { error: erro });
    });
});

/* GET para a página contrato */

router.get('/:id', function(req, res, next){
  const contratoId = req.params.id;
  axios.get(`http://localhost:16000/contratos/${contratoId}`)
    .then(resp => {
      res.status(200).render('contratoPage', {
        contrato: resp.data,
        tit: "Detalhes do Contrato"
      });
    })
    .catch(erro => {
      res.status(500).render('error', { error: erro });
    });
});

/* GET para a página entidades */
router.get('/entidades/:nipc', function(req, res, next) {
  axios.get(`http://localhost:16000/contratos?entidade=`+req.params.nipc)
    .then(resp => {
      let sum = resp.data.reduce((total, {precoContratual}) => total + precoContratual, 0).toFixed(2);
      res.status(200).render('entidadePage', {
        lcontratos: resp.data,
        entidade: resp.data[0]?.entidade_comunicante || "Entidade Não Encontrada",
        nipc: req.params.nipc,
        soma: sum, 
        tit: "Detalhes da Entidade"
      });
    })
    .catch(erro => {
      res.status(500).render('error', { error: erro });
    });
});

module.exports = router;
