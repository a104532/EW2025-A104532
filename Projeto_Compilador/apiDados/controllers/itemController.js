const Item = require('../models/item');
const Log = require('../models/log');

exports.getAllItems = () => {
    return Item.find()
        .populate('ficheiros')
        .populate('produtor', 'username')
        .sort({ dataCriacao: -1 })
        .exec();
}

exports.getPublicItems = () => {
    return Item.find({ publico: true })
        .populate('ficheiros')
        .populate('produtor', 'username')
        .sort({ dataCriacao: -1 })
        .exec();
};

exports.getItemById = (itemId) => {
    return Item.findById(itemId) 
      .populate('produtor', 'username email')
      .populate('ficheiros')
      .populate({
        path: 'comentarios',
        populate: { path: 'autor', select: 'username' }
      })
      .exec(); 
}

exports.createItem = async (itemData, userId) => {
    const item = new Item({
        ...itemData,
        produtor: userId,
    });
    await item.save();

    await Log.create({
        message: `Novo item criado: ${item._id}`,
        level: 'info'
    });

    return item;
};

exports.updateItem = (itemId, userId, updateData) => {
    return Item.findOneAndUpdate(
        { _id: itemId, produtor: userId },
        updateData,
        { new: true, runValidators: true }
    )
    .populate('produtor', 'username')
    .exec()
    .then(item => {
        if (!item) throw new Error('Item não encontrado ou sem permissão');
        return item;
    });
};

exports.deleteItem = (itemId, userId) => {
    return Item.findOneAndDelete({ _id: itemId, produtor: userId })
        .exec()
        .then(item => {
            if (item) {
                return Log.create({
                    message: `Item ${itemId} removido pelo usuário ${userId}`,
                    level: 'info'
                }).then(() => item);
            }
            return item;
        });
};

exports.toggleVisibility = (itemId, userId) => {
    return Item.findOne({ _id: itemId, produtor: userId })
        .exec()
        .then(item => {
            if (!item) throw new Error('Item não encontrado ou sem permissão');
            item.publico = !item.publico;
            return item.save();
        })
        .then(item => {
            return Log.create({
                message: `Visibilidade alterada para ${item.publico ? 'público' : 'privado'}`,
                level: 'info'
            }).then(() => item);
        });
};

exports.prepareExportPackage = (itemId, userId) => {
    return Item.findOne({ _id: itemId, produtor: userId })
        .populate('ficheiros')
        .exec()
        .then(item => {
            if (!item) throw new Error('Item não encontrado ou sem permissão');
            
            return {
                manifest: {
                    itemId: item._id,
                    nome: item.nome,
                    tipo: item.tipoItem,
                    dataCriacao: item.dataCriacao,
                    ficheiros: item.ficheiros.map(f => ({
                        id: f._id,
                        tipo: f.tipoFich,
                        caminho: f.caminho
                    }))
                },
                files: item.ficheiros
            };
        });
};