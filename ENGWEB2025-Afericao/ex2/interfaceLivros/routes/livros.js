const express = require('express');
const axios = require('axios');
const router = express.Router();

/* Página Principal - Lista de livros */
router.get('/', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:17000/books');
    res.status(200).render('livrosPage', { livros: response.data, tit: "Catálogo de Livros" });
  } catch (error) {
    res.status(500).render('error', { error });
  }
});

/* Página de detalhes do livro */
router.get('/livro/:id', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:17000/books/${req.params.id}`);
    res.status(200).render('livroPage', { livro: response.data, tit: "Detalhes do Livro" });
  } catch (error) {
    res.status(500).render('error', { error });
  }
});

/* Página do autor e seus livros */
router.get('/entidades/:idAutor', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:17000/books');
    // Correção aqui: o modelo usa 'author' como array de strings
    const livrosAutor = response.data.filter(livro => 
      livro.author && livro.author.includes(req.params.idAutor)
    );
    
    if (livrosAutor.length > 0) {
      res.status(200).render('autorPage', {
        livros: livrosAutor,
        autorId: req.params.idAutor,
        autorNome: req.params.idAutor, // Usando o ID como nome já que não temos outra informação
        totalLivros: livrosAutor.length,
        tit: `Livros de ${req.params.idAutor}`
      });
    } else {
      res.status(404).render('error', { message: "Autor não encontrado" });
    }
  } catch (error) {
    res.status(500).render('error', { error });
  }
});

module.exports = router;