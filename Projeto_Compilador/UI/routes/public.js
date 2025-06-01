const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_BASE_URL = 'http://localhost:17000/api';

function formatDate(dateString) {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('pt-PT', options);
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Página principal
router.get('/', async (req, res) => {
  try {
    console.log('Loading public items...');
    
    const response = await axios.get(`${API_BASE_URL}/items/public`);
    const items = response.data.map(item => ({
      ...item,
      dataCriacaoFormatada: formatDate(item.dataCriacao)
    }));

    console.log(`Loaded ${items.length} public items`);

    res.render('public/index', {
      title: "Diário Digital - Conteúdos Públicos",
      user: req.session.user || null,
      items: items
    });
  } catch (error) {
    console.error('Error loading public items:', error);
    res.status(500).render('error', {
      message: "Erro ao carregar conteúdos públicos",
      error: error.response?.data || error.message,
      user: req.session.user || null
    });
  }
});

// Detalhes do item (acessível publicamente)
router.get('/items/:id', async (req, res) => {
  try {
    console.log(`Loading item details: ${req.params.id}`);
    
    // Configura os headers (com token se existir)
    const headers = {};
    if (req.session.user?.token) {
      headers.Authorization = `Bearer ${req.session.user.token}`;
    }

    // Tenta primeiro a rota pública
    let itemRes;
    try {
      itemRes = await axios.get(`${API_BASE_URL}/items/public/${req.params.id}`, { headers });
    } catch (publicError) {
      // Se for erro 403 e usuário autenticado, tenta a rota privada
      if (publicError.response?.status === 403 && req.session.user?.token) {
        itemRes = await axios.get(`${API_BASE_URL}/items/${req.params.id}`, { headers });
      } else {
        throw publicError;
      }
    }

    // Busca arquivos (usa rota pública ou privada conforme o item)
    const filesEndpoint = itemRes.data.publico 
      ? `${API_BASE_URL}/items/public/${req.params.id}/files`
      : `${API_BASE_URL}/items/${req.params.id}/files`;

    const [filesRes, commentsRes] = await Promise.all([
      axios.get(filesEndpoint, { headers }).catch(() => ({ data: [] })),
      axios.get(`${API_BASE_URL}/comments/${req.params.id}/`, { headers }).catch(() => ({ data: [] }))
    ]);

    const item = {
      ...itemRes.data,
      dataCriacaoFormatada: formatDate(itemRes.data.dataCriacao),
      dataSubmissaoFormatada: formatDate(itemRes.data.dataSubmissao),
      ficheiros: filesRes.data.map(file => ({
        ...file,
        nomeFicheiro: file.caminho?.split('/').pop() || 'arquivo',
        tamanhoFormatado: formatFileSize(file.tamanho || 0)
      })),
      comentarios: commentsRes.data.map(comment => ({
        ...comment,
        dataCriacaoFormatada: formatDate(comment.dataCriacao)
      }))
    };

    res.render('public/item', {
      title: item.nome || `Item ${item._id}`,
      item: item,
      user: req.session.user || null
    });

  } catch (error) {
    console.error('Error fetching item details:', error);
    
    if (error.response?.status === 404) {
      return res.status(404).render('error', {
        message: "Item não encontrado",
        error: "O item solicitado não existe.",
        user: req.session.user || null
      });
    }

    if (error.response?.status === 403) {
      return res.status(403).render('error', {
        message: "Acesso negado",
        error: req.session.user 
          ? "Você não tem permissão para acessar este item."
          : "Este item é privado. Faça login para acessar.",
        user: req.session.user || null
      });
    }

    res.status(500).render('error', {
      message: "Erro ao carregar detalhes do item",
      error: error.response?.data?.error || error.message,
      user: req.session.user || null
    });
  }
});

// Endpoint para verificar disponibilidade de DIP
router.get('/items/:id/dip-info', async (req, res) => {
  try {
    const headers = {};
    if (req.session.user && req.session.user.token) {
      headers['Authorization'] = `Bearer ${req.session.user.token}`;
    }

    const dipResponse = await axios.get(
      `${API_BASE_URL}/dip/${req.params.id}/info`,
      { headers }
    );

    res.json(dipResponse.data);
  } catch (error) {
    console.error('Error fetching DIP info:', error);
    res.status(error.response?.status || 500).json({
      error: 'Erro ao obter informações do DIP',
      details: error.response?.data || error.message
    });
  }
});

router.get('/items/:id/download-dip', async (req, res) => {
  try {
    
    const dipUrl = `${API_BASE_URL}/dip/${req.params.id}`;
    
    // CORREÇÃO: Headers de autorização são opcionais
    const headers = {};
    if (req.session.user && req.session.user.token) {
      headers['Authorization'] = `Bearer ${req.session.user.token}`;
      console.log('Using authenticated request for DIP download');
    } else {
      console.log('Using anonymous request for public DIP download');
    }

    // Fazer stream do arquivo diretamente
    const response = await axios({
      method: 'GET',
      url: dipUrl,
      headers: headers,
      responseType: 'stream'
    });


    // Repassar headers importantes
    if (response.headers['content-type']) {
      res.setHeader('Content-Type', response.headers['content-type']);
    }
    if (response.headers['content-disposition']) {
      res.setHeader('Content-Disposition', response.headers['content-disposition']);
    }

    // Pipe do stream da API para a resposta
    response.data.pipe(res);

    // Log quando o download terminar
    response.data.on('end', () => {
      console.log(`DIP download completed for item: ${req.params.id}`);
    });

  } catch (error) {
    console.error('Error in DIP download:', error);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Item não encontrado'
      });
    }
    
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Este item requer autenticação para download'
      });
    }
    
    if (error.response?.status === 403) {
      return res.status(403).json({
        error: 'Acesso não autorizado'
      });
    }
    
    res.status(500).json({
      error: 'Erro ao fazer download do DIP',
      details: error.message
    });
  }
});

router.post('/comments/:itemId', async (req, res) => {
  try {
    console.log('Token from session:', req.session.token); // Debug
    
    if (!req.session.user || !req.session.token) {
      return res.redirect('/auth/login?message=É+necessário+estar+logado+para+comentar');
    }

    const headers = {
      'Authorization': `Bearer ${req.session.token}`,
      'Content-Type': 'application/json'
    };

    console.log('Headers being sent:', headers); // Debug

    const commentData = {
      texto: req.body.texto,
      item: req.params.itemId
    };

    const response = await axios.post(
      `${API_BASE_URL}/comments/${req.params.itemId}`,
      commentData,
      { headers }
    );

    res.redirect(`/items/${req.params.itemId}`);
    
  } catch (error) {
    console.error('Full error:', {
      message: error.message,
      response: error.response?.data,
      config: {
        url: error.config?.url,
        headers: error.config?.headers
      }
    });
    res.redirect(`/items/${req.params.itemId}?error=comment_error`);
  }
});

module.exports = router;