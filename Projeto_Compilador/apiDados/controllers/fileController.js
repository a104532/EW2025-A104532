const Ficheiro = require('../models/file');
const Item = require('../models/item');
const Log = require('../models/log');
const path = require('path');
const fs = require('fs');

exports.processFileUpload = async (fileData, itemId) => {
    const file = new Ficheiro({
        ...fileData,
        item: itemId
    });
    await file.save();

    await Item.findByIdAndUpdate(itemId, {
        $push: { ficheiros: file._id }
    });

    await Log.create({
        message: `Ficheiro ${file._id} adicionado ao item ${itemId}`,
        level: 'info'
    });

    return file;
};

exports.getFileForDownload = async (fileId) => {
    const file = await Ficheiro.findById(fileId);
    if (!file) throw new Error('Ficheiro não encontrado');

    const item = await Item.findById(file.item);
    if (!item.publico) throw new Error('Acesso não autorizado');

    return {
        path: file.caminho,
        name: path.basename(file.caminho),
        type: file.tipoFich
    };
};

exports.deleteFile = async (fileId, userId) => {
    const file = await Ficheiro.findById(fileId);
    if (!file) throw new Error('Ficheiro não encontrado');

    const item = await Item.findOne({
        _id: file.item,
        produtor: userId
    });
    if (!item) throw new Error('Não tem permissão');

    fs.unlinkSync(file.caminho);

    await Item.findByIdAndUpdate(file.item, {
        $pull: { ficheiros: fileId }
    });

    await Ficheiro.findByIdAndDelete(fileId);

    await Log.create({
        message: `Ficheiro ${fileId} removido do item ${file.item}`,
        level: 'info'
    });

    return true;
};