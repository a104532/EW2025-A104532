var express = require('express');
var router = express.Router();
var axios = require('axios');

/* GET home page. */
router.get('/', function(req, res, next) {
  var date = new Date().toISOString().substring(0, 16)
  axios.get('http://localhost:3000/filmes?_sort=titulo')
    .then(resp => {
      res.status(200).render('filmesPage', {'lfilmes': resp.data,tit: "Lista de Filmes" , 'date': date})
    })
    .catch(erro => {
      res.status(500).render('error', {error: erro})
    })
});


/* GET actor page. */
router.get('/filmes/:ator', function(req, res) {
  const atorNome = req.params.ator;
  axios.get(`http://localhost:3000/atores?nome=${encodeURIComponent(atorNome)}`)
    .then(resp => {
      if (resp.data.length > 0) {
        const ator = resp.data[0];
        const filmesDoAtor = ator.filmes;
        
        // Buscar os detalhes completos dos filmes do ator
        return axios.get('http://localhost:3000/filmes')
          .then(filmesResp => {
            const filmesFiltrados = filmesResp.data.filter(filme => 
              filmesDoAtor.includes(filme.titulo)
            );
            
            res.render('atorPage', {
              ator: atorNome,
              filmes: filmesFiltrados,
              d: new Date().toISOString().substring(0, 10)
            });
          });
      } else {
        res.status(404).render('error', {error: 'Ator não encontrado'});
      }
    })
    .catch(erro => {
      console.log(erro);
      res.render('error', {error: erro});
    });
});

/* GET edit film page. */
router.get('/edit/:id', function(req, res) {
  const filmeId = parseInt(req.params.id);
  axios.get(`http://localhost:3000/filmes/${filmeId}`)
    .then(resp => {
      res.render('filmeFormEditPage', {
        f: resp.data,
        d: new Date().toISOString().substring(0, 10)
      });
    })
    .catch(erro => {
      console.log(erro);
      res.render('error', {error: erro});
    });
});

/* POST update film. */
router.post('/edit/:id', function(req, res) {
  const filmeId = parseInt(req.params.id);
  
  // Preparar dados do filme atualizado - o mais simples possível
  const updatedFilm = {
    id: filmeId,
    titulo: req.body.titulo,
    ano: parseInt(req.body.ano),
    atores: req.body.atores.split(',').map(item => item.trim()),
    genero: req.body.genero.split(',').map(item => item.trim())
  };

  // Apenas atualizar o filme e redirecionar
  axios.put(`http://localhost:3000/filmes/${filmeId}`, updatedFilm)
    .then(() => {
      res.redirect('/');
    })
    .catch(erro => {
      console.log(erro);
      res.render('error', {error: erro});
    });
});

/* delete film. */
router.get('/delete/:id', function(req, res) {
  const filmeId = parseInt(req.params.id);
  
  // Simplesmente excluir o filme e redirecionar
  axios.delete(`http://localhost:3000/filmes/${filmeId}`)
    .then(() => {
      res.redirect('/');
    })
    .catch(erro => {
      console.log(erro);
      res.render('error', {error: erro});
    });
});

module.exports = router;
