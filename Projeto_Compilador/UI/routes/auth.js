const express = require('express');
const router = express.Router();
const axios = require('axios');
const API_URL = 'http://localhost:17000/api/auth';

// Helper para formatar erros
const formatError = (error) => {
  return error.response?.data?.error || error.message || 'Erro desconhecido';
};

// Rota de Login
router.get('/login', (req, res) => {
  res.render('public/login', { 
    title: 'Login',
    error: req.query.error,
    success: req.query.success
  });
});

// Rota de Registro
router.get('/register', (req, res) => {
  res.render('public/register', { 
    title: 'Registro',
    error: req.query.error
  });
});

// Processar Login Local
router.post('/login', async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email: req.body.email,
      password: req.body.password
    });

    const token = response.data.token.replace('Bearer ', '');
    req.session.token = response.data.token;
    req.session.user = response.data.user;
    res.redirect('/');
    
  } catch (error) {
    res.redirect(`/auth/login?error=${encodeURIComponent(formatError(error))}`);
  }
});

// Processar Registro Local
router.post('/register', async (req, res) => {
  try {
    await axios.post(`${API_URL}/register`, {
      email: req.body.email,
      password: req.body.password,
      username: req.body.username
    });
    res.redirect('/auth/login?success=Registro realizado com sucesso');
  } catch (error) {
    res.redirect(`/auth/register?error=${encodeURIComponent(formatError(error))}`);
  }
});

// Callback do Google
router.get('/google/callback', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/google/callback`, {
      params: req.query
    });
    req.session.token = response.data.token;
    req.session.user = response.data.user;
    res.redirect('/');
  } catch (error) {
    res.redirect(`/auth/login?error=${encodeURIComponent(formatError(error))}`);
  }
});

router.get('/success', (req, res) => {
  req.session.token = req.query.token;
  req.session.user = {
    id: req.query.userId,
    email: req.query.email,
    role: req.query.role
  };
  
  
  res.redirect('/');
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
});

// Redirecionar para autenticação Google
router.get('/google', (req, res) => {
  res.redirect(`${API_URL}/google`);
});

module.exports = router;