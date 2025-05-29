const mongoose = require('mongoose');

const ContratoSchema = new mongoose.Schema({
  _id: Number,  // idcontrato
  nAnuncio: String,
  tipoprocedimento: String,
  objectoContrato: String,
  dataPublicacao: Date,
  dataCelebracaoContrato: Date,
  precoContratual: Number,
  prazoExecucao: Number,
  NIPC_entidade_comunicante: Number,
  entidade_comunicante: String,
  fundamentacao: String
}, { versionKey: false });

module.exports = mongoose.model('contratos', ContratoSchema);