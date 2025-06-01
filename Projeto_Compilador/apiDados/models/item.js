var mongoose = require('mongoose');

var ItemSchema = new mongoose.Schema({
    _id : {
        type : String,
        default: () => uuidv4() //para gerar um id único
    },
    nome : String,
    dataCriacao : {
        type : Date,
        required : true,
    },
    dataSubmissao : {
        type : Date,
        default : Date.now
    },
    tipoItem : {
        type : String,
        enum : ['Desporto', 'Cultura', 'Saúde', 'Educação', 'Tecnologia', 'Ciência'],
        required : true
    },
    descricaoItem: {
        type: String
    },
    ficheiros: [{
        type: String, // Ficheiros referenciados por ID (String)
        ref: 'files'
    }],
    produtor: {
        type: String,
        ref: 'users',
        required: true
    },
    publico : {
        type : Boolean,
        required : true,
        default : false
    },
    comentarios: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comments'
    }]
});

module.exports = mongoose.model('items', ItemSchema);