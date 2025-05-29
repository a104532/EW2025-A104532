const Contrato = require('../models/contrato');

module.exports.list = () => {
    return Contrato.find().sort({_id: 1})
        .then(res => res)
        .catch(err => {
            throw err;
        });
};

module.exports.getById = id => {
    return Contrato.findOne({_id: id})
        .then(res => res)
        .catch(err => {
            throw err;
        });
};

module.exports.getByEntidade = entidade => {
    return Contrato.find({NIPC_entidade_comunicante: entidade})
        .then(res => res)
        .catch(err => {
            throw err;
        });
};

module.exports.getByTipo = tipo => {
    return Contrato.find({tipoprocedimento: tipo})
        .then(res => res)
        .catch(err => {
            throw err;
        });
};

module.exports.listEntidades = () => {
    return Contrato.aggregate([
        { $group: {
            _id: {
                entidade: "$entidade_comunicante",
                nipc: "$NIPC_entidade_comunicante"
            }
        }},
        { $sort: { "_id.entidade": 1 } },
        { $project: {
            _id: 0,
            entidade: "$_id.entidade",
            nipc: "$_id.nipc"
        }}
    ])
    .then(res => res)
    .catch(err => {
        throw err;
    });
};

module.exports.listTipos = () => {
    return Contrato.find().distinct('tipoprocedimento')
        .then(res => res.sort())
        .catch(err => {
            throw err;
        });
};

module.exports.add = contrato => {
    return Contrato.create(contrato)
        .then(res => res)
        .catch(err => {
            throw err;
        });
};

module.exports.update = (id, contrato) => {
    return Contrato.updateOne({_id: id}, {$set: contrato})  // Adicionado $set
        .then(res => res)
        .catch(err => {
            throw err;
        });
};

module.exports.delete = id => {
    return Contrato.deleteOne({_id: id})
        .then(res => {
            if (res.deletedCount === 0) {
                throw new Error("Contrato não encontrado");
            }
            return res;
        })
        .catch(err => {
            throw err;
        });
};