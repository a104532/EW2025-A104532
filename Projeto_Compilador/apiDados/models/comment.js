var mongoose = require('mongoose');

var ComentarioSchema = new mongoose.Schema(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId(), // Gera um ID único
        },
        texto: {
            type: String,
            required: true,
        },
        autor: {
            type: String,
            ref: 'users', // Referencia ao modelo User
            required: true,
        },
        dataCriacao: {
            type: Date,
            default: Date.now,
        },
        item: {
            type: String,
            ref: 'items', // Referencia ao modelo Item
            required: true,
        },
    },
    {
        timestamps: true, // Adiciona createdAt e updatedAt automaticamente
    }
);

module.exports = mongoose.model('comments', ComentarioSchema);