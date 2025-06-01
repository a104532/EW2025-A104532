const Log = require('../models/log');


exports.create = async (logData) => {
    const log = new Log(logData);
    await log.save();
    return log;
};

exports.getSystemLogs = () => {
    return Log.find()
        .sort({ timestamp: -1 })
        .limit();
};

exports.createNews = async (message) => {
    const log = new Log({
        message,
        level: 'news',
        publico: true
    });
    await log.save();
    return log;
}

exports.getNews = async () => {
    return Log.find({ level: 'news' })
        .sort({ timestamp: -1 })
        .limit(10)
        .exec();
}

exports.getPublicNews = async () => {
    return Log.find({ level: 'news', publico: true})
        .sort({ timestamp: -1 })
        .limit(10)
        .exec();
}

exports.toggleNewsVisibility = async (newsId) => {
    const news = await Log.findById(newsId);
    if (!news || news.level !== 'news') {
        throw new Error('Notícia não encontrada');
    }
    news.publico = !(news.publico); // Inverte a visibilidade
    await news.save();
    return news;
}

exports.getStats = async () => {
    const totalNews = await Log.countDocuments({ level: 'view' });
    const totalDownloads = await Log.countDocuments({ level: 'download'});

    return {
        totalNews,
        totalDownloads
    };
}