var Aluno = require('../models/alunos');

module.exports.list = () => {
  return Aluno
    .find()
    .sort({nome: 1})
    .exec();
};

module.exports.findById = id => {
  return Aluno
    .findOne({_id: id})
    .exec();
};

module.exports.insert = aluno => {
  var newAluno = new Aluno(aluno);
  return newAluno.save();
};

module.exports.update = (id, aluno) => {
  return Aluno
    .findByIdAndUpdate(id, aluno, {new: true})
    .exec();
};

module.exports.delete = id => {
  return Aluno
    .findByIdAndDelete(id)
    .exec();
};
