const express = require('express');
const router = express.Router();
const {checkRole, verifyToken, checkRoles} = require('../auth/middleware');
const User = require('../controllers/userController');
const Item = require('../controllers/itemController');
const Log = require('../controllers/logController');
const Comment = require('../controllers/commentController');

// Middleware para admin
router.use(verifyToken, checkRole('admin'));


// Gestão de utilizadores
// List users
router.get('/users', async (req, res) => {
  try {
    const users = await User.getUsers(); 

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'Nenhum utilizador encontrado' });
    }

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obter utilizador por ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  const allowedUpdates = ['username', 'email', 'socialProfiles'];
  const updates = {};

  for (const key of Object.keys(req.body)) {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  }

  try {
    const user = await User.updateUser(req.params.id, updates);

    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    await Log.create({
      message: `Informação do utilizador ${req.params.id} atualizado`,
      level: 'info'
    });

    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.deleteUser(userId); 
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    try {
      await Comment.deleteCommentsOfUser(userId);
      console.log(`Comentários do utilizador ${userId} removidos com sucesso`);
    } catch (err) {
      console.error(`Erro ao remover comentários do utilizador ${userId}:`, err.message);
    }

    await Log.create({
      message: `Utilizador ${userId} removido`,
      level: 'info'
    });

    res.json({ message: 'Utilizador removido com sucesso' });
    
  } catch (err) {
    console.error(`Erro ao remover utilizador ${userId}:`, err.message);
    res.status(500).json({ error: 'Erro interno ao remover o utilizador' });
  }
});


// Estatísticas
// Consultas e Descarregamentos
router.get('/stats', async (req, res) => {
  try {

    const stats = await Log.getStats();

    if (!stats) {
      return res.status(404).json({ error: 'Estatísticas não encontradas' });
    }

    res.status(200).json(stats);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Gestão de notícias 
// List
router.get('/news', async(req, res) => {
  try {
    const news = await Log.getNews();

    if (!news) {
      return res.status(404).json({ error: 'Notícias não encontradas' });
    }

    res.status(200).json(news);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// create
router.post('/news', async (req, res) => {
  try {

    const news = await Log.createNews(req.body.message);

    res.status(201).json(news);
    
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// toggle visibility
router.put('/news/:id', async(req, res) => {
  try {
    const news = await Log.toggleNewsVisibility(req.params.id);
    
    if (!news) {
      return res.status(404).json({ error: 'Notícia não encontrada' });
    }

    await Log.create({
      message: `Visibilidade da notícia ${req.params.id} alterada`,
      level: 'info'
    });

    res.status(201).json(news);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Gestão de AIPs (itens)
// List
router.get('/items', async (req, res) => {
  try {
    const items = await Item.getAllItems();

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get item by ID
router.get('/items/:id', async (req, res) => {
  try {
    const item = await Item.getItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    await Log.create({
      message: `Item ${req.params.id} visualizado`,
      level: 'view'
    });

    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update item
router.put('/items/:id', async (req, res) => {
  try {
    const item = await Item.updateItem(req.params.id, req.userId, req.body);
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado ou sem permissão' });
    }

    await Log.create({
      message: `Item ${req.params.id} alterado`,
      level: 'info'
    });

    res.status(200).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete item
router.delete('/items/:id', async (req, res) => {
  try {
    const deleted = await Item.deleteItem(req.params.id, req.userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Item não encontrado ou sem permissão' });
    }

    await Log.create({
      message: `Item ${req.params.id} removido`,
      level: 'info'
    });

    res.json({ message: 'Item removido com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Logs do sistema
router.get('/logs', async (req, res) => {
  try {
    const logs = await Log.getSystemLogs();
    if (!logs || logs.length === 0) {
      return res.status(404).json({ error: 'Nenhum log encontrado' });
    }
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;