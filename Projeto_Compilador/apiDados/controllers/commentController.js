const Comentario = require('../models/comment');
const Item = require('../models/item');
const Log = require('../models/log');

exports.createComment = async (commentData, userId) => {
    const comment = new Comentario({
        ...commentData,
        autor: userId,
        dataCriacao: new Date()
      });
    await comment.save();
    
    const item = await Item.findById(commentData.item);
    if (!item) {
        throw new Error('Item não encontrado');
    }

    item.comentarios.push(comment._id);
    await item.save();

    await Log.create({
        message: `Novo comentário adicionado ao item ${commentData.item}`,
        level: 'info'
    });
    
    return comment;
};

exports.getCommentById = async (commentId) => {
    const comment = await Comentario.findById(commentId).populate('autor', '_id nome email'); 
    return comment;
}

exports.deleteComment = async (commentId) => {
    const result = await Comentario.findByIdAndDelete(commentId);
    return result;
}

exports.getCommentsByItem = async (itemId) => {
    return Comentario.find({ item: itemId })
        .populate({
            path: 'autor',
            select: '_id email', 
            model: 'users'      
        })
        .sort({ dataCriacao: -1 });
};

exports.deleteCommentsOfUser = async (userId) => {
    const comments = await Comentario.find({ autor: userId });

    for (const comment of comments) {
        await Item.findByIdAndUpdate(
            comment.item,
            { $pull: { comentarios: comment._id } }
        );
    }

    return Comentario.deleteMany({ autor: userId });
}