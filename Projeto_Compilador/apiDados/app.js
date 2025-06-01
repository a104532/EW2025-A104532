var dotenv = require('dotenv');
dotenv.config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('./auth/passport');

var mongoDB = 'mongodb://localhost:27017/projetodb'; //nome da DB no MongoDB
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 60000,  // 60 segundos para tentar conectar ao MongoDB
  socketTimeoutMS: 60000,          // 60 segundos para resposta do banco
});

mongoose.connection.on('error', err => console.error('Erro MongoDB:', err));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

// Sessão e Autenticação
app.use(session({
  secret: process.env.SESSION_SECRET || 'EngWeb2025',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Alterar para true em produção com HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

//require('./auth/passport');

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/sip', require('./routes/sip'));
app.use('/api/dip', require('./routes/dip'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
