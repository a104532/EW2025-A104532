var Book = require('../models/book');

module.exports.getBooks = () => {
    return Book.find().exec();
}

module.exports.getBookById = (id) => {
    return Book.findById(id).exec();
    //Outra opção (como sabemos que é só 1 resultado findOne em vez de find)
    //return Contrato.findOne({_id: id}).exec();
}

module.exports.getBooksByCharater = (charater) => {
    //find devolve lista (findOne devolve objeto)
    return Book.find({characters: charater}).exec();
}

module.exports.getBooksByGenre = (genre) => {
    return Book.find({genres: genre}).exec();
}

module.exports.getCharaters = () => {
    return Book
        .distinct("characters")
        .sort({characters: 1})
        .exec();
}

module.exports.getGenres = () => {
    return Book
        .distinct("genres")
        .sort({genres : 1})
        .exec();
}


module.exports.insert = (book) => {
    var bookToSave = new Book(book);
    return bookToSave.save();
}

module.exports.update = (book, id) => {
    //por default dá return ao objeto antes de ser atualizado
    //com {new: true} dá return ao objeto atual
    return Book.findByIdAndUpdate(id, book, {new: true}).exec();
}

module.exports.delete = (id) => {
    return Book.findByIdAndDelete(id, {new: true}).exec();
}
