const mongoose = require('mongoose');

const FicheiroSchema = new mongoose.Schema({
    _id: {  
        type: String,
        required: true
    },
    tipoFich: {
        type: String,
        enum: ['video', 'imagem', 'documento'],
        required: true
    },
    caminho: {
        type: String,
        required: true
    },
    tamanho: {
        type: Number,
        required: true
    },
    item: {  
        type: String,
        ref: 'items'
    }
});  
module.exports = mongoose.model('files', FicheiroSchema);