var mongoose = require("mongoose")

var contratosSchema = new mongoose.Schema({
    _id : String,
    nomenAnuncio : String,
    tipoprocedimento: String,
    objetoContrato: String,
    dataPublicacao: String,
    dataCelebracaoContrato: String,
    precoContratual: Number,
    prazoExecucao: Number,
    NIPC_entidade_comunicante: String,
    entidade_comunicante: String,
    fundamentacao: String,
}, {versionKey: false})

module.exports = mongoose.model('contratos', contratosSchema)