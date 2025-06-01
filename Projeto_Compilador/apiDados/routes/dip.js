const express = require('express');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const {verifyToken} = require('../auth/middleware');
const itemController = require('../controllers/itemController');
const Log = require('../controllers/logController'); 

const router = express.Router();

// Middleware para verificar se item é público OU usuário tem acesso
const checkItemAccess = async (req, res, next) => {
  try {
    // Modificado para trabalhar com o controlador existente
    const item = await itemController.getItemById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    // Se o item é público, permite acesso direto sem autenticação
    if (item.publico) {
      req.item = item;
      return next();
    }

    // Se não é público, precisa estar autenticado
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticação necessária para itens privados' });
    }

    // Se não é público, só o produtor pode acessar
    const userId = req.user._id || req.user.id;
    if (userId !== item.produtor.toString()) {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    req.item = item;
    next();
  } catch (error) {
    console.error('Error in checkItemAccess:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Middleware condicional de autenticação - só aplica se necessário
const conditionalAuth = async (req, res, next) => {
  try {
    // Modificado para trabalhar com o controlador existente
    const item = await itemController.getItemById(req.params.id);
    
    // Se o item é público, não requer autenticação
    if (item && item.publico) {
      return next();
    }
    
    // Se não é público ou não existe, aplica verificação de token
    return verifyToken(req, res, next);
  } catch (error) {
    console.error('Error in conditionalAuth:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Download do DIP (para dono ou item público)
router.get('/:id', conditionalAuth, checkItemAccess, async (req, res) => {
  try {
    const fullItem = req.item;
    const dipFileName = `dip_${fullItem.nome.replace(/[^a-zA-Z0-9]/g, '_')}_${fullItem._id}.zip`;
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${dipFileName}"`);

    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro na criação do arquivo' });
      }
    });

    archive.pipe(res);

    // Adiciona manifesto
    archive.append(JSON.stringify({
      packageType: 'DIP',
      version: '1.0',
      generatedAt: new Date().toISOString(),
      item: {
        id: fullItem._id,
        nome: fullItem.nome,
        tipoItem: fullItem.tipoItem,
        descricaoItem: fullItem.descricaoItem || '',
        dataCriacao: fullItem.dataCriacao,
        dataSubmissao: fullItem.dataSubmissao,
        publico: fullItem.publico,
        produtor: fullItem.produtor
      },
      ficheiros: (fullItem.ficheiros || []).map(file => ({
        id: file._id,
        tipo: file.tipoFich || 'documento',
        nome: path.basename(file.caminho),
        tamanho: file.tamanho || 0,
        caminhoOriginal: file.caminho
      }))
    }, null, 2), { name: 'manifesto-dip.json' });

    // Adiciona ficheiros
    let filesAdded = 0;
    const filesNotFound = [];

    for (const file of fullItem.ficheiros || []) {
      const fileName = path.basename(file.caminho);
      const relativePath = file.caminho.startsWith('/') ? file.caminho.substring(1) : file.caminho;
      const absolutePath = path.join(process.cwd(), relativePath);

      if (fs.existsSync(absolutePath)) {
        try {
          archive.file(absolutePath, { name: `files/${fileName}` });
          filesAdded++;
        } catch (error) {
          filesNotFound.push(fileName);
        }
      } else {
        filesNotFound.push(fileName);
      }
    }

    // Adiciona relatório se houver ficheiros em falta
    if (filesNotFound.length > 0) {
      archive.append(JSON.stringify({
        warning: 'Alguns ficheiros não foram encontrados',
        missingFiles: filesNotFound,
        filesFound: filesAdded,
        totalExpected: (fullItem.ficheiros || []).length
      }, null, 2), { name: 'WARNINGS.json' });
    }

    // Adiciona README
    archive.append(`# Dissemination Information Package (DIP)\n\n...`, { name: 'README.md' });

    await archive.finalize();

    await Log.create({
      message: `DIP gerado para o item ${fullItem.nome}`,
      level: 'download'
    });

  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Falha na geração do DIP',
        details: error.message 
      });
    }
  }
});

// Endpoint para informações do DIP (sem download)
router.get('/:id/info', conditionalAuth, checkItemAccess, async (req, res) => {
  try {
    // Usa o item já carregado pelo middleware
    const item = req.item;
    
    // Se precisar de mais dados, podemos carregar novamente
    const fullItem = await itemController.getItemById(item._id);

    const dipInfo = {
      itemId: fullItem._id,
      nome: fullItem.nome,
      tipoItem: fullItem.tipoItem,
      publico: fullItem.publico,
      totalFiles: fullItem.ficheiros?.length || 0,
      files: (fullItem.ficheiros || []).map(file => ({
        id: file._id,
        nome: path.basename(file.caminho),
        tipo: file.tipoFich,
        tamanho: file.tamanho,
        exists: fs.existsSync(path.isAbsolute(file.caminho) ? file.caminho : path.join(__dirname, '..', file.caminho))
      })),
      canDownload: true
    };

    res.json(dipInfo);
  } catch (error) {
    console.error('DIP info error:', error);
    res.status(500).json({ 
      error: 'Erro ao obter informações do DIP',
      details: error.message 
    });
  }
});

module.exports = router;