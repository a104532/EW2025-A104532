const express = require('express');
const router = express.Router();
const {verifyToken, checkRole, checkRoles} = require('../auth/middleware');
const Item = require('../controllers/itemController');
const File = require('../controllers/fileController');
const Log = require('../controllers/logController');

// Itens públicos (sem autenticação necessária)
router.get('/public', async (req, res) => {
  try {
    const items = await Item.getPublicItems();  
    
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rotas públicas para visualização (sem autenticação)
router.get('/public/:id', async (req, res) => {
  try {
    const item = await Item.getItemById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    // Verifica se o item é público
    if (!item.publico) {
      return res.status(403).json({ error: 'Este item não está disponível publicamente' });
    }

    // Remove informações sensíveis antes de enviar
    const publicItem = {
      ...item.toObject(),
      // Mantém apenas os campos necessários para visualização pública
      _id: item._id,
      nome: item.nome,
      tipoItem: item.tipoItem,
      descricaoItem: item.descricaoItem,
      dataCriacao: item.dataCriacao,
      publico: item.publico,
      ficheiros: item.ficheiros,
      // Pode adicionar outros campos não sensíveis
    };

    res.json(publicItem);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Arquivos de item público
router.get('/public/:id/files', async (req, res) => {
  try {
    const item = await Item.getItemById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    if (!item.publico) {
      return res.status(403).json({ error: 'Este item não está disponível publicamente' });
    }

    res.json(item.ficheiros || []);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar todos os itens do produtor e admin
router.get('/', verifyToken, checkRoles(['produtor', 'admin']), async (req, res) => {
  console.log('Usuário autenticado:', req.user); // Adicione este log
  try {
    const items = await Item.getAllItems();

    res.json(items);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar novo item 
router.post('/', verifyToken, checkRoles(['produtor', 'admin']), async (req, res) => {
  try {
    const itemData = { ...req.body, produtor: req.userId };
    const item = await Item.createItem(itemData, req.userId);

    await Log.create({ message: `Item criado pelo usuário ${req.userId}: ${item._id}`, level: 'info' });
    res.status(201).json(item);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obter item específico
router.get('/:id', verifyToken, checkRoles(['produtor', 'admin']), async (req, res) => {
  try {
    const item = await Item.getItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    const userRole = req.user?.role || null;

    if (!item.publico && !(userRole === 'admin' || (userRole === 'produtor'))) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await Log.create({ message: `Item ${req.params.id} acessado pelo usuário ${req.userId || 'não autenticado'}`, level: 'info' });
    await Log.create({ message: `Item ${req.params.id} visualizado`, level: 'view' });
    res.json(item);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar item
router.put('/:id', verifyToken, checkRoles(['produtor', 'admin']), async (req, res) => {
  try {
    const item = await Item.updateItem(req.params.id, req.userId, req.body);
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado ou sem permissão' });
    }

    await Log.create({ message: `Item ${req.params.id} atualizado`, level: 'info' });
    res.json(item);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Deletar item 
router.delete('/:id', verifyToken, checkRoles(['produtor', 'admin']), async (req, res) => {
  try {
    const deleted = await Item.deleteItem(req.params.id, req.userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Item não encontrado ou sem permissão' });
    }

    await Log.create({ message: `Item ${req.params.id} removido`, level: 'info' });
    res.json({ message: 'Item removido com sucesso' });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Toggle visibilidade (público/privado) 
router.put('/:id/visibility', verifyToken, checkRoles(['produtor', 'admin']), async (req, res) => {
  try {
    const item = await Item.toggleVisibility(req.params.id, req.userId);
    await Log.create({ message: `Visibilidade do item ${req.params.id} alterada`, level: 'info' });

    res.json({ 
      message: `Item agora é ${item.publico ? 'público' : 'privado'}`, 
      item 
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Exportar item como DIP 
router.get('/:id/export', verifyToken, async (req, res) => {
  try {
    const data = await Item.prepareExportPackage(req.params.id, req.userId);

    await Log.create({ message: `Exportação solicitada para item ${req.params.id} pelo usuário ${req.userId}`, level: 'download' });

    if (req.query.format === 'zip') {
      // TODO: implementar geração de ZIP
      // res.set(...).send(zipBuffer);
      res.status(501).json({ error: 'Exportação ZIP não implementada' });
    } else {
      res.json(data);
    }

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listar arquivos do item
router.get('/:id/files',verifyToken, checkRole('produtor'), async (req, res) => {
  try {
    const item = await Item.getItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    const userRole = req.user?.role || null;

    if (!item.publico && !(userRole === 'admin' || (userRole === 'produtor'))) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await Log.create({ message: `Arquivos do item ${req.params.id} acessados pelo usuário ${req.userId || 'não autenticado'}`, level: 'info' });
    res.json(item.ficheiros);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download de arquivo específico
router.get('/files/:fileId/download', async (req, res) => {
  try {
    const fileInfo = await File.getFileForDownload(req.params.fileId);
    await Log.create({ message: `Download do arquivo ${req.params.fileId}`, level: 'info' });

    res.download(fileInfo.path, fileInfo.name);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Deletar arquivo
router.delete('/files/:fileId', verifyToken, checkRoles(['produtor', 'admin']), async (req, res) => {
  try {
    await File.deleteFile(req.params.fileId, req.userId);
    await Log.create({ message: `Arquivo ${req.params.fileId} removido pelo usuário ${req.userId}`, level: 'warning' });

    res.json({ message: 'Arquivo removido com sucesso' });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Compartilhar em redes sociais (placeholder)
router.post('/:id/share', verifyToken, async (req, res) => {
  try {
    const { platform } = req.body;
    // TODO: implementar lógica de compartilhamento real

    await Log.create({ message: `Item ${req.params.id} programado para compartilhamento no ${platform} pelo usuário ${req.userId}`, level: 'info' });

    res.json({ message: `Item programado para compartilhamento no ${platform}`, success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/news', async(req, res) => {
  try {
    
    const news = await Log.getPublicNews();

    if(!news){
      return res.status(404).json({ error: 'Notícias não encontradas' });
    }

    res.status(200).json(news)

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

})


module.exports = router;