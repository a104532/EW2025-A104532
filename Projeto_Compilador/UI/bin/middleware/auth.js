// Verificar se o usuário está autenticado
exports.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated() && req.user.active) {
      return next();
    }
    
    req.flash('error', 'Por favor faça login para acessar esta página');
    res.redirect('/auth/login');
  };
  
  // Verificar se o usuário NÃO está autenticado
  exports.forwardAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };
  
  // Verificar role de produtor
  exports.ensureProducer = (req, res, next) => {
    if (req.isAuthenticated() && (req.user.role === 'produtor' || req.user.role === 'admin')) {
      return next();
    }
    
    req.flash('error', 'Acesso não autorizado');
    res.redirect('/');
  };
  
  // Verificar role de admin
  exports.ensureAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    }
    
    req.flash('error', 'Acesso não autorizado');
    res.redirect('/');
  };