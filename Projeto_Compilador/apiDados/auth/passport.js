const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');

// Por que precisamos do Passport?
// 1. Gerencia estratégias de autenticação de forma padronizada
// 2. Fornece middlewares prontos para autenticação
// 3. Facilita a integração com múltiplos provedores (local, Google, Facebook)
// 4. Lida com sessões e serialização de usuários

// Estratégia Local (email/senha)
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    // 1. Encontre o usuário pelo email
    const user = await User.findOne({ email });
    
    // 2. Se não existir, retorne erro
    if (!user) {
      return done(null, false, { message: 'Email não registrado' });
    }
    
    // 3. Verifique a senha (usando o método do passport-local-mongoose)
    user.authenticate(password, (err, authenticated) => {
      if (err) return done(err);
      if (!authenticated) {
        return done(null, false, { message: 'Senha incorreta' });
      }
      return done(null, user);
    });
  } catch (err) {
    return done(err);
  }
}));

// Estratégia Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:17000/api/auth/google/callback",
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    // 1. Verifique se o usuário já existe pelo googleId
    let user = await User.findOne({ 'auth.googleId': profile.id });
    
    if (!user) {
      // 2. Se não existir, crie um novo usuário
      user = await User.create({
        _id: profile.emails[0].value.split('@')[0],
        email: profile.emails[0].value,
        auth: {
          method: 'google',
          googleId: profile.id
        },
        role: 'consumidor'
      });
    }
    
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

module.exports = passport;