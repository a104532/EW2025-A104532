const express = require('express');
const multer = require('multer');
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Item = require('../models/item');
const File = require('../models/file');
const Log = require('../models/log');
const debug = require('debug')('app:sip');
const {verifyToken, checkRole, checkRoles} = require('../auth/middleware');

const router = express.Router();

// Configuração otimizada do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destPath = path.join(__dirname, '../uploads/temp');
    fs.mkdirSync(destPath, { recursive: true });
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    cb(null, `sip-${uuidv4()}.zip`);
  }
});

const fileFilter = (req, file, cb) => {
  const validMimeTypes = [
    'application/zip',
    'application/x-zip-compressed',
    'application/octet-stream'
  ];
  
  if (validMimeTypes.includes(file.mimetype) || 
      file.originalname.toLowerCase().endsWith('.zip')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only ZIP files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter
});

/**
 * @api {post} /api/sip Upload SIP package
 * @apiName UploadSIP
 * @apiGroup SIP
 * @apiDescription Process a Submission Information Package (SIP) in ZIP format
 * 
 * @apiHeader {String} Authorization Bearer token for authentication
 * @apiHeader {String} Content-Type multipart/form-data
 * 
 * @apiParam {File} sip ZIP file containing the SIP package
 * 
 * @apiSuccess {Boolean} success Operation status
 * @apiSuccess {String} itemId Created item ID
 * @apiSuccess {String} nome Item name
 * @apiSuccess {String} tipoItem Item type
 * @apiSuccess {Number} filesProcessed Number of processed files
 * 
 * @apiError (400) {String} error Error message
 * @apiError (400) {String} details Error details
 */

//auth.validate
router.post('/', verifyToken, checkRoles(['admin', 'produtor']), upload.single('sip'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      error: 'No file uploaded',
      details: 'The "sip" field with ZIP file is required'
    });
  }

  const tempPath = req.file.path;
  const userId = req.user._id || req.user.id;

  // Verificar se userId foi obtido corretamente
  if (!userId) {
    return res.status(400).json({ 
      error: 'User ID not found',
      details: 'Authentication failed - user ID missing'
    });
  }

  try {
    // 1. Read and validate ZIP
    const zipData = fs.readFileSync(tempPath);
    const zip = await JSZip.loadAsync(zipData);
    
    
    // 2. Validate manifest
    const manifestFile = zip.file(/manifesto-sip\.json/i)[0];
    if (!manifestFile) {
      throw new Error('Manifest file (manifesto-sip.json) not found in ZIP');
    }

    const manifest = JSON.parse(await manifestFile.async('text'));
    
    // 3. Validate required fields
    const requiredFields = ['nome', 'tipoItem'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validar se tipoItem é válido
    const validTypes = ['Desporto', 'Cultura', 'Saúde', 'Educação', 'Tecnologia', 'Ciência'];
    if (!validTypes.includes(manifest.tipoItem)) {
      throw new Error(`Invalid tipoItem. Must be one of: ${validTypes.join(', ')}`);
    }

    // 4. Create item in database
    const itemId = uuidv4();
    const itemData = {
      _id: itemId,
      nome: manifest.nome,
      tipoItem: manifest.tipoItem,
      descricaoItem: manifest.descricao || '',
      publico: manifest.publico || false,
      dataCriacao: manifest.dataCriacao ? new Date(manifest.dataCriacao) : new Date(),
      dataSubmissao: new Date(),
      produtor: userId // CORREÇÃO: Garantir que userId não seja undefined
    };

    const item = new Item(itemData);
    await item.save();

    // 5. Process files
    const filesDir = path.join(__dirname, '../uploads/items', itemId);
    fs.mkdirSync(filesDir, { recursive: true });

    const processedFiles = [];
    for (const fileInfo of manifest.ficheiros || []) {
      
      // Tentar encontrar o arquivo no ZIP (case-insensitive)
      let zipFile = zip.file(fileInfo.caminho);
      
      // Se não encontrar, tentar buscar por todos os arquivos do ZIP
      if (!zipFile) {
        const allFiles = Object.keys(zip.files);
        console.log('Available files in ZIP:', allFiles); // Debug
        
        // Procurar arquivo ignorando case e caminhos relativos
        const fileName = path.basename(fileInfo.caminho);
        const foundFile = allFiles.find(f => {
          const zipFileName = path.basename(f);
          return zipFileName.toLowerCase() === fileName.toLowerCase() && !zip.files[f].dir;
        });
        
        if (foundFile) {
          zipFile = zip.file(foundFile);
          console.log(`Found file with different path: ${foundFile}`); // Debug
        }
      }
      
      if (!zipFile) {
        console.warn(`File not found in ZIP: ${fileInfo.caminho}`);
        console.warn('Available files:', Object.keys(zip.files).filter(f => !zip.files[f].dir));
        continue;
      }

      try {
        const fileBuffer = await zipFile.async('nodebuffer');
        const fileName = path.basename(fileInfo.caminho);
        const filePath = path.join(filesDir, fileName);
        fs.writeFileSync(filePath, fileBuffer);

        console.log(`File saved: ${fileName} (${fileBuffer.length} bytes)`); // Debug

        const fileData = {
          _id: uuidv4(),
          tipoFich: fileInfo.tipo || 'documento',
          caminho: filePath.replace(path.join(__dirname, '..'), ''), // Store relative path
          tamanho: fileBuffer.length,
          item: itemId
        };

        const file = new File(fileData);
        await file.save();
        processedFiles.push(file._id);

        new Log({
          message: `File processed: ${fileName}`,
          level: 'news',
          publico: false,
          timestamp: new Date()
        }).save();

      } catch (fileError) {
        console.error(`Error processing file ${fileInfo.caminho}:`, fileError);
        continue;
      }
    }

    // 6. Update item with files
    item.ficheiros = processedFiles;
    await item.save();

    // 7. Log the operation
    const log = new Log({
      message: `SIP processed: ${manifest.nome}`,
      level: 'info',
      publico: false,
      timestamp: new Date()
    });
    await log.save();

    // 8. Cleanup
    fs.unlinkSync(tempPath);

    // 9. Return success response
    return res.status(201).json({
      success: true,
      itemId: itemId,
      nome: manifest.nome,
      tipoItem: manifest.tipoItem,
      filesProcessed: processedFiles.length
    });

  } catch (error) {
    console.error('SIP processing error:', error); // Debug log
    
    // Error handling and cleanup
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch (e) { debug('Cleanup error:', e); }
    }

    // Log the error
    try {
      const errorLog = new Log({
        message: `SIP processing failed: ${error.message}`,
        level: 'error', // Mudado de volta para 'error'
        publico: false,
        timestamp: new Date()
      });
      await errorLog.save();
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return res.status(400).json({ 
      error: 'SIP processing failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;