const express = require('express');
const router = express.Router();
const {verifyToken} = require('../auth/middleware');
const Comment = require('../controllers/commentController');

router.get('/:itemId', async (req, res) => {
    try {
      const comments = await Comment.getCommentsByItem(req.params.itemId);
      res.json(comments);
    } catch (err) {
      res.status(500).json({
        error: 'Erro ao buscar comentários',
        details: err.message
      });
    }
  });
  
  router.post('/:itemId', verifyToken, async (req, res) => {
    try {
      const commentData = {
        texto: req.body.texto,
        item: req.params.itemId
      };
      
      const comment = await Comment.createComment(commentData, req.userId);
      
      if (!comment) {
        return res.status(404).json({
          error: 'Item não encontrado ou não existe'
        });
      }
      
      res.status(201).json({
        success: true,
        comment: comment
      });
      
    } catch (err) {
      res.status(400).json({
        error: 'Erro ao criar comentário',
        details: err.message
      });
    }
  });
  
  router.delete('/:commentId', verifyToken, async (req, res) => {
    try {
      const comment = await Comment.getCommentById(req.params.commentId);
      
      if (!comment) {
        return res.status(404).json({
          error: 'Comentário não encontrado'
        });
      }
      
      const isOwner = comment.autor.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          error: 'Acesso negado. Você não pode remover este comentário.'
        });
      }
      
      await Comment.deleteComment(req.params.commentId);
      
      res.json({
        success: true,
        message: 'Comentário removido com sucesso'
      });
      
    } catch (err) {
      res.status(400).json({
        error: 'Erro ao remover comentário',
        details: err.message
      });
    }
  });
  
  module.exports = router;