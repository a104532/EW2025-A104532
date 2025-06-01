const express = require('express');
const axios = require('axios');
const router = express.Router();
const API_BASE_URL = 'http://localhost:17000/api';

// Middleware para verificar se o usuário é admin
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.redirect('/auth/login');
};

// Dashboard admin
router.get('/', isAdmin, async (req, res) => {
  try {
    const [users, items, logs, stats] = await Promise.all([
      axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${req.session.token}` }
      }),
      axios.get(`${API_BASE_URL}/admin/items`, {
        headers: { Authorization: `Bearer ${req.session.token}` }
      }),
      axios.get(`${API_BASE_URL}/admin/logs`, {
        headers: { Authorization: `Bearer ${req.session.token}` }
      }),
      axios.get(`${API_BASE_URL}/admin/stats `, {
        headers: { Authorization: `Bearer ${req.session.token}` }
      })
    ]);
    
    res.render('admin/dashboard', {
      title: 'Área de Administração',
      user: req.session.user,
      users: users.data,
      items: items.data,
      logs: logs.data,
      stats: stats.data
    });
  } catch (error) {
    res.status(500).render('error', {
      error,
      user: req.session.user
    });
  }
});

// Gestão de usuários
router.get('/users', isAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });
    res.render('admin/users', {
      title: "Gestão de Utilizadores",
      user: req.session.user,
      users: response.data
    });
  } catch (error) {
    res.status(500).render('error', { 
      error,
      user: req.session.user
    });
  }
});

router.get('/users/:id', isAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/users/${req.params.id}`, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });

    res.render('admin/viewUser', {
      title: 'Ver Utilizador',
      user: req.session.user,
      targetUser: response.data
    });

  } catch (error) {
    res.status(500).render('error', {
      error,
      user: req.session.user
    });
  }
});


// Formulário para editar um utilizador
router.get('/users/:id/edit', isAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/users/${req.params.id}`, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });

    res.render('admin/editUser', {
      title: 'Editar Utilizador',
      user: req.session.user,
      targetUser: response.data
    });

  } catch (error) {
    res.status(500).render('error', {
      error,
      user: req.session.user
    });
  }
});

router.post('/users/:id/edit', isAdmin, async (req, res) => {
  try {
    await axios.put(`${API_BASE_URL}/admin/users/${req.params.id}`, req.body, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });

    res.redirect('/admin/users');
  } catch (error) {
    res.status(500).render('error', {
      error,
      user: req.session.user
    });
  }
});

router.post('/users/:id/delete', isAdmin, async (req, res) => {
  try {
    await axios.delete(`${API_BASE_URL}/admin/users/${req.params.id}`, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });
    res.redirect('/admin/users');
  } catch (error) {
    res.status(500).render('error', {
      error,
      user: req.session.user
    });
  }
});

// Formulário para criar uma nova notícia
router.get('/news/new', isAdmin, (req, res) => {
  res.render('admin/newNews', {
    title: 'Nova Notícia',
    user: req.session.user
  });
});

// Criar nova notícia
router.post('/news/new', isAdmin, async (req, res) => {
  try {
    await axios.post(`${API_BASE_URL}/admin/news`, {
      message: req.body.message,
      publico: req.body.publico === 'on'
    }, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });

    res.redirect('/admin/news');
  } catch (error) {
    res.status(500).render('error', {
      error,
      user: req.session.user
    });
  }
});

// Gestão de itens
router.get('/news', isAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/news`, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });
    res.render('admin/news', {
      title: "Gestão de Notícias",
      user: req.session.user,
      news: response.data
    });
  } catch (error) {
    res.status(500).render('error', {
      error,
      user: req.session.user
    });
  }
});

// Gestão de logs
router.get('/logs', isAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/logs`, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });
    res.render('admin/logs', {
      title: "Registos de Atividade",
      user: req.session.user,
      logs: response.data
    });
  } catch (error) {
    res.status(500).render('error', { 
      error,
      user: req.session.user
    });
  }
});

router.get('/items/:idItem', isAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/items/${req.params.idItem}`, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });
    res.render('public/item', {
      title: "Gestão de Itens",
      user: req.session.user,
      item: response.data
    });
  } catch (error) {
    res.status(500).render('error', { 
      error,
      user: req.session.user
    });
  }
});

router.get('/items/:id/edit', isAdmin, async (req, res) => {
  try {
    const itemRes = await axios.get(`${API_BASE_URL}/admin/items/${req.params.id}`, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });

    res.render('producer/edit', {
      title: 'Editar Item',
      user: req.session.user,
      item: itemRes.data,
      tiposItem: ['Desporto', 'Cultura', 'Saúde', 'Educação', 'Tecnologia', 'Ciência']
    });
  } catch (error) {
    res.status(500).render('error', {
      error,
      user: req.session.user
    });
  }
});

// Processar edição
router.post('/items/:id/edit', isAdmin, async (req, res) => {
  try {
    await axios.put(`${API_BASE_URL}/admin/items/${req.params.id}`, req.body, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });
    res.redirect(`/admin/items/${req.params.id}`);
  } catch (error) {
    res.render('producer/edit', {
      title: 'Editar Item',
      user: req.session.user,
      item: req.body,
      tiposItem: ['Desporto', 'Cultura', 'Saúde', 'Educação', 'Tecnologia', 'Ciência'],
      error: error.response?.data?.error || 'Erro ao atualizar item'
    });
  }
});

// Eliminar item
router.post('/items/:id/delete', isAdmin, async (req, res) => {
  try {
    await axios.delete(`${API_BASE_URL}/admin/items/${req.params.id}`, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });
    res.redirect('/admin');
  } catch (error) {
    res.status(500).render('error', {
      error,
      user: req.session.user
    });
  }
});

// Alterar visibilidade
router.post('/items/:id/visibility', isAdmin, async (req, res) => {
  try {
    await axios.put(
      `${API_BASE_URL}/items/${req.params.id}/visibility`, 
      { publico: req.body.publico },
      { headers: { Authorization: `Bearer ${req.session.token}` } }
    );
    res.redirect(`/admin/items/${req.params.id}`);
  } catch (error) {
    res.status(500).render('error', {
      error,
      user: req.session.user
    });
  }
});

// Formulário de edição de uma news
router.get('/news/:id/edit', isAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/logs/${req.params.id}`, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });
    res.render('admin/editNews', {
      title: 'Editar News',
      user: req.session.user,
      news: response.data
    });
  } catch (error) {
    res.status(500).render('error', {
      error,
      user: req.session.user
    });
  }
});

// Atualizar uma news
router.post('/news/:id/edit', isAdmin, async (req, res) => {
  try {
    await axios.put(`${API_BASE_URL}/admin/news/${req.params.id}`, req.body, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });
    res.redirect('/admin/news');
  } catch (error) {
    res.status(500).render('error', {
      error,
      user: req.session.user
    });
  }
});


module.exports = router;