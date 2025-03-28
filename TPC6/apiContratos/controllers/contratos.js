var Contrato = require('../models/contratos')

module.exports.getContratos = () => {
    return Contrato
        .find()
        .exec()
}

module.exports.getContratoById = id => {
    return Contrato
        .findById(id)
        .exec()
}

/*
module.exports.getContratosById = id => {
    return Contrato
        .findOne({ _id: id })
        .exec()
}
*/

module.exports.getContratoByEntidade = entidade => {
    return Contrato
        .find({NIPC_entidade_comunicante : entidade})
        .exec()
}

module.exports.getContratoByTipo = tipo => {
    return Contrato
        .find({tipoprocedimento : tipo})
        .exec()
}


module.exports.getEntidades = () => {
    return Contrato
        .distinct('entidade_comunicante')
        .sort({entidade_comunicante : 1})
        .exec()
}

module.exports.getTipos = () => {
    return Contrato
        .distinct('tipoprocedimento')
        .sort({tipoprocedimento : 1})
        .exec()
}

module.exports.insert = contr => {
    var novo = new Contrato(contr)
    return novo.save()
}

module.exports.update = (contr, id) => {
    return Contrato.findByIdAndUpdate
        (id, contr, {new: true}) //este new : true devolve o objeto já atualizado
        .exec()
}

module.exports.delete =  id => {
    return Contrato.findByIdAndDelete
        (id, {new: true}) //este new : true devolve o objeto já atualizado
        .exec()
}