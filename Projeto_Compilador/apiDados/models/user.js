var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');


var UserSchema = new mongoose.Schema({
    _id : { //username
        type : String,
        required : true,
        unique: true
    },
    email : {
        type : String,
        required : true,
        unique: true, // email único
        match: /.+\@.+\..+/ // formato email
    },
    auth: {
        method: {
            type: String,
            enum: ['local', 'google'],
            default: 'local'
        },
        googleId: String,
        facebookId: String
    },
    socialProfiles: {
        strava: String,
        twitter: String,
        instagram: String
    },
    role: {                // Para controle de acesso
        type: String,
        enum: ['admin', 'produtor', 'consumidor'],
        default: 'consumidor'
    }
})

// Middleware para gerar username antes de salvar
UserSchema.pre('save', function(next) {
    if (this.isNew && !this.username) {
        // Extrai username do email (parte antes do @)
        this.username = this.email.split('@')[0].toLowerCase();
    }
    next();
});

UserSchema.plugin(passportLocalMongoose, {
    usernameField: 'email',
    usernameLowerCase: true
  });

module.exports = mongoose.model('users', UserSchema);