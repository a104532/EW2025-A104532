const User = require('../models/user');
const Log = require('../models/log');

exports.getUsers = async () => {
    return User.find().select('-password -__v').lean();
};

exports.getUserById = async (userId) => {
    return User.findById(userId).select('-password -__v').lean();
};

exports.updateUser = async (userId, updates) => {
    return User.findByIdAndUpdate(
        userId, 
        updates, 
        { new: true, runValidators: true }
    ).select('-password -__v').lean();
};

exports.deleteUser = async (userId) => {
    return User.findByIdAndDelete(userId).lean();
};

exports.registerUser = async (userData) => {
    const existingUser = await User.findOne({ 
        $or: [{ email: userData.email }, { username: userData.username }] 
    });
    
    if (existingUser) {
        throw new Error('User already exists');
    }

    const user = new User(userData);
    await user.save();

    await Log.create({
        message: `Novo usuário registrado: ${user._id}`,
        level: 'info'
    });

    return user;
};

exports.getUserProfile = async (userId) => {
    return User.findById(userId)
        .select('-password -__v')
        .populate({
            path: 'items',
            select: 'nome dataCriacao tipoItem publico'
        });
};

exports.linkSocialAccount = async (userId, provider, profileId) => {
    return User.findByIdAndUpdate(
        userId,
        { 
            $set: { 
                [`auth.method`]: provider,
                [`auth.${provider}Id`]: profileId 
            } 
        },
        { new: true }
    ).select('-password -__v');
};