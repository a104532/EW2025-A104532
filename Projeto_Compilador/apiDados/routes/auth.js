const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/user');
const router = express.Router();

// Registro melhorado
router.post('/register', async (req, res) => {
    try {
      const { email, password, role = 'consumidor', socialProfiles } = req.body;
  
      // Validação básica
      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }
  
      // Cria o usuário usando o método especial do Passport-Local-Mongoose
      User.register(
        new User({
          _id: email.split('@')[0], // Gera ID do email
          email: email,
          role: role,
          auth: { method: 'local' },
          socialProfiles: socialProfiles || {} // Inclui os perfis sociais se fornecidos
        }), 
        password, // A senha será hasheada automaticamente
        (err, user) => {
          if (err) {
            return res.status(400).json({
              error: 'Erro no registro',
              details: err.message.includes('E11000') ? 'Email já registrado' : err.message
            });
          }
          
          // Se chegou aqui, registro foi bem-sucedido
          res.status(201).json({
            success: true,
            message: 'Usuário registrado com sucesso',
            user: {
              id: user._id,
              email: user.email,
              role: user.role,
              socialProfiles: user.socialProfiles // Inclui os perfis sociais na resposta
            }
          });
        }
      );
    } catch (err) {
      res.status(500).json({
        error: 'Erro interno no servidor',
        details: err.message
      });
    }
  });

// Login melhorado
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: info.message || 'Autenticação falhou' 
      });
    }

    // Gera token JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token: 'Bearer ' + token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  })(req, res, next);
});

// Para logar com o google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    console.log('\n=== DADOS DO USUÁRIO GOOGLE ===');
    console.log('User ID:', req.user._id);
    console.log('Email:', req.user.email);
    
    const token = jwt.sign(
      {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('\n=== TOKEN GERADO ===');
    console.log('Token JWT:', token);
    console.log('Tipo do token:', typeof token);
    
    res.redirect(`http://localhost:18000/auth/success?token=${token}&userId=${req.user._id}&email=${encodeURIComponent(req.user.email)}&role=${req.user.role}`);
  }
);

module.exports = router;