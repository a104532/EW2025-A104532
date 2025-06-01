const express = require('express');
const router = express.Router();
const axios = require('axios');
const API_BASE_URL = 'http://localhost:17000/api';

const multer = require('multer');
const FormData = require('form-data');

// Configuração do multer apenas para memória (sem salvar em disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || 
        file.mimetype === 'application/x-zip-compressed' ||
        file.originalname.toLowerCase().endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos ZIP são permitidos'), false);
    }
  }
});

// Middleware para verificar se o usuário é produtor
const isProducer = (req, res, next) => {
  if (!req.session.token) {
    return res.redirect('/auth/login');
  }
  if (req.session.user && (req.session.user.role === 'produtor' || req.session.user.role === 'admin')) {
    return next();
  }
  res.redirect('/auth/login');
};

// Área do produtor
router.get('/', isProducer, async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/items`, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });
    
    const items = response.data.map(item => ({
      ...item,
      dataCriacaoFormatada: new Date(item.dataCriacao).toLocaleDateString('pt-PT')
    }));
    
    res.render('producer/dashboard', {
      title: 'Área do Produtor',
      user: req.session.user,
      items: items
    });
  } catch (error) {
    res.status(500).render('error', {
      error,
      user: req.session.user
    });
  }
});

// Criar novo item
router.get('/new', isProducer, (req, res) => {
  res.render('producer/new', {
    title: 'Novo Item',
    user: req.session.user,
    tiposItem: ['Desporto', 'Cultura', 'Saúde', 'Educação', 'Tecnologia', 'Ciência']
  });
});

// Processar criação de item via SIP 
router.post('/new', isProducer, upload.single('sip'), async (req, res) => {
  try {
    if (!req.file) {
      return res.render('producer/new', {
        title: 'Novo Item',
        user: req.session.user,
        tiposItem: ['Desporto', 'Cultura', 'Saúde', 'Educação', 'Tecnologia', 'Ciência'],
        error: 'Nenhum arquivo foi enviado'
      });
    }

    // Verificar se o token existe
    if (!req.session.token) {
      return res.redirect('/auth/login');
    }

    console.log('File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Criar FormData para enviar o buffer do arquivo diretamente para a API
    const formData = new FormData();
    formData.append('sip', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Enviar para a API de SIP
    const response = await axios.post(`${API_BASE_URL}/sip`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${req.session.token}`
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('SIP processed successfully:', response.data);

    // Redirecionar para o item criado
    res.redirect(`/producer/items/${response.data.itemId}`);

  } catch (error) {
    console.error('Erro no upload SIP:', error.response?.data || error.message);
    
    res.render('producer/new', {
      title: 'Novo Item',
      user: req.session.user,
      tiposItem: ['Desporto', 'Cultura', 'Saúde', 'Educação', 'Tecnologia', 'Ciência'],
      error: error.response?.data?.details || error.response?.data?.error || 'Erro ao processar SIP'
    });
  }
});

// Ver detalhes do item (versão produtor)
router.get('/items/:id', isProducer, async (req, res) => {
  try {
    const [itemRes, filesRes, commentsRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/items/${req.params.id}`, {
        headers: { Authorization: `Bearer ${req.session.token}` }
      }),
      axios.get(`${API_BASE_URL}/items/${req.params.id}/files`, {
        headers: { Authorization: `Bearer ${req.session.token}` }
      }),
      axios.get(`${API_BASE_URL}/comments/${req.params.id}/`, {
        headers: { Authorization: `Bearer ${req.session.token}` }
      })
    ]);

    const item = {
      ...itemRes.data,
      dataCriacaoFormatada: new Date(itemRes.data.dataCriacao).toLocaleString('pt-PT'),
      dataSubmissaoFormatada: new Date(itemRes.data.dataSubmissao).toLocaleString('pt-PT'),
      ficheiros: filesRes.data.map(file => ({
        ...file,
        nomeFicheiro: file.caminho.split('/').pop(),
        tamanhoFormatado: (file.tamanho / (1024 * 1024)).toFixed(2) + ' MB'
      })),
      comentarios: commentsRes.data.map(comment => ({
        ...comment,
        dataCriacaoFormatada: new Date(comment.dataCriacao).toLocaleString('pt-PT')
      }))
    };

    res.render('public/item', {
      title: 'Detalhes do Item',
      user: req.session.user,
      item: item
    });
  } catch (error) {
    res.status(500).render('error', {
      error,
      user: req.session.user
    });
  }
});

// Formulário de edição
router.get('/items/:id/edit', isProducer, async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/items/${req.params.id}`, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });
    
    res.render('producer/edit', {
      title: 'Editar Item',
      user: req.session.user,
      item: response.data,
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
router.post('/items/:id/edit', isProducer, async (req, res) => {
  try {
    await axios.put(`${API_BASE_URL}/items/${req.params.id}`, req.body, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });
    res.redirect(`/producer/items/${req.params.id}`);
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
router.post('/items/:id/delete', isProducer, async (req, res) => {
  try {
    await axios.delete(`${API_BASE_URL}/items/${req.params.id}`, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });
    res.redirect('/producer');
  } catch (error) {
    res.status(500).render('error', {
      error,
      user: req.session.user
    });
  }
});

// Alterar visibilidade
router.post('/items/:id/visibility', isProducer, async (req, res) => {
  try {
    await axios.put(
      `${API_BASE_URL}/items/${req.params.id}/visibility`, 
      { publico: req.body.publico },
      { headers: { Authorization: `Bearer ${req.session.token}` } }
    );
    res.redirect(`/producer/items/${req.params.id}`);
  } catch (error) {
    res.status(500).render('error', {
      error,
      user: req.session.user
    });
  }
});

module.exports = router;